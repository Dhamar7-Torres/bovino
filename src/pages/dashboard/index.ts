// Dashboard Module - Main Exports
// Este archivo centraliza todas las exportaciones del módulo dashboard
// para facilitar las importaciones desde otros módulos de la aplicación

// Importar componentes desde los archivos locales
import DashboardPage from "./DashboardPage";
import OverviewStats from "./OverviewStats";
import AlertsPanel from "./AlertsPanel";
import FeedInventory from "./FeedInventory";
import HealthSummary from "./HealthSummary";
import LivestockOverview from "./LivestockOverview";
import ProductionSummary from "./ProductionSummary";
import UpcomingEvents from "./UpcomingEvents";

// Exportaciones nombradas
export {
  DashboardPage,
  OverviewStats,
  AlertsPanel,
  FeedInventory,
  HealthSummary,
  LivestockOverview,
  ProductionSummary,
  UpcomingEvents,
};

// Exportaciones agrupadas por funcionalidad
export const DashboardComponents = {
  // Componente principal
  Main: DashboardPage,

  // Componentes de estadísticas y métricas
  Stats: {
    Overview: OverviewStats,
    Production: ProductionSummary,
    Health: HealthSummary,
    Livestock: LivestockOverview,
  },

  // Componentes de gestión y operaciones
  Management: {
    Alerts: AlertsPanel,
    Inventory: FeedInventory,
    Events: UpcomingEvents,
  },
};

// Exportación por defecto del componente principal
export default DashboardPage;
