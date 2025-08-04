// Frontend/src/pages/auth/AuthPage.tsx
// ✅ VERSIÓN CORREGIDA - Errores de tipos y props solucionados

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Shield, Users } from "lucide-react"; // ❌ REMOVIDO: ChevronLeft (no se usa)

// Importaciones
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { useAuth } from "../../context/AuthContext";

// Tipos para los diferentes modos de autenticación
type AuthMode = "login" | "register" | "forgot-password";

// Interfaz para las props de navegación
interface AuthNavigationProps {
  currentMode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  
  // Estados
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ✅ Efecto para redirección automática cuando el usuario se autentica
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      console.log("✅ Usuario autenticado detectado, redirigiendo al dashboard...");
      console.log("👤 Usuario logueado:", state.user);
      
      // Redirección inmediata al dashboard
      navigate("/dashboard", { replace: true });
    }
  }, [state.isAuthenticated, state.user, navigate]);

  // ✅ Efecto para verificar si ya hay una sesión activa al cargar la página
  useEffect(() => {
    // Si ya está autenticado al cargar la página, redirigir inmediatamente
    if (state.isAuthenticated) {
      navigate("/dashboard", { replace: true });
      return;
    }

    // Marcar como carga completada después de verificar autenticación
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [state.isAuthenticated, navigate]);

  // Función para cambiar entre diferentes modos de autenticación con transición
  const handleAuthModeChange = (mode: AuthMode) => {
    if (mode === authMode) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setAuthMode(mode);
      setIsTransitioning(false);
    }, 150);
  };

  // ✅ Función para manejar éxito de autenticación (ya no necesaria, se maneja automáticamente)
  const handleAuthSuccess = (data: any) => {
    console.log("🎉 Autenticación exitosa:", data);
    // La redirección se maneja automáticamente en el useEffect
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

  // ✅ Si está autenticado, mostrar loading mientras redirige
  if (state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo al dashboard...</p>
        </motion.div>
      </div>
    );
  }

  // ✅ Función para renderizar el componente correcto según el modo
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
            onSwitchToForgotPassword={() => handleAuthModeChange("forgot-password")}
            onAuthSuccess={handleAuthSuccess}
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
        // ✅ CORREGIDO: ForgotPasswordForm requiere onBackToLogin y navigation
        return (
          <ForgotPasswordForm
            onBackToLogin={() => handleAuthModeChange("login")}
            navigation={navigationProps}
          />
        );
      default:
        return null;
    }
  };

  // ✅ Mostrar loading durante la carga inicial
  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-pulse text-emerald-600 text-xl font-semibold">
            Cargando...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex">
      {/* Panel izquierdo - Información y branding */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-emerald-800 relative overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Patrón de fondo decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border border-white rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 border border-white rounded-full"></div>
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 flex flex-col justify-center px-12 py-20 text-white">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-6">
              Sistema de Gestión Ganadera
            </h1>
            <p className="text-xl mb-8 text-emerald-100">
              Controla y monitorea tu ganado de manera inteligente con
              tecnología de vanguardia
            </p>
          </motion.div>

          {/* Características destacadas */}
          <motion.div
            className="space-y-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="flex items-center space-x-3">
              <MapPin className="w-6 h-6 text-emerald-200" />
              <span className="text-emerald-100">
                Geolocalización en tiempo real
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-emerald-200" />
              <span className="text-emerald-100">
                Control sanitario avanzado
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-emerald-200" />
              <span className="text-emerald-100">
                Gestión colaborativa
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Panel derecho - Formularios de autenticación */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Header del formulario */}
          <motion.div
            className="text-center mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {getTitle()}
            </h2>
            <p className="text-gray-600">{getSubtitle()}</p>
          </motion.div>

          {/* ✅ Mostrar errores del estado global */}
          {state.error && (
            <motion.div
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-sm text-red-600">{state.error}</p>
            </motion.div>
          )}

          {/* Contenedor del formulario con transiciones */}
          <AnimatePresence mode="wait">
            <motion.div
              key={authMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isTransitioning ? 0.5 : 1, 
                y: isTransitioning ? 10 : 0 
              }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={isTransitioning ? "pointer-events-none" : ""}
            >
              {renderCurrentForm()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;