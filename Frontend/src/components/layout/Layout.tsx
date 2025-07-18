import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";

// Importación de componentes del layout
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

// Props del componente Layout
interface LayoutProps {
  children?: React.ReactNode;
  className?: string;
}

// Componente de Error Fallback
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

// Error Boundary personalizado
class CustomErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback: React.ComponentType<ErrorFallbackProps>;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback: React.ComponentType<ErrorFallbackProps>;
  }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error capturado por CustomErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetErrorBoundary={() =>
            this.setState({ hasError: false, error: null })
          }
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a] p-4"
    >
      <div className="max-w-md w-full bg-[#fffdf8]/90 backdrop-blur-sm rounded-xl shadow-lg p-6 text-center border border-white/20">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          ¡Algo salió mal!
        </h2>
        <p className="text-gray-600 mb-4">
          Ha ocurrido un error inesperado en la aplicación.
        </p>
        <details className="text-left bg-white/60 rounded-lg p-3 mb-4">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer">
            Detalles del error
          </summary>
          <pre className="text-xs text-red-600 mt-2 overflow-auto">
            {error.message}
          </pre>
        </details>
        <button
          onClick={resetErrorBoundary}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white px-4 py-2 rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200"
        >
          <RefreshCw size={16} />
          Intentar de nuevo
        </button>
      </div>
    </motion.div>
  );
};

// Componente de Loading para rutas elegante
const RouteLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-96">
      <motion.div
        className="flex flex-col items-center space-y-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Spinner elegante */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-3 border-[#f4ac3a]/30 border-t-[#3d8b40] rounded-full shadow-lg"
          />
          <div className="absolute inset-0 w-12 h-12 border-3 border-transparent border-r-[#f4ac3a] rounded-full animate-ping"></div>
        </div>

        {/* Texto con gradiente */}
        <div className="text-center">
          <p className="text-lg font-medium bg-gradient-to-r from-[#3d8b40] to-[#f4ac3a] bg-clip-text text-transparent">
            Cargando...
          </p>
          <p className="text-sm text-gray-500 mt-1">Preparando el contenido</p>
        </div>

        {/* Puntos de carga animados */}
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 bg-gradient-to-r from-[#3d8b40] to-[#f4ac3a] rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// Componente de estado offline elegante
const OfflineIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="bg-gradient-to-r from-[#e47b3e] to-[#d94343] text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm flex items-center gap-3">
        <div className="relative">
          <WifiOff size={18} />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full"
          />
        </div>
        <div>
          <span className="text-sm font-semibold">Sin conexión a internet</span>
          <p className="text-xs opacity-90">Trabajando en modo offline</p>
        </div>
      </div>
    </motion.div>
  );
};

// Hook personalizado para el estado del layout
const useLayoutState = () => {
  // Inicializar sidebar abierto para web (será ajustado por handleResize)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const location = useLocation();

  // Función para obtener el módulo actual basado en la ruta
  const getCurrentModule = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    return pathSegments[0] || "dashboard";
  };

  // Detectar cambios en el tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      // Auto-gestión del sidebar: ABIERTO por defecto en desktop
      if (!mobile) {
        setIsSidebarOpen(true); // Abierto en desktop
      } else {
        setIsSidebarOpen(false); // Cerrado en móvil
      }
    };

    handleResize(); // Ejecutar al montar
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Detectar cambios en el estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Cerrar sidebar en móvil cuando cambie la ruta
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  return {
    isSidebarOpen,
    isMobile,
    isOnline,
    currentModule: getCurrentModule(),
    toggleSidebar: () => setIsSidebarOpen(!isSidebarOpen),
    closeSidebar: () => setIsSidebarOpen(false),
  };
};

// Componente principal Layout
const Layout: React.FC<LayoutProps> = ({ className = "" }) => {
  const location = useLocation();
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  const {
    isSidebarOpen,
    isMobile,
    isOnline,
    currentModule,
    toggleSidebar,
    closeSidebar,
  } = useLayoutState();

  // Función para manejar el atajo de teclado para el debug panel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl + Shift + D para mostrar/ocultar el debug panel
      if (event.ctrlKey && event.shiftKey && event.key === "D") {
        event.preventDefault();
        setShowDebugPanel(!showDebugPanel);
      }
    };

    if (import.meta.env?.DEV) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [showDebugPanel]);

  // Clases CSS dinámicas para el contenido principal
  const getMainContentClasses = () => {
    let classes =
      "flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-0";
    // En desktop con sidebar abierto, dar margen izquierdo
    if (isSidebarOpen && !isMobile) {
      classes += " ml-80"; // w-80 = 20rem = 320px
    } else {
      classes += " ml-0";
    }
    return classes;
  };

  return (
    <CustomErrorBoundary fallback={ErrorFallback}>
      <div
        className={`min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a] ${className}`}
      >
        {/* Indicador de estado offline */}
        <AnimatePresence>{!isOnline && <OfflineIndicator />}</AnimatePresence>

        {/* Header fijo */}
        <Header onToggleSidebar={toggleSidebar} />

        {/* Container principal */}
        <div className="flex min-h-screen pt-16">
          {" "}
          {/* pt-16 para compensar el header fijo */}
          {/* Sidebar */}
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
            isMobile={isMobile}
          />
          {/* Área de contenido principal */}
          <main className={getMainContentClasses()}>
            {/* Container del contenido con scroll */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Contenedor del contenido de las rutas hijas */}
              <div className="flex-1 overflow-auto">
                <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    key={location.pathname} // Re-animar cuando cambie la ruta
                    className="h-full"
                  >
                    {/* React Router Outlet - Aquí se renderizan las rutas hijas */}
                    <React.Suspense fallback={<RouteLoader />}>
                      <Outlet />
                    </React.Suspense>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Footer completo */}
            <Footer variant="full" className="mt-auto" />
          </main>
        </div>

        {/* Notificaciones toast (opcional) */}
        <div
          id="toast-container"
          className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none"
        >
          {/* Aquí se pueden agregar notificaciones toast dinámicas */}
        </div>

        {/* Debug panel toggleable en desarrollo - elegante */}
        {import.meta.env?.DEV && showDebugPanel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-6 left-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white text-xs px-4 py-3 rounded-2xl font-mono z-50 shadow-2xl border border-white/10 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#3d8b40] rounded-full animate-pulse"></div>
                <span className="text-[#3d8b40] font-semibold text-sm">
                  Debug Panel
                </span>
              </div>
              <button
                onClick={() => setShowDebugPanel(false)}
                className="text-gray-400 hover:text-white ml-3 w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"
                title="Cerrar (Ctrl+Shift+D)"
              >
                ×
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Módulo:</span>
                <span className="text-[#3d8b40] font-medium">
                  {currentModule}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ruta:</span>
                <span
                  className="text-[#f4ac3a] font-medium truncate max-w-32"
                  title={location.pathname}
                >
                  {location.pathname}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sidebar:</span>
                <span className="text-purple-300 font-medium">
                  {isSidebarOpen ? "Abierto" : "Cerrado"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Dispositivo:</span>
                <span className="text-[#f4ac3a] font-medium">
                  {isMobile ? "Móvil" : "Desktop"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Estado:</span>
                <span
                  className={`font-medium ${
                    isOnline ? "text-[#3d8b40]" : "text-red-300"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
            <div className="text-gray-500 text-xs mt-3 pt-3 border-t border-gray-700 text-center">
              <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">
                Ctrl
              </kbd>{" "}
              +
              <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs mx-1">
                Shift
              </kbd>{" "}
              +<kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">D</kbd>
            </div>
          </motion.div>
        )}

        {/* Botón flotante para mostrar debug panel - elegante */}
        {import.meta.env?.DEV && !showDebugPanel && (
          <motion.button
            onClick={() => setShowDebugPanel(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-6 left-6 w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-2xl shadow-2xl z-50 flex items-center justify-center text-sm font-mono transition-all duration-200 border border-white/10"
            title="Mostrar Debug Panel (Ctrl+Shift+D)"
          >
            <span className="text-[#3d8b40] font-bold">D</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#3d8b40] rounded-full animate-ping"></div>
          </motion.button>
        )}
      </div>
    </CustomErrorBoundary>
  );
};

export default Layout;
