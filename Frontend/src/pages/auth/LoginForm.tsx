// Frontend/src/pages/auth/LoginForm.tsx
// ✅ CORRECCIÓN: Cambiar tipos para consistencia

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// ✅ CORREGIDO: Usar AuthCredentials en lugar de LoginCredentials
// O crear una interfaz local que coincida con AuthCredentials
interface LoginFormData {
  email: string;
  password: string;
}

interface LoginErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
  onAuthSuccess?: (data: any) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onSwitchToForgotPassword,
  onAuthSuccess,
}) => {
  const { login, state } = useAuth();

  // Estados del formulario
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  
  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const isLoading = state.isLoading;

  // Resto de las funciones igual...
  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};

    if (!formData.email) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El correo electrónico no es válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof LoginErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // ✅ CORREGIDO: Pasar datos en el formato correcto para AuthCredentials
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      console.log("🔐 Intentando login con datos:", { 
        email: formData.email, 
        rememberMe 
      });

      // ✅ CORREGIDO: Crear objeto que coincida con AuthCredentials
      await login({
        email: formData.email,
        password: formData.password,
        rememberMe, // ✅ Este campo debe existir en AuthCredentials
      });

      console.log("✅ Login exitoso!");

      if (onAuthSuccess) {
        onAuthSuccess({
          email: formData.email,
          timestamp: new Date().toISOString(),
        });
      }

    } catch (error: any) {
      console.error("❌ Error en login:", error);
      
      setErrors({
        general: error.message || "Error al iniciar sesión. Verifica tus credenciales e intenta nuevamente.",
      });
    }
  };

  // Resto del JSX permanece igual...
  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {(errors.general || state.error) && (
        <motion.div
          className="bg-red-50 border border-red-200 rounded-lg p-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm text-red-600">
            {errors.general || state.error}
          </p>
        </motion.div>
      )}

      {/* Campo de email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Correo Electrónico
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={isLoading}
            className={`
              w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors
              ${errors.email ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"}
              ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
            `}
            placeholder="tu@email.com"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Campo de contraseña */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            disabled={isLoading}
            className={`
              w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors
              ${errors.password ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"}
              ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
            `}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      {/* Opciones adicionales */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading}
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
            Recordarme
          </label>
        </div>

        <button
          type="button"
          onClick={onSwitchToForgotPassword}
          disabled={isLoading}
          className="text-sm text-emerald-600 hover:text-emerald-500 transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {/* Botón de envío */}
      <button
        type="submit"
        disabled={isLoading}
        className={`
          w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white transition-all duration-200
          ${isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transform hover:scale-105"
          }
        `}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Iniciando sesión...
          </>
        ) : (
          <>
            <LogIn className="w-5 h-5 mr-2" />
            Iniciar Sesión
          </>
        )}
      </button>

      {/* Enlace para registro */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          ¿No tienes una cuenta?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            disabled={isLoading}
            className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
          >
            Regístrate aquí
          </button>
        </p>
      </div>

      {/* Información de prueba */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-600 mb-2 font-medium">
          💡 Para pruebas, puedes usar cualquier email válido y contraseña de 6+ caracteres
        </p>
        <p className="text-xs text-blue-500">
          El sistema ahora hace peticiones reales al backend en puerto 5000
        </p>
      </div>
    </motion.form>
  );
};

export default LoginForm;