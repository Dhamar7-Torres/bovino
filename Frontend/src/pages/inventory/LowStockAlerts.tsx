import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  AlertCircle,
  XCircle,
  Clock,
  Package,
  CheckCircle,
  X,
  Check,
  Eye,
  RefreshCw,
  Filter,
  Search,
  Bell,
  MapPin,
  TrendingDown,
  TrendingUp,
  Activity,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { getMainBackgroundClasses, CSS_CLASSES } from "../../components/layout";

// Interfaces para el sistema de alertas
interface InventoryAlert {
  id: string;
  itemId: string;
  itemName: string;
  category: string;
  alertType: AlertType;
  priority: AlertPriority;
  title: string;
  description: string;
  currentValue: number;
  threshold: number;
  status: AlertStatus;
  location: string;
  createdAt: Date;
  lastUpdated: Date;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  suppressedUntil?: Date;
  actions: string[];
  notifiedUsers: string[];
  estimatedImpact: ImpactLevel;
  automatedActions: AutomatedAction[];
  relatedAlerts: string[];
  notes: AlertNote[];
}

interface AlertNote {
  id: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  isSystem: boolean;
}

interface AutomatedAction {
  id: string;
  type: "purchase_order" | "transfer_request" | "notification" | "escalation";
  description: string;
  status: "pending" | "executed" | "failed";
  scheduledAt: Date;
  executedAt?: Date;
  result?: string;
}

interface AlertMetrics {
  totalAlerts: number;
  activeAlerts: number;
  criticalAlerts: number;
  resolvedToday: number;
  averageResolutionTime: number; // horas
  alertsByType: Array<{
    type: AlertType;
    count: number;
    percentage: number;
  }>;
  alertsByPriority: Array<{
    priority: AlertPriority;
    count: number;
    percentage: number;
  }>;
  trendsLast7Days: Array<{
    date: string;
    count: number;
  }>;
}

interface AlertThreshold {
  itemId?: string;
  category?: string;
  location?: string;
  alertType: AlertType;
  threshold: number;
  unit: string;
  isEnabled: boolean;
  escalationRules: EscalationRule[];
}

interface EscalationRule {
  id: string;
  delayHours: number;
  targetUsers: string[];
  targetRoles: string[];
  escalationLevel: number;
  notificationMethods: NotificationMethod[];
}

// Enums
enum AlertType {
  LOW_STOCK = "low_stock",
  OUT_OF_STOCK = "out_of_stock",
  OVERSTOCKED = "overstocked",
  EXPIRING_SOON = "expiring_soon",
  EXPIRED = "expired",
  NEGATIVE_STOCK = "negative_stock",
  SLOW_MOVING = "slow_moving",
  FAST_MOVING = "fast_moving",
  COST_VARIANCE = "cost_variance",
  QUALITY_ISSUE = "quality_issue",
}

enum AlertPriority {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

enum AlertStatus {
  ACTIVE = "active",
  ACKNOWLEDGED = "acknowledged",
  RESOLVED = "resolved",
  SUPPRESSED = "suppressed",
  ARCHIVED = "archived",
}

enum ImpactLevel {
  MINIMAL = "minimal",
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

enum NotificationMethod {
  EMAIL = "email",
  SMS = "sms",
  PUSH = "push",
  IN_APP = "in_app",
  SLACK = "slack",
  WEBHOOK = "webhook",
}

const LowStockAlerts: React.FC = () => {
  // Estados del componente
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [alertMetrics, setAlertMetrics] = useState<AlertMetrics | null>(null);
  const [] = useState<AlertThreshold[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [activeView, setActiveView] = useState<"list" | "metrics" | "settings">(
    "list"
  );
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    type: "all",
    location: "all",
    dateRange: "7d",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Efectos y carga de datos
  useEffect(() => {
    const loadAlertsData = async () => {
      try {
        setIsLoading(true);

        // Simular carga de datos
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Datos simulados de alertas
        const mockAlerts: InventoryAlert[] = [
          {
            id: "1",
            itemId: "med-001",
            itemName: "Ivermectina 1% - 50ml",
            category: "Medicamentos",
            alertType: AlertType.LOW_STOCK,
            priority: AlertPriority.HIGH,
            title: "Stock Crítico - Ivermectina",
            description:
              "Stock actual por debajo del 20% del mínimo establecido",
            currentValue: 3,
            threshold: 15,
            status: AlertStatus.ACTIVE,
            location: "Farmacia Veterinaria",
            createdAt: new Date("2025-07-12T08:30:00"),
            lastUpdated: new Date("2025-07-12T08:30:00"),
            actions: [
              "Generar orden de compra urgente",
              "Verificar stock en otras ubicaciones",
              "Contactar proveedor principal",
              "Evaluar necesidad de proveedor alternativo",
            ],
            notifiedUsers: ["dr.garcia@farm.com", "admin@farm.com"],
            estimatedImpact: ImpactLevel.HIGH,
            automatedActions: [
              {
                id: "auto-1",
                type: "purchase_order",
                description: "Orden de compra automática generada",
                status: "pending",
                scheduledAt: new Date("2025-07-12T14:00:00"),
              },
            ],
            relatedAlerts: [],
            notes: [
              {
                id: "note-1",
                content:
                  "Último uso registrado en vacunación del Potrero Norte",
                createdBy: "Sistema",
                createdAt: new Date("2025-07-12T08:35:00"),
                isSystem: true,
              },
            ],
          },
          {
            id: "2",
            itemId: "vac-003",
            itemName: "Vacuna Triple Bovina",
            category: "Vacunas",
            alertType: AlertType.EXPIRING_SOON,
            priority: AlertPriority.MEDIUM,
            title: "Vencimiento Próximo - Vacuna Triple",
            description: "Lote VT-2024-07 vence en 12 días",
            currentValue: 12,
            threshold: 30,
            status: AlertStatus.ACKNOWLEDGED,
            location: "Almacén Principal",
            createdAt: new Date("2025-07-11T14:20:00"),
            lastUpdated: new Date("2025-07-12T09:15:00"),
            acknowledgedBy: "Dr. García",
            acknowledgedAt: new Date("2025-07-12T09:15:00"),
            actions: [
              "Programar vacunación prioritaria",
              "Verificar posibilidad de devolución",
              "Evaluar descuento para uso inmediato",
              "Planificar disposición segura si es necesario",
            ],
            notifiedUsers: ["dr.garcia@farm.com", "vet.lopez@farm.com"],
            estimatedImpact: ImpactLevel.MEDIUM,
            automatedActions: [],
            relatedAlerts: [],
            notes: [
              {
                id: "note-2",
                content: "Programar uso en la próxima jornada de vacunación",
                createdBy: "Dr. García",
                createdAt: new Date("2025-07-12T09:16:00"),
                isSystem: false,
              },
            ],
          },
          {
            id: "3",
            itemId: "sup-005",
            itemName: "Concentrado Proteico 20kg",
            category: "Suplementos",
            alertType: AlertType.OUT_OF_STOCK,
            priority: AlertPriority.CRITICAL,
            title: "Sin Stock - Concentrado Proteico",
            description: "Stock agotado completamente, afecta alimentación",
            currentValue: 0,
            threshold: 50,
            status: AlertStatus.ACTIVE,
            location: "Almacén de Alimentos",
            createdAt: new Date("2025-07-12T06:00:00"),
            lastUpdated: new Date("2025-07-12T06:00:00"),
            actions: [
              "Compra urgente inmediata",
              "Buscar sustituto temporal",
              "Ajustar dieta del ganado",
              "Contactar múltiples proveedores",
            ],
            notifiedUsers: ["manager@farm.com", "nutrition@farm.com"],
            estimatedImpact: ImpactLevel.CRITICAL,
            automatedActions: [
              {
                id: "auto-2",
                type: "notification",
                description: "Notificación enviada a gerencia",
                status: "executed",
                scheduledAt: new Date("2025-07-12T06:05:00"),
                executedAt: new Date("2025-07-12T06:05:00"),
                result: "Notificación enviada correctamente",
              },
            ],
            relatedAlerts: [],
            notes: [],
          },
          {
            id: "4",
            itemId: "med-007",
            itemName: "Antibiótico Penicilina G",
            category: "Medicamentos",
            alertType: AlertType.EXPIRED,
            priority: AlertPriority.HIGH,
            title: "Medicamento Vencido",
            description: "Lote PEN-2024-03 venció hace 2 días",
            currentValue: -2,
            threshold: 0,
            status: AlertStatus.ACTIVE,
            location: "Farmacia Veterinaria",
            createdAt: new Date("2025-07-10T00:00:00"),
            lastUpdated: new Date("2025-07-10T00:00:00"),
            actions: [
              "Retirar inmediatamente del inventario",
              "Disposición segura según protocolo",
              "Actualizar registro de pérdidas",
              "Revisar otros lotes del mismo medicamento",
            ],
            notifiedUsers: ["dr.garcia@farm.com", "quality@farm.com"],
            estimatedImpact: ImpactLevel.MEDIUM,
            automatedActions: [],
            relatedAlerts: [],
            notes: [],
          },
          {
            id: "5",
            itemId: "equ-012",
            itemName: "Jeringas Desechables 10ml",
            category: "Equipos",
            alertType: AlertType.SLOW_MOVING,
            priority: AlertPriority.LOW,
            title: "Movimiento Lento",
            description: "Sin movimientos en 90 días, evaluar nivel de stock",
            currentValue: 90,
            threshold: 60,
            status: AlertStatus.ACTIVE,
            location: "Almacén General",
            createdAt: new Date("2025-07-09T12:00:00"),
            lastUpdated: new Date("2025-07-09T12:00:00"),
            actions: [
              "Revisar niveles de reorden",
              "Evaluar necesidad real",
              "Considerar descontinuación",
              "Analizar demanda histórica",
            ],
            notifiedUsers: ["admin@farm.com"],
            estimatedImpact: ImpactLevel.LOW,
            automatedActions: [],
            relatedAlerts: [],
            notes: [],
          },
        ];

        const mockMetrics: AlertMetrics = {
          totalAlerts: 15,
          activeAlerts: 8,
          criticalAlerts: 2,
          resolvedToday: 3,
          averageResolutionTime: 6.5,
          alertsByType: [
            { type: AlertType.LOW_STOCK, count: 6, percentage: 40 },
            { type: AlertType.EXPIRING_SOON, count: 4, percentage: 26.7 },
            { type: AlertType.OUT_OF_STOCK, count: 2, percentage: 13.3 },
            { type: AlertType.EXPIRED, count: 2, percentage: 13.3 },
            { type: AlertType.SLOW_MOVING, count: 1, percentage: 6.7 },
          ],
          alertsByPriority: [
            { priority: AlertPriority.CRITICAL, count: 2, percentage: 25 },
            { priority: AlertPriority.HIGH, count: 3, percentage: 37.5 },
            { priority: AlertPriority.MEDIUM, count: 2, percentage: 25 },
            { priority: AlertPriority.LOW, count: 1, percentage: 12.5 },
          ],
          trendsLast7Days: [
            { date: "2025-07-06", count: 4 },
            { date: "2025-07-07", count: 6 },
            { date: "2025-07-08", count: 5 },
            { date: "2025-07-09", count: 7 },
            { date: "2025-07-10", count: 8 },
            { date: "2025-07-11", count: 6 },
            { date: "2025-07-12", count: 8 },
          ],
        };

        setAlerts(mockAlerts);
        setAlertMetrics(mockMetrics);
      } catch (error) {
        console.error("Error cargando datos de alertas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAlertsData();
  }, []);

  // Funciones auxiliares
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours =
      Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Hace menos de 1 hora";
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} día${diffInDays > 1 ? "s" : ""}`;
    }
  };

  const getAlertTypeIcon = (type: AlertType) => {
    switch (type) {
      case AlertType.LOW_STOCK:
        return <TrendingDown className="w-5 h-5" />;
      case AlertType.OUT_OF_STOCK:
        return <XCircle className="w-5 h-5" />;
      case AlertType.EXPIRING_SOON:
        return <Clock className="w-5 h-5" />;
      case AlertType.EXPIRED:
        return <X className="w-5 h-5" />;
      case AlertType.SLOW_MOVING:
        return <Activity className="w-5 h-5" />;
      case AlertType.OVERSTOCKED:
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getAlertTypeLabel = (type: AlertType) => {
    switch (type) {
      case AlertType.LOW_STOCK:
        return "Stock Bajo";
      case AlertType.OUT_OF_STOCK:
        return "Sin Stock";
      case AlertType.EXPIRING_SOON:
        return "Por Vencer";
      case AlertType.EXPIRED:
        return "Vencido";
      case AlertType.SLOW_MOVING:
        return "Movimiento Lento";
      case AlertType.OVERSTOCKED:
        return "Sobrestockeado";
      case AlertType.NEGATIVE_STOCK:
        return "Stock Negativo";
      case AlertType.FAST_MOVING:
        return "Movimiento Rápido";
      case AlertType.COST_VARIANCE:
        return "Variación de Costo";
      case AlertType.QUALITY_ISSUE:
        return "Problema de Calidad";
      default:
        return "Desconocido";
    }
  };

  const getPriorityColor = (priority: AlertPriority) => {
    switch (priority) {
      case AlertPriority.CRITICAL:
        return {
          bg: "bg-red-50",
          border: "border-l-red-500",
          text: "text-red-700",
          badge: "bg-red-100 text-red-800",
          icon: "text-red-500",
        };
      case AlertPriority.HIGH:
        return {
          bg: "bg-orange-50",
          border: "border-l-orange-500",
          text: "text-orange-700",
          badge: "bg-orange-100 text-orange-800",
          icon: "text-orange-500",
        };
      case AlertPriority.MEDIUM:
        return {
          bg: "bg-yellow-50",
          border: "border-l-yellow-500",
          text: "text-yellow-700",
          badge: "bg-yellow-100 text-yellow-800",
          icon: "text-yellow-500",
        };
      case AlertPriority.LOW:
        return {
          bg: "bg-blue-50",
          border: "border-l-blue-500",
          text: "text-blue-700",
          badge: "bg-blue-100 text-blue-800",
          icon: "text-blue-500",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-l-gray-500",
          text: "text-gray-700",
          badge: "bg-gray-100 text-gray-800",
          icon: "text-gray-500",
        };
    }
  };

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.ACTIVE:
        return "bg-red-100 text-red-800";
      case AlertStatus.ACKNOWLEDGED:
        return "bg-yellow-100 text-yellow-800";
      case AlertStatus.RESOLVED:
        return "bg-green-100 text-green-800";
      case AlertStatus.SUPPRESSED:
        return "bg-gray-100 text-gray-800";
      case AlertStatus.ARCHIVED:
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.ACTIVE:
        return "Activa";
      case AlertStatus.ACKNOWLEDGED:
        return "Reconocida";
      case AlertStatus.RESOLVED:
        return "Resuelta";
      case AlertStatus.SUPPRESSED:
        return "Suprimida";
      case AlertStatus.ARCHIVED:
        return "Archivada";
      default:
        return "Desconocido";
    }
  };

  const handleSelectAlert = (alertId: string) => {
    const newSelected = new Set(selectedAlerts);
    if (newSelected.has(alertId)) {
      newSelected.delete(alertId);
    } else {
      newSelected.add(alertId);
    }
    setSelectedAlerts(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    const filteredAlertIds = filteredAlerts.map((alert) => alert.id);
    if (selectedAlerts.size === filteredAlertIds.length) {
      setSelectedAlerts(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedAlerts(new Set(filteredAlertIds));
      setShowBulkActions(true);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      setIsProcessing(true);
      // Simular API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId
            ? {
                ...alert,
                status: AlertStatus.ACKNOWLEDGED,
                acknowledgedBy: "Usuario Actual",
                acknowledgedAt: new Date(),
              }
            : alert
        )
      );
    } catch (error) {
      console.error("Error reconociendo alerta:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      setIsProcessing(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId
            ? {
                ...alert,
                status: AlertStatus.RESOLVED,
                resolvedBy: "Usuario Actual",
                resolvedAt: new Date(),
              }
            : alert
        )
      );
    } catch (error) {
      console.error("Error resolviendo alerta:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAction = async (
    action: "acknowledge" | "resolve" | "suppress" | "delete"
  ) => {
    try {
      setIsProcessing(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const selectedIds = Array.from(selectedAlerts);

      switch (action) {
        case "acknowledge":
          setAlerts((prev) =>
            prev.map((alert) =>
              selectedIds.includes(alert.id)
                ? {
                    ...alert,
                    status: AlertStatus.ACKNOWLEDGED,
                    acknowledgedBy: "Usuario Actual",
                    acknowledgedAt: new Date(),
                  }
                : alert
            )
          );
          break;
        case "resolve":
          setAlerts((prev) =>
            prev.map((alert) =>
              selectedIds.includes(alert.id)
                ? {
                    ...alert,
                    status: AlertStatus.RESOLVED,
                    resolvedBy: "Usuario Actual",
                    resolvedAt: new Date(),
                  }
                : alert
            )
          );
          break;
        case "suppress":
          setAlerts((prev) =>
            prev.map((alert) =>
              selectedIds.includes(alert.id)
                ? {
                    ...alert,
                    status: AlertStatus.SUPPRESSED,
                    suppressedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
                  }
                : alert
            )
          );
          break;
        case "delete":
          setAlerts((prev) =>
            prev.filter((alert) => !selectedIds.includes(alert.id))
          );
          break;
      }

      setSelectedAlerts(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error(`Error ejecutando acción en lote ${action}:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtrado de alertas
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filters.status === "all" || alert.status === filters.status;
    const matchesPriority =
      filters.priority === "all" || alert.priority === filters.priority;
    const matchesType =
      filters.type === "all" || alert.alertType === filters.type;
    const matchesLocation =
      filters.location === "all" || alert.location === filters.location;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesType &&
      matchesLocation
    );
  });

  if (isLoading) {
    return (
      <div className={`min-h-screen ${getMainBackgroundClasses()}`}>
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getMainBackgroundClasses()}`}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-sm mb-2">
                Alertas de Stock Bajo
              </h1>
              <p className="text-white/90 text-lg">
                Gestión y monitoreo de alertas de inventario en tiempo real
              </p>
            </div>

            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              {/* Selector de vista */}
              <div className="flex bg-white/20 rounded-lg p-1 backdrop-blur-sm">
                <button
                  onClick={() => setActiveView("list")}
                  className={`px-4 py-2 rounded-md transition-all duration-200 ${
                    activeView === "list"
                      ? "bg-white text-gray-900"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setActiveView("metrics")}
                  className={`px-4 py-2 rounded-md transition-all duration-200 ${
                    activeView === "metrics"
                      ? "bg-white text-gray-900"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  Métricas
                </button>
                <button
                  onClick={() => setActiveView("settings")}
                  className={`px-4 py-2 rounded-md transition-all duration-200 ${
                    activeView === "settings"
                      ? "bg-white text-gray-900"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  Configuración
                </button>
              </div>

              {/* Botón de actualizar */}
              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-200 flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Actualizar</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Métricas Rápidas */}
        {alertMetrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
          >
            <div className={`${CSS_CLASSES.card} p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Alertas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {alertMetrics.totalAlerts}
                  </p>
                </div>
                <Bell className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className={`${CSS_CLASSES.card} p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Activas</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {alertMetrics.activeAlerts}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            <div className={`${CSS_CLASSES.card} p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Críticas</p>
                  <p className="text-2xl font-bold text-red-600">
                    {alertMetrics.criticalAlerts}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className={`${CSS_CLASSES.card} p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Resueltas Hoy</p>
                  <p className="text-2xl font-bold text-green-600">
                    {alertMetrics.resolvedToday}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className={`${CSS_CLASSES.card} p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Tiempo Prom.</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {alertMetrics.averageResolutionTime.toFixed(1)}h
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Vista de Lista */}
        {activeView === "list" && (
          <>
            {/* Controles y Filtros */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`${CSS_CLASSES.card} p-6 mb-6`}
            >
              {/* Barra superior de controles */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  {/* Checkbox para seleccionar todo */}
                  <input
                    type="checkbox"
                    checked={
                      selectedAlerts.size === filteredAlerts.length &&
                      filteredAlerts.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">
                    {selectedAlerts.size > 0
                      ? `${selectedAlerts.size} seleccionadas`
                      : "Seleccionar todo"}
                  </span>

                  {showBulkActions && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleBulkAction("acknowledge")}
                        disabled={isProcessing}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm hover:bg-yellow-200 transition-colors duration-200 disabled:opacity-50"
                      >
                        Reconocer
                      </button>
                      <button
                        onClick={() => handleBulkAction("resolve")}
                        disabled={isProcessing}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm hover:bg-green-200 transition-colors duration-200 disabled:opacity-50"
                      >
                        Resolver
                      </button>
                      <button
                        onClick={() => handleBulkAction("suppress")}
                        disabled={isProcessing}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
                      >
                        Suprimir
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {/* Búsqueda */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar alertas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Botón de filtros */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2 border rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
                      showFilters
                        ? "bg-blue-50 border-blue-300 text-blue-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filtros</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        showFilters ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Panel de filtros expandible */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-200 pt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">Todos</option>
                        <option value="active">Activas</option>
                        <option value="acknowledged">Reconocidas</option>
                        <option value="resolved">Resueltas</option>
                        <option value="suppressed">Suprimidas</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prioridad
                      </label>
                      <select
                        value={filters.priority}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            priority: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">Todas</option>
                        <option value="critical">Crítica</option>
                        <option value="high">Alta</option>
                        <option value="medium">Media</option>
                        <option value="low">Baja</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo
                      </label>
                      <select
                        value={filters.type}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            type: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">Todos</option>
                        <option value="low_stock">Stock Bajo</option>
                        <option value="out_of_stock">Sin Stock</option>
                        <option value="expiring_soon">Por Vencer</option>
                        <option value="expired">Vencido</option>
                        <option value="slow_moving">Movimiento Lento</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ubicación
                      </label>
                      <select
                        value={filters.location}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">Todas</option>
                        <option value="Farmacia Veterinaria">
                          Farmacia Veterinaria
                        </option>
                        <option value="Almacén Principal">
                          Almacén Principal
                        </option>
                        <option value="Almacén de Alimentos">
                          Almacén de Alimentos
                        </option>
                        <option value="Almacén General">Almacén General</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Período
                      </label>
                      <select
                        value={filters.dateRange}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            dateRange: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="1d">Último día</option>
                        <option value="7d">Últimos 7 días</option>
                        <option value="30d">Últimos 30 días</option>
                        <option value="90d">Últimos 90 días</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Lista de Alertas */}
            <div className="space-y-4">
              {filteredAlerts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`${CSS_CLASSES.card} p-12 text-center`}
                >
                  <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No hay alertas que mostrar
                  </h3>
                  <p className="text-gray-500">
                    No se encontraron alertas que coincidan con los filtros
                    aplicados
                  </p>
                </motion.div>
              ) : (
                filteredAlerts.map((alert, index) => {
                  const priorityColors = getPriorityColor(alert.priority);
                  const isExpanded = expandedAlert === alert.id;

                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      className={`${CSS_CLASSES.card} border-l-4 ${priorityColors.border} ${priorityColors.bg} hover:shadow-lg transition-all duration-200`}
                    >
                      <div className="p-6">
                        {/* Header de la alerta */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            {/* Checkbox de selección */}
                            <input
                              type="checkbox"
                              checked={selectedAlerts.has(alert.id)}
                              onChange={() => handleSelectAlert(alert.id)}
                              className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />

                            {/* Icono de tipo de alerta */}
                            <div className={`mt-1 ${priorityColors.icon}`}>
                              {getAlertTypeIcon(alert.alertType)}
                            </div>

                            {/* Contenido principal */}
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3
                                  className={`text-lg font-semibold ${priorityColors.text}`}
                                >
                                  {alert.title}
                                </h3>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors.badge}`}
                                >
                                  {alert.priority.toUpperCase()}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                                    alert.status
                                  )}`}
                                >
                                  {getStatusLabel(alert.status)}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                  {getAlertTypeLabel(alert.alertType)}
                                </span>
                              </div>

                              <p className="text-gray-700 mb-3">
                                {alert.description}
                              </p>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Package className="w-4 h-4" />
                                  <span>
                                    <strong>Item:</strong> {alert.itemName}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="w-4 h-4" />
                                  <span>
                                    <strong>Ubicación:</strong> {alert.location}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    <strong>Creada:</strong>{" "}
                                    {formatRelativeTime(alert.createdAt)}
                                  </span>
                                </div>
                              </div>

                              {/* Valores actuales vs umbrales */}
                              <div className="mt-3 p-3 bg-white/50 rounded-lg">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">
                                    <strong>Valor Actual:</strong>{" "}
                                    {alert.currentValue}
                                  </span>
                                  <span className="text-gray-600">
                                    <strong>Umbral:</strong> {alert.threshold}
                                  </span>
                                  <span
                                    className={`font-medium ${
                                      alert.currentValue < alert.threshold
                                        ? "text-red-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {alert.currentValue < alert.threshold
                                      ? "Por debajo"
                                      : "Dentro del rango"}
                                  </span>
                                </div>
                              </div>

                              {/* Estados especiales */}
                              {alert.acknowledgedBy && (
                                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                                  <span className="text-yellow-800">
                                    <strong>Reconocida por:</strong>{" "}
                                    {alert.acknowledgedBy} •{" "}
                                    {formatDate(alert.acknowledgedAt!)}
                                  </span>
                                </div>
                              )}

                              {alert.resolvedBy && (
                                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg text-sm">
                                  <span className="text-green-800">
                                    <strong>Resuelta por:</strong>{" "}
                                    {alert.resolvedBy} •{" "}
                                    {formatDate(alert.resolvedAt!)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Acciones rápidas */}
                          <div className="flex items-center space-x-2 ml-4">
                            {alert.status === AlertStatus.ACTIVE && (
                              <>
                                <button
                                  onClick={() =>
                                    handleAcknowledgeAlert(alert.id)
                                  }
                                  disabled={isProcessing}
                                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                  title="Reconocer"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleResolveAlert(alert.id)}
                                  disabled={isProcessing}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                  title="Resolver"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            <button
                              onClick={() =>
                                setExpandedAlert(isExpanded ? null : alert.id)
                              }
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title={isExpanded ? "Contraer" : "Expandir"}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                              title="Más opciones"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Sección expandible */}
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-6 pt-6 border-t border-gray-200"
                          >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Acciones sugeridas */}
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">
                                  Acciones Sugeridas
                                </h4>
                                <div className="space-y-2">
                                  {alert.actions.map((action, actionIndex) => (
                                    <div
                                      key={actionIndex}
                                      className="flex items-start space-x-3"
                                    >
                                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                      <span className="text-sm text-gray-700">
                                        {action}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Acciones automáticas */}
                              {alert.automatedActions.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-3">
                                    Acciones Automáticas
                                  </h4>
                                  <div className="space-y-2">
                                    {alert.automatedActions.map(
                                      (autoAction) => (
                                        <div
                                          key={autoAction.id}
                                          className="p-3 bg-blue-50 rounded-lg"
                                        >
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-blue-900">
                                              {autoAction.description}
                                            </span>
                                            <span
                                              className={`px-2 py-1 rounded-full text-xs ${
                                                autoAction.status === "executed"
                                                  ? "bg-green-100 text-green-800"
                                                  : autoAction.status ===
                                                    "pending"
                                                  ? "bg-yellow-100 text-yellow-800"
                                                  : "bg-red-100 text-red-800"
                                              }`}
                                            >
                                              {autoAction.status === "executed"
                                                ? "Ejecutada"
                                                : autoAction.status ===
                                                  "pending"
                                                ? "Pendiente"
                                                : "Fallida"}
                                            </span>
                                          </div>
                                          <p className="text-xs text-blue-700">
                                            Programada:{" "}
                                            {formatDate(autoAction.scheduledAt)}
                                          </p>
                                          {autoAction.executedAt && (
                                            <p className="text-xs text-blue-700">
                                              Ejecutada:{" "}
                                              {formatDate(
                                                autoAction.executedAt
                                              )}
                                            </p>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Notas */}
                              {alert.notes.length > 0 && (
                                <div className="lg:col-span-2">
                                  <h4 className="font-semibold text-gray-900 mb-3">
                                    Notas y Comentarios
                                  </h4>
                                  <div className="space-y-3">
                                    {alert.notes.map((note) => (
                                      <div
                                        key={note.id}
                                        className="p-3 bg-gray-50 rounded-lg"
                                      >
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-sm font-medium text-gray-900">
                                            {note.createdBy}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {formatDate(note.createdAt)}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                          {note.content}
                                        </p>
                                        {note.isSystem && (
                                          <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                            Sistema
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Vista de Métricas */}
        {activeView === "metrics" && alertMetrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Distribución por tipo */}
            <div className={`${CSS_CLASSES.card} p-6`}>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Alertas por Tipo
              </h3>
              <div className="space-y-4">
                {alertMetrics.alertsByType.map((item, index) => (
                  <motion.div
                    key={item.type}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">
                        {getAlertTypeLabel(item.type)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">
                        {item.count}
                      </span>
                      <span className="text-gray-600 text-sm ml-2">
                        ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Distribución por prioridad */}
            <div className={`${CSS_CLASSES.card} p-6`}>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Alertas por Prioridad
              </h3>
              <div className="space-y-4">
                {alertMetrics.alertsByPriority.map((item, index) => {
                  const priorityColors = getPriorityColor(item.priority);
                  return (
                    <motion.div
                      key={item.priority}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            priorityColors.badge.split(" ")[0]
                          }`}
                        ></div>
                        <span className="font-medium text-gray-900 capitalize">
                          {item.priority}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900">
                          {item.count}
                        </span>
                        <span className="text-gray-600 text-sm ml-2">
                          ({item.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Tendencia de los últimos 7 días */}
            <div className={`${CSS_CLASSES.card} p-6 lg:col-span-2`}>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Tendencia de Alertas - Últimos 7 Días
              </h3>
              <div className="grid grid-cols-7 gap-4">
                {alertMetrics.trendsLast7Days.map((day, index) => (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="text-center"
                  >
                    <div
                      className="w-full bg-blue-500 rounded-t-lg mb-2"
                      style={{
                        height: `${(day.count / 10) * 100}px`,
                        minHeight: "20px",
                      }}
                    />
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {day.count}
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(day.date).toLocaleDateString("es-MX", {
                        weekday: "short",
                        day: "2-digit",
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Vista de Configuración */}
        {activeView === "settings" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`${CSS_CLASSES.card} p-6`}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Configuración de Alertas
            </h3>

            <div className="space-y-6">
              {/* Umbrales generales */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Umbrales Generales
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Porcentaje de Stock Bajo
                    </label>
                    <input
                      type="number"
                      defaultValue={20}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Alerta cuando el stock esté por debajo de este porcentaje
                      del mínimo
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Días de Aviso de Vencimiento
                    </label>
                    <input
                      type="number"
                      defaultValue={30}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Alertar cuando falten estos días para el vencimiento
                    </p>
                  </div>
                </div>
              </div>

              {/* Notificaciones */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Métodos de Notificación
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-gray-700">Email</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-gray-700">Notificaciones push</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-gray-700">SMS</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-gray-700">Slack</span>
                  </label>
                </div>
              </div>

              {/* Acciones automáticas */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Acciones Automáticas
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-gray-700">
                      Generar órdenes de compra automáticas
                    </span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-gray-700">
                      Crear solicitudes de transferencia
                    </span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-gray-700">
                      Notificar a proveedores automáticamente
                    </span>
                  </label>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white hover:from-[#265a44] hover:to-[#3d7a5c] px-6 py-2 rounded-lg transition-all duration-200">
                  Guardar Configuración
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-colors duration-200">
                  Restablecer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LowStockAlerts;
