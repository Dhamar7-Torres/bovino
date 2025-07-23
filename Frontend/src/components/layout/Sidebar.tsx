import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Beef,
  Heart,
  Baby,
  TrendingUp,
  MapPin,
  Calendar,
  Activity,
  Package,
  DollarSign,
  FileText,
  Building,
  Settings,
  ChevronDown,
  ChevronRight,
  X,
  User,
  Bell,
  Syringe,
  Stethoscope,
  Truck,
  Clipboard,
  Clock,
  BarChart3,
  Pill,
  ShoppingCart,
  Map,
  Droplets,
  Utensils,
  TestTube,
  Info,
  Menu,
  Eye,
  NotebookPen,
  Plus,
  Edit,
  Microscope,
  Skull,
  HeartHandshake,
  Bug,
  Boxes,
  AlertCircle,
  ClipboardList,
  FolderOpen,
  BarChart4,
  Users,
  Sprout,
  Wheat,
  TrendingDown,
  PieChart,
  Leaf,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// Props del componente Sidebar
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  className?: string;
}

// Interfaz para elementos de navegación
interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: number | string;
  color: string;
  children?: NavItem[];
  // Nueva propiedad para manejar navegación especial
  navigationHandler?: () => void;
}

// Interfaz para secciones del sidebar
interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isMobile,
  className = "",
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Estados para controlar secciones expandidas
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["operations"]) // Expandir por defecto la sección de operaciones
  );
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(["production"]) // Expandir por defecto el módulo de producción
  );

  // Función para navegar a las secciones de producción
  const navigateToProduction = (section: string) => {
    navigate(`/production?section=${section}`);
  };

  // Función para navegar a las secciones de ranch
  const navigateToRanch = (section: string) => {
    navigate(`/ranch?section=${section}`);
  };

  // Datos de navegación organizados por secciones - ESTRUCTURA ACTUALIZADA
  const navigationSections: NavSection[] = [
    {
      id: "livestock",
      title: "Gestión de Ganado",
      items: [
        {
          id: "bovines",
          title: "Ganado",
          href: "/bovines",
          icon: Beef,
          color: "text-[#4e9c75]",
          badge: 1247,
          children: [
            {
              id: "bovines-list",
              title: "Lista de Ganado",
              href: "/bovines", 
              icon: ClipboardList,
              color: "text-[#4e9c75]",
            },
            {
              id: "add-bovine",
              title: "Agregar Bovino",
              href: "/bovines/add", 
              icon: Plus,
              color: "text-[#4e9c75]",
            },
            {
              id: "bovine-detail",
              title: "Perfil Individual",
              href: "/bovines/detail/1", 
              icon: Eye,
              color: "text-[#4e9c75]",
            },
            {
              id: "edit-bovine",
              title: "Editar Bovino",
              href: "/bovines/edit/1", 
              icon: Edit,
              color: "text-[#4e9c75]",
            },
            {
              id: "bovine-documents",
              title: "Documentos",
              href: "/bovines/documents/1", 
              icon: FolderOpen,
              color: "text-[#4e9c75]",
            },
            {
              id: "bovine-location",
              title: "Ubicación y Movimientos",
              href: "/bovines/location/1", 
              icon: MapPin,
              color: "text-[#4e9c75]",
            },
            {
              id: "bovine-notes",
              title: "Notas y Observaciones",
              href: "/bovines/notes/1", 
              icon: NotebookPen,
              color: "text-[#4e9c75]",
            },
          ],
        },
        {
          id: "health",
          title: "Salud",
          href: "/health",
          icon: Heart,
          color: "text-[#4e9c75]",
          badge: 3,
          children: [
            {
              id: "health-dashboard",
              title: "Dashboard de Salud",
              href: "/health/dashboard",
              icon: BarChart3,
              color: "text-[#4e9c75]",
            },
            {
              id: "vaccination-records",
              title: "Registros de Vacunación",
              href: "/health/vaccination-records",
              icon: Syringe,
              color: "text-[#4e9c75]",
            },
            {
              id: "feeding",
              title: "Alimentación",
              href: "/health/feeding",
              icon: Utensils,
              color: "text-[#4e9c75]",
            },
            {
              id: "medical-history",
              title: "Historial Médico",
              href: "/health/medical-history",
              icon: ClipboardList,
              color: "text-[#4e9c75]",
            },
            {
              id: "treatment-plans",
              title: "Planes de Tratamiento",
              href: "/health/treatment-plans",
              icon: Clipboard,
              color: "text-[#4e9c75]",
            },
            {
              id: "disease-tracking",
              title: "Seguimiento de Enfermedades",
              href: "/health/disease-tracking",
              icon: Microscope,
              color: "text-[#4e9c75]",
            },
            {
              id: "medication-inventory",
              title: "Inventario de Medicamentos",
              href: "/health/medication-inventory",
              icon: Pill,
              color: "text-[#4e9c75]",
            },
            {
              id: "vaccine-scheduler",
              title: "Programador de Vacunas",
              href: "/health/vaccine-scheduler",
              icon: Calendar,
              color: "text-[#4e9c75]",
            },
            {
              id: "health-reports",
              title: "Reportes de Salud",
              href: "/health/reports",
              icon: FileText,
              color: "text-[#4e9c75]",
            },
            {
              id: "postmortem-reports",
              title: "Reportes Post-Mortem",
              href: "/health/postmortem",
              icon: Skull,
              color: "text-[#4e9c75]",
            },
            {
              id: "reproductive-health",
              title: "Salud Reproductiva",
              href: "/health/reproductive",
              icon: HeartHandshake,
              color: "text-[#4e9c75]",
            },
            {
              id: "parasite-control",
              title: "Control de Parásitos",
              href: "/health/parasite-control",
              icon: Bug,
              color: "text-[#4e9c75]",
            },
          ],
        },
        {
          id: "reproduction",
          title: "Reproducción",
          href: "/reproduction",
          icon: Baby,
          color: "text-[#4e9c75]",
          children: [
            {
              id: "reproduction-dashboard",
              title: "Dashboard de Reproducción",
              href: "/reproduction/dashboard",
              icon: BarChart3,
              color: "text-[#4e9c75]",
            },
            {
              id: "mating-records",
              title: "Registros de Apareamiento",
              href: "/reproduction/mating-records",
              icon: Heart,
              color: "text-[#4e9c75]",
            },
            {
              id: "pregnancy-tracking",
              title: "Seguimiento de Embarazos",
              href: "/reproduction/pregnancy-tracking",
              icon: Baby,
              color: "text-[#4e9c75]",
            },
            {
              id: "birth-records",
              title: "Registros de Nacimientos",
              href: "/reproduction/birth-records",
              icon: Baby,
              color: "text-[#4e9c75]",
            },
            {
              id: "artificial-insemination",
              title: "Inseminación Artificial",
              href: "/reproduction/artificial-insemination",
              icon: TestTube,
              color: "text-[#4e9c75]",
            },
            {
              id: "bull-management",
              title: "Gestión de Toros",
              href: "/reproduction/bull-management",
              icon: Beef,
              color: "text-[#4e9c75]",
            },
            {
              id: "cow-management",
              title: "Gestión de Vacas",
              href: "/reproduction/cow-management",
              icon: Heart,
              color: "text-[#4e9c75]",
            },
          ],
        },
      ],
    },
    
    {
      id: "feeding",
      title: "Alimentación",
      items: [
        {
          id: "feeding-management",
          title: "Gestión de Alimentación",
          href: "/feeding",
          icon: Wheat,
          color: "text-[#4e9c75]",
          children: [
            {
              id: "plants",
              title: "Plantas",
              href: "/feeding/plants",
              icon: Sprout,
              color: "text-[#4e9c75]",
              badge: "Nuevo",
            },
          ],
        },
      ],
    },
    {
      id: "operations",
      title: "Operaciones",
      items: [
        {
          id: "production",
          title: "Producción",
          href: "/production",
          icon: TrendingUp,
          color: "text-[#4e9c75]",
          children: [
            {
              id: "production-dashboard",
              title: "Dashboard de Producción",
              href: "/production?section=dashboard",
              icon: BarChart3,
              color: "text-[#4e9c75]",
              navigationHandler: () => navigateToProduction('dashboard'),
            },
            {
              id: "milk-production",
              title: "Producción de Leche",
              href: "/production?section=milk",
              icon: Droplets,
              color: "text-[#4e9c75]",
              navigationHandler: () => navigateToProduction('milk'),
            },
            {
              id: "meat-production",
              title: "Producción de Carne",
              href: "/production?section=meat",
              icon: Beef,
              color: "text-[#4e9c75]",
              navigationHandler: () => navigateToProduction('meat'),
            },
            {
              id: "breeding-production",
              title: "Producción de Cría",
              href: "/production?section=breeding",
              icon: Baby,
              color: "text-[#4e9c75]",
              navigationHandler: () => navigateToProduction('breeding'),
            },
          ],
        },
        {
          id: "inventory",
          title: "Inventario",
          href: "/inventory",
          icon: Package,
          color: "text-[#4e9c75]",
          badge: 2,
          children: [
            {
              id: "inventory-dashboard",
              title: "Dashboard de Inventario",
              href: "/inventory/dashboard",
              icon: BarChart3,
              color: "text-[#4e9c75]",
            },
            {
              id: "medicine-inventory",
              title: "Inventario de Medicinas",
              href: "/inventory/medicine",
              icon: Pill,
              color: "text-[#4e9c75]",
            },
            {
              id: "stock-levels",
              title: "Niveles de Stock",
              href: "/inventory/stock-levels",
              icon: Boxes,
              color: "text-[#4e9c75]",
            },
            {
              id: "low-stock-alerts",
              title: "Alertas de Stock Bajo",
              href: "/inventory/low-stock-alerts",
              icon: AlertCircle,
              color: "text-[#4e9c75]",
            },
            {
              id: "inventory-reports",
              title: "Reportes de Inventario",
              href: "/inventory/reports",
              icon: FileText,
              color: "text-[#4e9c75]",
            },
          ],
        },
        {
          id: "maps",
          title: "Mapas",
          href: "/maps",
          icon: MapPin,
          color: "text-[#4e9c75]",
          children: [
            {
              id: "maps-overview",
              title: "Vista General",
              href: "/maps",
              icon: BarChart3,
              color: "text-[#4e9c75]",
            },
            {
              id: "ranch-map",
              title: "Mapa del Rancho",
              href: "/maps/ranch", 
              icon: Map,
              color: "text-[#4e9c75]",
            },
            {
              id: "pasture-map",
              title: "Mapa de Pastura",
              href: "/maps/pastures", 
              icon: Leaf,
              color: "text-[#4e9c75]",
            },
            {
              id: "livestock-location",
              title: "Ubicación del Ganado",
              href: "/maps/livestock", 
              icon: Users,
              color: "text-[#4e9c75]",
            },
          ],
        },
      ],
    },
    {
      id: "planning",
      title: "Planificación",
      items: [
        {
          id: "calendar",
          title: "Calendario",
          href: "/calendar",
          icon: Calendar,
          color: "text-[#4e9c75]",
          badge: 5,
          children: [
            {
              id: "month-view",
              title: "Vista Mensual",
              href: "/calendar/month",
              icon: Calendar,
              color: "text-[#4e9c75]",
            },
            {
              id: "event-detail",
              title: "Detalle de Evento",
              href: "/calendar/events",
              icon: Eye,
              color: "text-[#4e9c75]",
            },
            {
              id: "create-event",
              title: "Crear Evento",
              href: "/calendar/create",
              icon: Plus,
              color: "text-[#4e9c75]",
            },
            {
              id: "edit-event",
              title: "Editar Evento",
              href: "/calendar/edit",
              icon: Edit,
              color: "text-[#4e9c75]",
            },
            {
              id: "event-reminders",
              title: "Recordatorios",
              href: "/calendar/reminders",
              icon: Bell,
              color: "text-[#4e9c75]",
            },
            {
              id: "vaccination-schedule",
              title: "Programa de Vacunación",
              href: "/calendar/vaccination",
              icon: Syringe,
              color: "text-[#4e9c75]",
            },
          ],
        },
        {
          id: "events",
          title: "Eventos",
          href: "/events",
          icon: Activity,
          color: "text-[#4e9c75]",
          children: [
            {
              id: "events-list",
              title: "Lista de Eventos",
              href: "/events/list",
              icon: ClipboardList,
              color: "text-[#4e9c75]",
            },
            {
              id: "events-timeline",
              title: "Línea de Tiempo",
              href: "/events/timeline",
              icon: Clock,
              color: "text-[#4e9c75]",
            },
            {
              id: "event-detail",
              title: "Detalle de Evento",
              href: "/events/detail",
              icon: Eye,
              color: "text-[#4e9c75]",
            },
            {
              id: "create-event-form",
              title: "Crear Evento",
              href: "/events/create",
              icon: Plus,
              color: "text-[#4e9c75]",
            },
            {
              id: "edit-event-form",
              title: "Editar Evento",
              href: "/events/edit",
              icon: Edit,
              color: "text-[#4e9c75]",
            },
            {
              id: "vaccination-events",
              title: "Eventos de Vacunación",
              href: "/events/vaccination",
              icon: Syringe,
              color: "text-[#4e9c75]",
            },
            {
              id: "breeding-events",
              title: "Eventos de Reproducción",
              href: "/events/breeding",
              icon: Baby,
              color: "text-[#4e9c75]",
            },
            {
              id: "health-events",
              title: "Eventos de Salud",
              href: "/events/health",
              icon: Heart,
              color: "text-[#4e9c75]",
            },
            {
              id: "feeding-events",
              title: "Eventos de Alimentación",
              href: "/events/feeding",
              icon: Utensils,
              color: "text-[#4e9c75]",
            },
            {
              id: "sales-events",
              title: "Eventos de Ventas",
              href: "/events/sales",
              icon: DollarSign,
              color: "text-[#4e9c75]",
            },
            {
              id: "purchase-events",
              title: "Eventos de Compras",
              href: "/events/purchases",
              icon: ShoppingCart,
              color: "text-[#4e9c75]",
            },
            {
              id: "transport-events",
              title: "Eventos de Transporte",
              href: "/events/transport",
              icon: Truck,
              color: "text-[#4e9c75]",
            },
          ],
        },
      ],
    },
    {
      id: "business",
      title: "Gestión Empresarial",
      items: [
        {
          id: "finances",
          title: "Finanzas",
          href: "/finances",
          icon: DollarSign,
          color: "text-[#4e9c75]",
          children: [
            {
              id: "dashboard",
              title: "Dashboard Financiero",
              href: "/finances/dashboard",
              icon: BarChart3,
              color: "text-[#4e9c75]",
            },
            {
              id: "income-tracker",
              title: "Seguimiento de Ingresos",
              href: "/finances/income-tracker",
              icon: TrendingUp,
              color: "text-[#4e9c75]",
            },
            {
              id: "expense-tracker",
              title: "Seguimiento de Egresos",
              href: "/finances/expense-tracker",
              icon: TrendingDown,
              color: "text-[#4e9c75]",
            },
            {
              id: "profit-loss",
              title: "Estado de Ganancias y Pérdidas",
              href: "/finances/profit-loss",
              icon: PieChart,
              color: "text-[#4e9c75]",
            },
          ],
        },
        {
          id: "ranch",
          title: "Rancho",
          href: "/ranch",
          icon: Building,
          color: "text-[#4e9c75]",
          children: [
            {
              id: "ranch-overview",
              title: "Vista General del Rancho",
              href: "/ranch?section=overview",
              icon: Home,
              color: "text-[#4e9c75]",
              navigationHandler: () => navigateToRanch('overview'),
            },
            {
              id: "property-info",
              title: "Información de la Propiedad",
              href: "/ranch?section=property",
              icon: Info,
              color: "text-[#4e9c75]",
              navigationHandler: () => navigateToRanch('property'),
            },
            {
              id: "ranch-staff",
              title: "Personal",
              href: "/ranch?section=staff",
              icon: Users,
              color: "text-[#4e9c75]",
              navigationHandler: () => navigateToRanch('staff'),
            },
          ],
        },
        {
          id: "reports",
          title: "Reportes",
          href: "/reports",
          icon: FileText,
          color: "text-[#4e9c75]",
          children: [
            {
              id: "reports-dashboard",
              title: "Dashboard de Reportes",
              href: "/reports/dashboard",
              icon: BarChart4,
              color: "text-[#4e9c75]",
            },
            {
              id: "production-reports",
              title: "Reportes de Producción",
              href: "/reports/production",
              icon: TrendingUp,
              color: "text-[#4e9c75]",
            },
            {
              id: "health-reports",
              title: "Reportes de Salud",
              href: "/reports/health",
              icon: Heart,
              color: "text-[#4e9c75]",
            },
            {
              id: "inventory-reports",
              title: "Reportes de Inventario",
              href: "/reports/inventory",
              icon: Package,
              color: "text-[#4e9c75]",
            },
          ],
        },
      ],
    },
    {
      id: "system",
      title: "Sistema",
      items: [
        {
          id: "settings",
          title: "Configuración",
          href: "/settings",
          icon: Settings,
          color: "text-[#4e9c75]",
          children: [
            {
              id: "profile-settings",
              title: "Configuración de Perfil",
              href: "/settings/profile",
              icon: User,
              color: "text-[#4e9c75]",
            },
            {
              id: "notification-settings",
              title: "Configuración de Notificaciones",
              href: "/settings/notifications",
              icon: Bell,
              color: "text-[#4e9c75]",
            },
          ],
        },
      ],
    },
  ];

  // Efecto para auto-expandir la sección activa
  useEffect(() => {
    const currentPath = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    const section = searchParams.get('section');
    
    // Buscar en qué sección y elemento se encuentra la ruta actual
    navigationSections.forEach((navSection) => {
      navSection.items.forEach((item) => {
        if (currentPath.startsWith(item.href.split('?')[0])) {
          setExpandedSections((prev) => new Set([...prev, navSection.id]));
          if (item.children && item.children.length > 0) {
            setExpandedItems((prev) => new Set([...prev, item.id]));
          }
        }
        
        // Para elementos con children, verificar si algún hijo está activo
        if (item.children) {
          item.children.forEach((child) => {
            const childPath = child.href.split('?')[0];
            const childParams = new URLSearchParams(child.href.split('?')[1] || '');
            const childSection = childParams.get('section');
            
            if (currentPath === childPath && 
                (!childSection || section === childSection)) {
              setExpandedSections((prev) => new Set([...prev, navSection.id]));
              setExpandedItems((prev) => new Set([...prev, item.id]));
            }
          });
        }
      });
    });
  }, [location.pathname, location.search]);

  // Función para alternar sección expandida
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Función para alternar elemento expandido
  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Función para verificar si un elemento está activo
  const isActiveItem = (href: string) => {
    const currentPath = location.pathname;
    const currentSearch = location.search;
    const searchParams = new URLSearchParams(currentSearch);
    const currentSection = searchParams.get('section');
    
    // Separar la URL base de los parámetros
    const [basePath, queryString] = href.split('?');
    const hrefParams = new URLSearchParams(queryString || '');
    const hrefSection = hrefParams.get('section');
    
    // Verificar si la ruta base coincide
    if (currentPath !== basePath) {
      return false;
    }
    
    // Si hay parámetros de sección, verificar que coincidan
    if (hrefSection) {
      return currentSection === hrefSection;
    }
    
    // Si no hay parámetros de sección en href, verificar que no haya section actual o sea 'overview'
    return !currentSection || currentSection === 'overview';
  };

  // Componente para renderizar elemento de navegación
  const NavItemComponent: React.FC<{
    item: NavItem;
    level: number;
    isChild?: boolean;
  }> = ({ item, level, isChild = false }) => {
    const IconComponent = item.icon;
    const isActive = isActiveItem(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);

    // Función para manejar el click
    const handleClick = (e: React.MouseEvent) => {
      if (item.navigationHandler) {
        e.preventDefault();
        item.navigationHandler();
        if (isMobile) onClose();
      } else if (hasChildren) {
        e.preventDefault();
        toggleItem(item.id);
      } else {
        if (isMobile) onClose();
      }
    };

    return (
      <div>
        {/* Elemento principal */}
        <div className="relative">
          {item.navigationHandler ? (
            <button
              onClick={handleClick}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-200 group relative text-left
                ${
                  isActive
                    ? "bg-[#d9eddd] text-gray-800 shadow-sm border border-[#c8e4cd]"
                    : "text-[#65625b] hover:text-gray-700 hover:bg-white/50"
                }
                ${isChild ? `ml-${level * 4} pl-6` : ""}
              `}
            >
              {/* Línea de conexión para elementos hijos */}
              {isChild && (
                <div className="absolute left-4 top-0 bottom-0 w-px bg-[#e0ddd0]" />
              )}

              {/* Icono con efectos 3D mejorados */}
              <motion.div
                className="relative"
                whileHover={{
                  scale: 1.1,
                  rotateY: 15,
                  rotateX: 5,
                }}
                transition={{ duration: 0.2 }}
              >
                <IconComponent
                  size={16}
                  className={`${
                    isActive ? item.color : "text-[#5c5b58]"
                  } transition-all duration-200`}
                  style={{
                    filter: isActive
                      ? "drop-shadow(0 4px 8px rgba(78, 156, 117, 0.4)) drop-shadow(0 0 12px rgba(78, 156, 117, 0.3))"
                      : "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
                    transform: isActive
                      ? "perspective(100px) rotateX(10deg) rotateY(5deg)"
                      : "perspective(100px) rotateX(5deg)",
                  }}
                />

                {/* Efectos de brillo para iconos activos */}
                {isActive && (
                  <>
                    <div
                      className="absolute inset-0 rounded-full opacity-30 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(circle at 30% 30%, rgba(78, 156, 117, 0.6), transparent 70%)",
                        filter: "blur(3px)",
                        transform: "scale(1.8)",
                      }}
                    />
                    <div
                      className="absolute inset-0 rounded-full opacity-20 pointer-events-none animate-pulse"
                      style={{
                        background:
                          "linear-gradient(45deg, rgba(78, 156, 117, 0.4), rgba(78, 156, 117, 0.8), rgba(78, 156, 117, 0.4))",
                        filter: "blur(4px)",
                        transform: "scale(2)",
                      }}
                    />
                  </>
                )}
              </motion.div>

              <span className="flex-1 truncate">{item.title}</span>

              {/* Badge con efectos 3D */}
              {item.badge && (
                <motion.span
                  className="bg-[#2d5a41] text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none shadow-lg relative"
                  style={{
                    filter: "drop-shadow(0 4px 8px rgba(45, 90, 65, 0.5))",
                    transform: "perspective(50px) rotateX(10deg)",
                  }}
                  whileHover={{
                    scale: 1.1,
                    transform: "perspective(50px) rotateX(15deg) rotateY(5deg)",
                  }}
                >
                  {typeof item.badge === "number" && item.badge > 99
                    ? "99+"
                    : item.badge}
                  <div
                    className="absolute inset-0 rounded-full opacity-30 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)",
                    }}
                  />
                </motion.span>
              )}

              {/* Icono de expandir/contraer */}
              {hasChildren && (
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ scale: 1.2 }}
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
                    transform: "perspective(50px) rotateX(5deg)",
                  }}
                >
                  <ChevronRight size={14} className="text-[#5c5b58]" />
                </motion.div>
              )}
            </button>
          ) : (
            <Link
              to={item.href}
              onClick={handleClick}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-200 group relative
                ${
                  isActive
                    ? "bg-[#d9eddd] text-gray-800 shadow-sm border border-[#c8e4cd]"
                    : "text-[#65625b] hover:text-gray-700 hover:bg-white/50"
                }
                ${isChild ? `ml-${level * 4} pl-6` : ""}
              `}
            >
              {/* Línea de conexión para elementos hijos */}
              {isChild && (
                <div className="absolute left-4 top-0 bottom-0 w-px bg-[#e0ddd0]" />
              )}

              {/* Icono con efectos 3D mejorados */}
              <motion.div
                className="relative"
                whileHover={{
                  scale: 1.1,
                  rotateY: 15,
                  rotateX: 5,
                }}
                transition={{ duration: 0.2 }}
              >
                <IconComponent
                  size={16}
                  className={`${
                    isActive ? item.color : "text-[#5c5b58]"
                  } transition-all duration-200`}
                  style={{
                    filter: isActive
                      ? "drop-shadow(0 4px 8px rgba(78, 156, 117, 0.4)) drop-shadow(0 0 12px rgba(78, 156, 117, 0.3))"
                      : "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
                    transform: isActive
                      ? "perspective(100px) rotateX(10deg) rotateY(5deg)"
                      : "perspective(100px) rotateX(5deg)",
                  }}
                />

                {/* Efectos de brillo para iconos activos */}
                {isActive && (
                  <>
                    <div
                      className="absolute inset-0 rounded-full opacity-30 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(circle at 30% 30%, rgba(78, 156, 117, 0.6), transparent 70%)",
                        filter: "blur(3px)",
                        transform: "scale(1.8)",
                      }}
                    />
                    <div
                      className="absolute inset-0 rounded-full opacity-20 pointer-events-none animate-pulse"
                      style={{
                        background:
                          "linear-gradient(45deg, rgba(78, 156, 117, 0.4), rgba(78, 156, 117, 0.8), rgba(78, 156, 117, 0.4))",
                        filter: "blur(4px)",
                        transform: "scale(2)",
                      }}
                    />
                  </>
                )}
              </motion.div>

              <span className="flex-1 truncate">{item.title}</span>

              {/* Badge con efectos 3D */}
              {item.badge && (
                <motion.span
                  className="bg-[#2d5a41] text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none shadow-lg relative"
                  style={{
                    filter: "drop-shadow(0 4px 8px rgba(45, 90, 65, 0.5))",
                    transform: "perspective(50px) rotateX(10deg)",
                  }}
                  whileHover={{
                    scale: 1.1,
                    transform: "perspective(50px) rotateX(15deg) rotateY(5deg)",
                  }}
                >
                  {typeof item.badge === "number" && item.badge > 99
                    ? "99+"
                    : item.badge}
                  <div
                    className="absolute inset-0 rounded-full opacity-30 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)",
                    }}
                  />
                </motion.span>
              )}

              {/* Icono de expandir/contraer */}
              {hasChildren && (
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ scale: 1.2 }}
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
                    transform: "perspective(50px) rotateX(5deg)",
                  }}
                >
                  <ChevronRight size={14} className="text-[#5c5b58]" />
                </motion.div>
              )}
            </Link>
          )}
        </div>

        {/* Elementos hijos */}
        <AnimatePresence initial={false}>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="ml-4 mt-1 space-y-1">
                {item.children!.map((child) => (
                  <NavItemComponent
                    key={child.id}
                    item={child}
                    level={level + 1}
                    isChild={true}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Overlay para móvil */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={onClose}
            />
          )}

          {/* Sidebar */}
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
              opacity: { duration: 0.2 },
            }}
            className={`
              fixed top-0 left-0 h-full w-80 bg-[#F5F5DC] border-r border-[#e0ddd0] z-50
              flex flex-col shadow-2xl lg:shadow-xl
              ${className}
            `}
            style={{
              backdropFilter: "blur(20px)",
              boxShadow:
                "0 25px 50px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              marginTop: "76px", // Altura del header
              height: "calc(100vh - 76px)",
            }}
          >
            {/* Header del sidebar con botón de cierre mejorado */}
            <div className="flex items-center justify-between p-4 border-b border-[#e0ddd0] bg-white/30 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-8 h-8 bg-gradient-to-br from-[#4e9c75] to-[#3d7a5c] rounded-lg flex items-center justify-center shadow-lg"
                  style={{
                    filter: "drop-shadow(0 6px 12px rgba(78, 156, 117, 0.4))",
                    transform:
                      "perspective(100px) rotateX(10deg) rotateY(-5deg)",
                  }}
                  whileHover={{
                    transform:
                      "perspective(100px) rotateX(15deg) rotateY(-10deg) scale(1.05)",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="text-white" size={16} />
                </motion.div>
                <div>
                  <h2 className="font-bold text-lg text-gray-800">
                    Navegación
                  </h2>
                  <p className="text-xs text-[#65625b]">Bovino UJAT</p>
                </div>
              </div>

              {/* Botón de cierre con efectos 3D mejorados */}
              <motion.button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/50 transition-all duration-200 group relative"
                whileHover={{
                  scale: 1.15,
                  rotate: 90,
                  transform:
                    "perspective(100px) rotateX(15deg) rotateY(15deg) scale(1.15)",
                }}
                whileTap={{ scale: 0.9 }}
                style={{
                  filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))",
                  transform: "perspective(100px) rotateX(5deg)",
                }}
              >
                <X
                  size={20}
                  className="text-[#5c5b58] group-hover:text-gray-700 transition-colors"
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                  }}
                />
                {/* Efecto de brillo en el botón X */}
                <div
                  className="absolute inset-0 rounded-lg opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)",
                  }}
                />
              </motion.button>
            </div>

            {/* Contenido navegable */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="space-y-6">
                {navigationSections.map((section) => {
                  const isExpanded = expandedSections.has(section.id);
                  return (
                    <div key={section.id}>
                      {/* Título de sección con efectos 3D */}
                      <motion.button
                        onClick={() => toggleSection(section.id)}
                        className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-[#65625b] uppercase tracking-wider hover:text-gray-700 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        style={{
                          filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))",
                        }}
                      >
                        <span>{section.title}</span>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          style={{
                            filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
                            transform: "perspective(50px) rotateX(5deg)",
                          }}
                        >
                          <ChevronDown size={14} />
                        </motion.div>
                      </motion.button>

                      {/* Elementos de la sección */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 space-y-1">
                              {section.items.map((item) => (
                                <NavItemComponent
                                  key={item.id}
                                  item={item}
                                  level={0}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Footer del sidebar con efectos 3D */}
            <div className="p-4 border-t border-[#e0ddd0] bg-white/30 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-xs text-[#65625b] mb-2">
                  Sistema de Gestión Ganadera
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-[#7a7a7a]">
                  <span>v1.0.0</span>
                  <span>•</span>
                  <span>UJAT 2025</span>
                </div>
                {/* Badge inferior con "D" en 3D mejorado */}
                <div className="flex justify-center mt-3">
                  <motion.div
                    className="w-6 h-6 bg-[#2d5a41] rounded-full flex items-center justify-center relative"
                    style={{
                      filter: "drop-shadow(0 6px 12px rgba(45, 90, 65, 0.5))",
                      transform:
                        "perspective(50px) rotateX(15deg) rotateY(-5deg)",
                    }}
                    whileHover={{
                      transform:
                        "perspective(50px) rotateX(20deg) rotateY(-10deg) scale(1.1)",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-white text-xs font-bold">D</span>
                    {/* Efecto de brillo en el badge D */}
                    <div
                      className="absolute inset-0 rounded-full opacity-30 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)",
                      }}
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;