// ============================================================================
// ARCHIVO INDEX.TS - MÓDULO DEL RANCHO
// ============================================================================
// Este archivo centraliza las exportaciones del módulo de rancho para facilitar
// las importaciones en otras partes de la aplicación

// ============================================================================
// COMPONENTE PRINCIPAL DEL MÓDULO
// ============================================================================

// Página principal del módulo con routing interno
export { default as RanchPage } from "./RanchPage";

// ============================================================================
// COMPONENTES ESPECIALIZADOS DEL RANCHO
// ============================================================================

// Información completa de la propiedad con documentación legal
export { default as PropertyInfo } from "./PropertyInfo";

// Gestión integral del personal del rancho
export { default as Staff } from "./Staff";

// ============================================================================
// EXPORTACIÓN POR DEFECTO
// ============================================================================

// Exportar la página principal como default para facilitar importación
export { default } from "./RanchPage";

// ============================================================================
// INTERFACES Y TIPOS (para uso externo)
// ============================================================================

// Interfaces principales para integración con otros módulos
export interface RanchInfo {
  id: string;
  name: string;
  description: string;
  establishedYear: number;
  totalArea: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    region: string;
  };
  owner: {
    name: string;
    email: string;
    phone: string;
  };
  status: {
    isOperational: boolean;
    complianceStatus: "compliant" | "pending" | "expired";
    alertCount: number;
  };
}

export interface RanchStatistics {
  totalArea: number;
  propertyValue: number;
  totalStaff: number;
  activeFacilities: number;
  documentsCount: number;
  lastInspection: string;
  complianceStatus: "compliant" | "pending" | "expired";
  alertsCount: number;
}

export interface StaffMember {
  id: string;
  fullName: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  hireDate: string;
  status: "active" | "on_leave" | "suspended" | "terminated";
  experience: number;
  rating: number;
  attendanceRate: number;
}

export interface PropertyDocument {
  id: string;
  type: "title_deed" | "survey" | "permit" | "certificate" | "insurance" | "tax" | "environmental" | "inspection";
  name: string;
  description: string;
  uploadDate: string;
  expirationDate?: string;
  status: "valid" | "expired" | "pending" | "rejected" | "under_review";
  fileUrl: string;
  fileSize: number;
  pages: number;
  isRequired: boolean;
  lastUpdated: string;
}

export interface RanchFacility {
  id: string;
  name: string;
  type: "corral" | "barn" | "feed" | "water" | "medical" | "office";
  status: "active" | "maintenance" | "inactive";
  capacity: number;
  current: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface RanchActivity {
  id: string;
  type: "vaccination" | "feeding" | "treatment" | "inspection" | "movement";
  description: string;
  timestamp: string;
  location: string;
  status: "completed" | "pending" | "cancelled";
  assignedStaff?: string;
  notes?: string;
}

// ============================================================================
// UTILIDADES Y HELPERS
// ============================================================================

// Función para formatear área en hectáreas
export const formatArea = (area: number): string => {
  return `${area.toLocaleString()} hectáreas`;
};

// Función para formatear moneda mexicana
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Función para obtener el estado de cumplimiento legal
export const getComplianceStatus = (documents: PropertyDocument[]): "compliant" | "pending" | "expired" => {
  const requiredDocs = documents.filter(doc => doc.isRequired);
  const expiredDocs = requiredDocs.filter(doc => {
    if (!doc.expirationDate) return false;
    return new Date(doc.expirationDate) < new Date();
  });
  
  const invalidDocs = requiredDocs.filter(doc => 
    doc.status === "expired" || doc.status === "rejected"
  );

  if (expiredDocs.length > 0 || invalidDocs.length > 0) {
    return "expired";
  }
  
  const pendingDocs = requiredDocs.filter(doc => 
    doc.status === "pending" || doc.status === "under_review"
  );
  
  if (pendingDocs.length > 0) {
    return "pending";
  }
  
  return "compliant";
};

// Función para calcular eficiencia del personal
export const calculateStaffEfficiency = (staffMembers: StaffMember[]): number => {
  if (staffMembers.length === 0) return 0;
  
  const totalEfficiency = staffMembers
    .filter(member => member.status === "active")
    .reduce((sum, member) => sum + member.attendanceRate, 0);
    
  return Math.round(totalEfficiency / staffMembers.length);
};

// Función para obtener color según estado
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "active":
    case "completed":
    case "compliant":
    case "valid":
      return "text-green-600 bg-green-100";
    case "maintenance":
    case "pending":
    case "under_review":
      return "text-yellow-600 bg-yellow-100";
    case "inactive":
    case "cancelled":
    case "expired":
    case "rejected":
      return "text-red-600 bg-red-100";
    case "on_leave":
    case "suspended":
      return "text-orange-600 bg-orange-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

// Función para obtener próximas actividades
export const getUpcomingActivities = (activities: RanchActivity[]): RanchActivity[] => {
  return activities
    .filter(activity => activity.status === "pending")
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(0, 5);
};

// Función para calcular días hasta vencimiento de documento
export const getDaysUntilExpiration = (expirationDate: string): number => {
  const expDate = new Date(expirationDate);
  const today = new Date();
  const diffTime = expDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Función para validar coordenadas geográficas
export const isValidCoordinates = (latitude: number, longitude: number): boolean => {
  return (
    latitude >= -90 && 
    latitude <= 90 && 
    longitude >= -180 && 
    longitude <= 180
  );
};

// ============================================================================
// CONFIGURACIÓN DEL MÓDULO
// ============================================================================

// Información del módulo para integración con el sistema
export const RANCH_MODULE_INFO = {
  id: "ranch",
  name: "Gestión del Rancho",
  description: "Sistema integral para la administración y gestión del rancho ganadero",
  version: "1.0.0",
  author: "UJAT - Universidad Juárez Autónoma de Tabasco",
  lastUpdated: "2025-01-16",
  features: [
    "Vista general del rancho",
    "Gestión del personal",
    "Documentación legal",
    "Información de la propiedad",
    "Seguimiento de actividades",
    "Control de instalaciones",
    "Reportes estadísticos",
    "Sistema de alertas",
  ],
  routes: [
    "/ranch/overview",
    "/ranch/property-info", 
    "/ranch/staff",
  ],
  permissions: [
    "ranch:view",
    "ranch:edit",
    "ranch:manage_staff",
    "ranch:manage_documents",
    "ranch:view_reports",
  ],
} as const;

// Configuración de navegación del módulo
export const RANCH_NAVIGATION = [
  {
    id: "overview",
    path: "/ranch/overview",
    label: "Vista General",
    description: "Resumen general del rancho con estadísticas y estado operacional",
    icon: "Home",
    permissions: ["ranch:view"],
  },
  {
    id: "property",
    path: "/ranch/property-info",
    label: "Información de la Propiedad",
    description: "Datos legales, documentación, mapas y valuación de la propiedad",
    icon: "Building",
    permissions: ["ranch:view", "ranch:manage_documents"],
  },
  {
    id: "staff",
    path: "/ranch/staff",
    label: "Personal del Rancho",
    description: "Gestión del personal, horarios, roles y rendimiento",
    icon: "Users",
    permissions: ["ranch:view", "ranch:manage_staff"],
  },
] as const;

// Configuración de acciones rápidas
export const RANCH_QUICK_ACTIONS = [
  {
    id: "add-employee",
    label: "Agregar Empleado",
    icon: "UserPlus",
    path: "/ranch/staff?action=add",
    permission: "ranch:manage_staff",
    color: "green",
  },
  {
    id: "upload-document",
    label: "Subir Documento",
    icon: "Upload",
    path: "/ranch/property-info?action=upload",
    permission: "ranch:manage_documents",
    color: "blue",
  },
  {
    id: "schedule-inspection",
    label: "Programar Inspección",
    icon: "Calendar",
    path: "/calendar?action=create&type=inspection",
    permission: "ranch:edit",
    color: "purple",
  },
  {
    id: "generate-report",
    label: "Generar Reporte",
    icon: "BarChart",
    path: "/reports?type=ranch",
    permission: "ranch:view_reports",
    color: "orange",
  },
] as const;

// ============================================================================
// VALIDACIÓN Y TIPOS DE EXPORTACIÓN
// ============================================================================

// Verificar que todas las exportaciones estén disponibles
export type RanchModuleExports = {
  // Componentes principales
  RanchPage: React.ComponentType<any>;
  RanchOverview: React.ComponentType<any>;
  PropertyInfo: React.ComponentType<any>;
  Staff: React.ComponentType<any>;

  // Interfaces
  RanchInfo: RanchInfo;
  RanchStatistics: RanchStatistics;
  StaffMember: StaffMember;
  PropertyDocument: PropertyDocument;
  RanchFacility: RanchFacility;
  RanchActivity: RanchActivity;

  // Utilidades
  formatArea: typeof formatArea;
  formatCurrency: typeof formatCurrency;
  getComplianceStatus: typeof getComplianceStatus;
  calculateStaffEfficiency: typeof calculateStaffEfficiency;
  getStatusColor: typeof getStatusColor;
  getUpcomingActivities: typeof getUpcomingActivities;
  getDaysUntilExpiration: typeof getDaysUntilExpiration;
  isValidCoordinates: typeof isValidCoordinates;

  // Configuración
  RANCH_MODULE_INFO: typeof RANCH_MODULE_INFO;
  RANCH_NAVIGATION: typeof RANCH_NAVIGATION;
  RANCH_QUICK_ACTIONS: typeof RANCH_QUICK_ACTIONS;
};

