// Frontend/src/pages/AuthPage.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from "../../context/AuthContext";
import RegisterForm from '../auth/RegisterForm';
import LoginForm from '../auth/LoginForm';

// Tipos para los modos de autenticación
type AuthMode = 'login' | 'register';

const AuthPage: React.FC = () => {
  // Usar el hook de autenticación
  const { user, isLoading, isAuthenticated, error, clearError } = useAuth();
  
  // Estado para el modo actual (login o register)
  const [currentMode, setCurrentMode] = useState<AuthMode>('login');

  // Si el usuario está autenticado, mostrar dashboard
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            ¡Bienvenido, {user.firstName}!
          </h1>
          <p className="text-gray-600 mb-6">
            Has iniciado sesión correctamente en el sistema de gestión ganadera.
          </p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-emerald-700">
              <strong>Email:</strong> {user.email}<br />
              <strong>Rol:</strong> {user.role}<br />
              <strong>Estado:</strong> {user.isActive ? 'Activo' : 'Inactivo'}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Ir al Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // Funciones para cambiar entre modos
  const switchToLogin = () => {
    setCurrentMode('login');
    clearError();
  };

  const switchToRegister = () => {
    setCurrentMode('register');
    clearError();
  };

  // Función para manejar éxito de autenticación
  const handleAuthSuccess = (data: any) => {
    console.log('🎉 Autenticación exitosa:', data);
    // El contexto ya maneja el estado, no necesitamos hacer nada más
  };

  // Función para manejar "olvidé mi contraseña"
  const handleForgotPassword = () => {
    console.log('Función de recuperación de contraseña');
    // Aquí implementarías la lógica para recuperar contraseña
  };

  // Props para navegación
  const navigationProps = {
    currentMode,
    onModeChange: setCurrentMode,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold text-gray-800 mb-2"
          >
            🐄 GanaderoApp
          </motion.h1>
          <p className="text-gray-600">
            Sistema de gestión ganadera inteligente
          </p>
        </div>

        {/* Pestañas de navegación */}
        <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
          <button
            onClick={switchToLogin}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              currentMode === 'login'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={switchToRegister}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              currentMode === 'register'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Error global */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6"
          >
            <p className="text-sm text-red-600 text-center">{error}</p>
            <button
              onClick={clearError}
              className="mt-2 w-full text-xs text-red-500 hover:text-red-700 underline"
            >
              Cerrar
            </button>
          </motion.div>
        )}

        {/* Indicador de carga global */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6"
          >
            <div className="flex items-center justify-center">
              <motion.div
                className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-sm text-blue-700">Procesando...</p>
            </div>
          </motion.div>
        )}

        {/* Formularios */}
        <AnimatePresence mode="wait">
          {currentMode === 'register' ? (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RegisterForm
                onSwitchToLogin={switchToLogin}
                onAuthSuccess={handleAuthSuccess}
                navigation={navigationProps}
              />
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <LoginForm
                onSwitchToRegister={switchToRegister}
                onAuthSuccess={handleAuthSuccess}
                onSwitchToForgotPassword={handleForgotPassword}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2024 GanaderoApp. Gestión inteligente de ganado bovino.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;