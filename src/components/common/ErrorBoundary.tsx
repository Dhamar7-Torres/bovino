import React, { Component, ErrorInfo, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, Bug, Send } from "lucide-react";

// Tipos de error para clasificación
type ErrorType =
  | "component"
  | "network"
  | "permission"
  | "validation"
  | "unknown";

// Información del error extendida
interface ErrorDetails {
  type: ErrorType;
  timestamp: Date;
  userAgent: string;
  url: string;
  userId?: string;
  componentStack?: string | null;
  errorBoundary?: string;
}

// Props del ErrorBoundary
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (
    error: Error,
    errorInfo: ErrorInfo,
    errorDetails: ErrorDetails
  ) => void;
  showDetails?: boolean;
  allowRetry?: boolean;
  showReportButton?: boolean;
  className?: string;
  level?: "page" | "component" | "critical";
}

// Estado del ErrorBoundary
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorDetails: ErrorDetails | null;
  retryCount: number;
  isReporting: boolean;
}

// Hook personalizado para manejo de errores en componentes funcionales
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, errorInfo?: any) => {
    console.error("Error capturado por useErrorHandler:", error, errorInfo);

    // Aquí podrías enviar el error a un servicio de logging
    // Por ejemplo: logErrorToService(error, errorInfo);

    // Re-lanzar el error para que sea capturado por el ErrorBoundary
    throw error;
  }, []);

  return { handleError };
};

// Función para clasificar tipos de error
const classifyError = (error: Error): ErrorType => {
  const message = error.message.toLowerCase();

  if (message.includes("network") || message.includes("fetch")) {
    return "network";
  }

  if (message.includes("permission") || message.includes("unauthorized")) {
    return "permission";
  }

  if (message.includes("validation") || message.includes("invalid")) {
    return "validation";
  }

  if (error.name === "ChunkLoadError" || message.includes("loading chunk")) {
    return "component";
  }

  return "unknown";
};

// Función para generar reporte de error
const generateErrorReport = (
  error: Error,
  errorInfo: ErrorInfo,
  errorDetails: ErrorDetails
): string => {
  return `
=== REPORTE DE ERROR ===
Timestamp: ${errorDetails.timestamp.toISOString()}
Tipo: ${errorDetails.type}
URL: ${errorDetails.url}
User Agent: ${errorDetails.userAgent}

Error: ${error.name}
Mensaje: ${error.message}
Stack: ${error.stack || "No disponible"}

Component Stack: ${errorInfo.componentStack || "No disponible"}

Detalles adicionales:
${JSON.stringify(errorDetails, null, 2)}
  `.trim();
};

// Variantes de animación
const containerVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    y: -2,
  },
  tap: {
    scale: 0.95,
  },
};

/**
 * Componente ErrorBoundary para capturar y manejar errores de React
 * Proporciona una interfaz amigable cuando ocurren errores inesperados
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorDetails: null,
      retryCount: 0,
      isReporting: false,
    };
  }

  // Método estático para actualizar el estado cuando ocurre un error
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  // Método de ciclo de vida para capturar información del error
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorDetails: ErrorDetails = {
      type: classifyError(error),
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      componentStack: errorInfo.componentStack || null,
      errorBoundary: this.constructor.name,
    };

    this.setState({
      errorInfo,
      errorDetails,
    });

    // Llamar al callback personalizado si está definido
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorDetails);
    }

    // Log del error para debugging
    console.group("🚨 Error capturado por ErrorBoundary");
    console.error("Error:", error);
    console.error("Error Info:", errorInfo);
    console.error("Error Details:", errorDetails);
    console.groupEnd();
  }

  // Función para reintentar renderizar
  handleRetry = () => {
    const { retryCount } = this.state;
    const maxRetries = 3;

    if (retryCount < maxRetries) {
      this.setState((prevState) => ({
        hasError: false,
        error: null,
        errorInfo: null,
        errorDetails: null,
        retryCount: prevState.retryCount + 1,
      }));

      // Auto-retry después de un delay si falla nuevamente
      this.retryTimeoutId = window.setTimeout(() => {
        if (this.state.hasError && this.state.retryCount < maxRetries) {
          this.handleRetry();
        }
      }, 2000);
    }
  };

  // Función para recargar la página
  handleReload = () => {
    window.location.reload();
  };

  // Función para navegar al inicio
  handleGoHome = () => {
    window.location.href = "/";
  };

  // Función para reportar error
  handleReportError = async () => {
    const { error, errorInfo, errorDetails } = this.state;

    if (!error || !errorInfo || !errorDetails) return;

    this.setState({ isReporting: true });

    try {
      const report = generateErrorReport(error, errorInfo, errorDetails);

      // Aquí podrías enviar el reporte a tu servicio de logging
      // await sendErrorReport(report);

      // Por ahora, copiamos al clipboard
      await navigator.clipboard.writeText(report);
      alert("Reporte de error copiado al portapapeles");
    } catch (reportError) {
      console.error("Error al reportar:", reportError);
      alert("Error al generar el reporte");
    } finally {
      this.setState({ isReporting: false });
    }
  };

  // Limpiar timeouts al desmontar
  componentWillUnmount() {
    if (this.retryTimeoutId) {
      window.clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    const { hasError, error, errorDetails, retryCount, isReporting } =
      this.state;

    const {
      children,
      fallback,
      showDetails = false,
      allowRetry = true,
      showReportButton = true,
      className = "",
      level = "component",
    } = this.props;

    // Si no hay error, renderizar children normalmente
    if (!hasError) {
      return children;
    }

    // Si hay un fallback personalizado, usarlo
    if (fallback) {
      return fallback;
    }

    // Configuración visual según el nivel
    const levelConfig = {
      page: {
        container: "min-h-screen bg-gray-50",
        maxWidth: "max-w-2xl",
        padding: "p-8",
      },
      component: {
        container: "min-h-64 bg-white border border-red-200 rounded-lg",
        maxWidth: "max-w-lg",
        padding: "p-6",
      },
      critical: {
        container: "min-h-screen bg-red-50",
        maxWidth: "max-w-xl",
        padding: "p-8",
      },
    };

    const config = levelConfig[level];
    const maxRetries = 3;

    return (
      <div
        className={`${config.container} flex items-center justify-center ${className}`}
      >
        <motion.div
          className={`${config.maxWidth} w-full ${config.padding} text-center`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          transition={{
            duration: 0.6,
            ease: "easeOut",
          }}
        >
          {/* Ícono de error animado */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              damping: 15,
              stiffness: 200,
              delay: 0.2,
            }}
          >
            <div className="relative">
              <AlertTriangle className="w-16 h-16 text-red-500" />
              <motion.div
                className="absolute inset-0 bg-red-100 rounded-full -z-10"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.2, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>

          {/* Título del error */}
          <motion.h2
            className="text-2xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            ¡Oops! Algo salió mal
          </motion.h2>

          {/* Descripción del error */}
          <motion.p
            className="text-gray-600 mb-6 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Ocurrió un error inesperado en la aplicación.
            {retryCount > 0 && ` (Intento ${retryCount}/${maxRetries})`}
          </motion.p>

          {/* Detalles del error (si está habilitado) */}
          {showDetails && error && (
            <motion.div
              className="bg-gray-100 rounded-lg p-4 mb-6 text-left"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center mb-2">
                <Bug className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Detalles técnicos:
                </span>
              </div>
              <code className="text-xs text-red-600 break-all">
                {error.name}: {error.message}
              </code>
              {errorDetails && (
                <p className="text-xs text-gray-500 mt-2">
                  Tipo: {errorDetails.type} |{" "}
                  {errorDetails.timestamp.toLocaleString()}
                </p>
              )}
            </motion.div>
          )}

          {/* Botones de acción */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {/* Botón de reintentar */}
            {allowRetry && retryCount < maxRetries && (
              <motion.button
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center space-x-2"
                onClick={this.handleRetry}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reintentar</span>
              </motion.button>
            )}

            {/* Botón de recargar */}
            <motion.button
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center space-x-2"
              onClick={this.handleReload}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Recargar Página</span>
            </motion.button>

            {/* Botón de ir al inicio */}
            <motion.button
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center space-x-2"
              onClick={this.handleGoHome}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Home className="w-4 h-4" />
              <span>Ir al Inicio</span>
            </motion.button>
          </motion.div>

          {/* Botón de reportar error */}
          {showReportButton && (
            <motion.div
              className="mt-6 pt-6 border-t border-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <motion.button
                className="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center space-x-2 mx-auto transition-colors duration-200 disabled:opacity-50"
                onClick={this.handleReportError}
                disabled={isReporting}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {isReporting ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <span>Reportando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Reportar Error</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }
}

export default ErrorBoundary;
