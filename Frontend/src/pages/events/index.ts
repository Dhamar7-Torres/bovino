// Exportaciones del módulo Events
// Archivo principal de exportaciones para el sistema de gestión de eventos ganaderos

// Página principal del módulo
export { default as EventPage } from "./EventsPage";

// Eventos específicos por tipo
export { default as EventVaccination } from "./EventVaccination";
export { default as EventPurchase } from "./EventPurchase";
export { default as EventSales } from "./EventSales";
export { default as EventTransport } from "./EventTransport";
export { default as EventBreeding } from "./EventBreeding";
export { default as EventHealth } from "./EventHealth";
export { default as EventFeeding } from "./EventFeeding";

// Exportación por defecto del módulo principal
export { default } from "./EventsPage";
