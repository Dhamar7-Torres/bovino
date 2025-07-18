import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, MapPin, Shield, Users } from "lucide-react";

// Importación de los componentes de autenticación
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";

// Tipos para los diferentes modos de autenticación
type AuthMode = "login" | "register" | "forgot-password";

// Interfaz para las props de navegación
interface AuthNavigationProps {
  currentMode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

const AuthPage: React.FC = () => {
  // Estado para controlar el modo actual de autenticación
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  // Estado para controlar la carga inicial
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  // Estado para mostrar indicador de transición
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Efecto para manejar la carga inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Función para cambiar entre diferentes modos de autenticación con transición
  const handleAuthModeChange = (mode: AuthMode) => {
    if (mode === authMode) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setAuthMode(mode);
      setIsTransitioning(false);
    }, 150);
  };

  // Función para volver al modo de login
  const handleBackToLogin = () => {
    setAuthMode("login");
  };

  // Función para manejar éxito de autenticación
  const handleAuthSuccess = (data: any) => {
    console.log("Authentication successful:", data);
    // Mostrar mensaje de éxito temporal
    setIsInitialLoad(true);
    // TODO: Implementar redirección al dashboard
    setTimeout(() => {
      console.log("Redirecting to dashboard...");
      // window.location.href = '/dashboard';
    }, 1500);
  };

  // Función para obtener el título según el modo actual
  const getTitle = (): string => {
    switch (authMode) {
      case "login":
        return "Bienvenido de Vuelta";
      case "register":
        return "Crear Cuenta";
      case "forgot-password":
        return "Restablecer Contraseña";
      default:
        return "Autenticación";
    }
  };

  // Función para obtener el subtítulo según el modo actual
  const getSubtitle = (): string => {
    switch (authMode) {
      case "login":
        return "Accede a tu panel de gestión ganadera";
      case "register":
        return "Únete a nuestra plataforma de monitoreo ganadero";
      case "forgot-password":
        return "Recupera el acceso a tu cuenta";
      default:
        return "";
    }
  };

  // Función para renderizar el componente correcto según el modo
  const renderCurrentForm = () => {
    const navigationProps: AuthNavigationProps = {
      currentMode: authMode,
      onModeChange: handleAuthModeChange,
    };

    switch (authMode) {
      case "login":
        return (
          <LoginForm
            onSwitchToRegister={() => handleAuthModeChange("register")}
            onSwitchToForgotPassword={() =>
              handleAuthModeChange("forgot-password")
            }
          />
        );
      case "register":
        return (
          <RegisterForm
            onSwitchToLogin={() => handleAuthModeChange("login")}
            onAuthSuccess={handleAuthSuccess}
            navigation={navigationProps}
          />
        );
      case "forgot-password":
        return (
          <ForgotPasswordForm
            onBackToLogin={handleBackToLogin}
            onSwitchToLogin={() => handleAuthModeChange("login")}
            navigation={navigationProps}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80
bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl
opacity-70"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200
rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute top-40 left-1/2 w-60 h-60 bg-indigo-200
rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            scale: [1, 1.3, 1],
            x: [-20, 20, -20],
            y: [-10, 10, -10],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
          }}
        />
      </div>

      {/* Contenedor principal */}
      <motion.div
        className="w-full max-w-4xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isInitialLoad ? 0 : 1, y: isInitialLoad ? 20 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Panel izquierdo - Información y branding */}
          <motion.div
            className="hidden lg:block space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{
              opacity: isInitialLoad ? 0 : 1,
              x: isInitialLoad ? -50 : 0,
            }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {/* Logo y título principal */}
            <motion.div
              className="text-center lg:text-left"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-16
h-16 bg-emerald-500 rounded-2xl mb-6 shadow-lg"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-white text-2xl font-bold">🐄</span>
              </motion.div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Bovino UJAT
              </h1>
              <p className="text-xl text-gray-600">
                Sistema Avanzado de Gestión Ganadera
              </p>
            </motion.div>

            {/* Características del sistema */}
            <div className="space-y-6">
              <motion.div
                className="flex items-center space-x-4 group"
                whileHover={{ x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="flex-shrink-0 w-12 h-12 bg-blue-100
rounded-xl flex items-center justify-center group-hover:bg-blue-200
transition-colors"
                >
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3
                    className="font-semibold
text-gray-900"
                  >
                    Rastreo GPS
                  </h3>
                  <p className="text-gray-600">
                    Monitoreo de ubicación en tiempo real
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center space-x-4 group"
                whileHover={{ x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="flex-shrink-0 w-12 h-12 bg-emerald-100
rounded-xl flex items-center justify-center group-hover:bg-emerald-200
transition-colors"
                >
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Registros de Salud
                  </h3>
                  <p className="text-gray-600">Vacunación e historial médico</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center space-x-4 group"
                whileHover={{ x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="flex-shrink-0 w-12 h-12 bg-indigo-100
rounded-xl flex items-center justify-center group-hover:bg-indigo-200
transition-colors"
                >
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Gestión de Datos
                  </h3>
                  <p className="text-gray-600">
                    Supervisión completa del ganado
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Panel derecho - Formularios de autenticación */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, x: 50 }}
            animate={{
              opacity: isInitialLoad ? 0 : 1,
              x: isInitialLoad ? 50 : 0,
            }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <motion.div
              className="bg-white/80 backdrop-blur-lg rounded-3xl
shadow-2xl p-8 border border-white/20 relative"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              {/* Indicador de transición */}
              <AnimatePresence>
                {isTransitioning && (
                  <motion.div
                    className="absolute inset-0 bg-white/50
backdrop-blur-sm rounded-3xl flex items-center justify-center z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="w-8 h-8 border-2 border-emerald-500
border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Indicador de navegación mejorado */}
              <div className="flex justify-center mb-8">
                <div className="flex items-center space-x-3">
                  {(["login", "register", "forgot-password"] as AuthMode[]).map(
                    (mode, index) => {
                      const isActive = mode === authMode;
                      return (
                        <div
                          key={mode}
                          className="flex
items-center"
                        >
                          <motion.div
                            className={`
                            relative h-3 w-3 rounded-full transition-all
duration-300
                            ${
                              isActive
                                ? "bg-emerald-500 scale-125"
                                : "bg-gray-200"
                            }
                          `}
                            animate={{
                              scale: isActive ? 1.25 : 1,
                            }}
                          >
                            {isActive && (
                              <motion.div
                                className="absolute inset-0
bg-emerald-500 rounded-full"
                                animate={{
                                  scale: [1, 1.5, 1],
                                  opacity: [0.7, 0, 0.7],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                }}
                              />
                            )}
                          </motion.div>
                          {index < 2 && (
                            <div
                              className="w-8 h-0.5 bg-gray-200
mx-2"
                            />
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Etiquetas de navegación */}
              <div className="flex justify-center mb-6">
                <div
                  className="flex items-center space-x-8
text-xs"
                >
                  {[
                    { mode: "login", label: "Iniciar Sesión" },
                    { mode: "register", label: "Registrarse" },
                    { mode: "forgot-password", label: "Recuperar" },
                  ].map(({ mode, label }) => (
                    <span
                      key={mode}
                      className={`
                        transition-colors duration-300 font-medium
                        ${
                          mode === authMode
                            ? "text-emerald-600"
                            : "text-gray-400"
                        }
                      `}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Botón de retroceso para modos que no sean login */}
              {authMode !== "login" && (
                <motion.button
                  onClick={handleBackToLogin}
                  className="flex items-center text-gray-600
hover:text-gray-900 mb-6 group"
                  whileHover={{ x: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronLeft
                    className="w-5 h-5 mr-1
group-hover:text-emerald-600 transition-colors"
                  />
                  <span className="text-sm font-medium">
                    Volver al Inicio de Sesión
                  </span>
                </motion.button>
              )}

              {/* Encabezado del formulario */}
              <motion.div
                className="text-center mb-8"
                key={authMode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2
                  className="text-3xl font-bold text-gray-900
mb-2"
                >
                  {getTitle()}
                </h2>
                <p className="text-gray-600">{getSubtitle()}</p>
              </motion.div>

              {/* Contenedor de formularios con animaciones */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={authMode}
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  {renderCurrentForm()}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Logo móvil - solo visible en pantallas pequeñas */}
            <motion.div
              className="lg:hidden text-center mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isInitialLoad ? 0 : 1,
                y: isInitialLoad ? 20 : 0,
              }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-12
h-12 bg-emerald-500 rounded-xl mb-4"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-white text-lg font-bold">🐄</span>
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900">Bovino UJAT</h3>
              <p className="text-gray-600">Sistema de Gestión Ganadera</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Información de estado en desarrollo */}
      <motion.div
        className="absolute bottom-4 right-4 bg-black/10
backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600 max-w-xs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Modo:</span>
            <span
              className="font-mono
text-emerald-600"
            >
              {authMode}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Entorno:</span>
            <span className="font-mono">Desarrollo</span>
          </div>
          <div className="flex justify-between">
            <span>Módulo:</span>
            <span className="font-mono">Autenticación</span>
          </div>
        </div>
      </motion.div>

      {/* Información de ayuda - solo visible en hover */}
      <motion.div
        className="absolute bottom-4 left-4 bg-white/90
backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600 opacity-0
hover:opacity-100 transition-opacity duration-300 max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0, y: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="space-y-1">
          <p className="font-semibold text-gray-900">Ayuda Rápida:</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
