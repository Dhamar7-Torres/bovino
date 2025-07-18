import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Props del componente LoginForm
interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onSwitchToForgotPassword,
}) => {
  // Hook para navegación
  const navigate = useNavigate();

  // Estados del formulario
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Variantes de animación para los elementos del formulario
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Función para manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Función para validar el formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar email
    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Formato de email inválido";
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simular petición de login
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Verificar si es un usuario temporal válido
      const validUsers = [
        {
          email: "admin@bovinoujat.com",
          password: "admin123",
          role: "admin",
          name: "Administrador",
        },
        {
          email: "veterinario@bovinoujat.com",
          password: "vet123",
          role: "veterinario",
          name: "Dr. Veterinario",
        },
      ];

      const user = validUsers.find(
        (u) => u.email === formData.email && u.password === formData.password
      );

      if (user) {
        // Login exitoso con usuario temporal
        const authData = {
          id: `temp-${user.role}-${Date.now()}`,
          email: user.email,
          name: user.name,
          role: user.role,
          rememberMe,
        };

        console.log("Login successful:", authData);

        // Simular almacenamiento en localStorage (temporal)
        localStorage.setItem("currentUser", JSON.stringify(authData));

        // Redirigir al dashboard
        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      } else {
        // Credenciales inválidas
        setErrors({
          general:
            "Credenciales incorrectas. Usa las credenciales temporales o regístrate.",
        });
      }
    } catch (error) {
      setErrors({
        general:
          "Error al iniciar sesión. Verifica tu conexión e intenta nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Error general */}
      {errors.general && (
        <motion.div
          className="bg-red-50 border border-red-200 rounded-lg p-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm text-red-600">{errors.general}</p>
        </motion.div>
      )}

      {/* Campo de email */}
      <motion.div variants={itemVariants}>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Correo Electrónico
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={`
            w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors
            ${
              errors.email
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300"
            }
          `}
          placeholder="Ingresa tu correo electrónico"
          disabled={isLoading}
        />
        {errors.email && (
          <motion.p
            className="mt-1 text-sm text-red-600"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.email}
          </motion.p>
        )}
      </motion.div>

      {/* Campo de contraseña */}
      <motion.div variants={itemVariants}>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Contraseña
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`
              w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors
              ${
                errors.password
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
              }
            `}
            placeholder="Ingresa tu contraseña"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-emerald-600 transition-colors"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {errors.password && (
          <motion.p
            className="mt-1 text-sm text-red-600"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.password}
          </motion.p>
        )}
      </motion.div>

      {/* Opciones adicionales */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <label className="flex items-center group cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
            disabled={isLoading}
          />
          <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
            Recordarme
          </span>
        </label>

        <button
          type="button"
          onClick={onSwitchToForgotPassword}
          className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline transition-colors font-medium"
          disabled={isLoading}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </motion.div>

      {/* Botón de envío - Solo con icono derecho */}
      <motion.div variants={itemVariants}>
        <motion.button
          type="submit"
          disabled={isLoading}
          className={`
            w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-semibold
            transition-all duration-200 transform
            ${
              isLoading
                ? "bg-emerald-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98]"
            }
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
          `}
          whileHover={!isLoading ? { y: -2 } : {}}
          whileTap={!isLoading ? { y: 0 } : {}}
        >
          {isLoading ? (
            <>
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              Iniciando sesión...
            </>
          ) : (
            <>
              Iniciar Sesión
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Enlace de registro */}
      <motion.div variants={itemVariants} className="text-center">
        <p className="text-sm text-gray-600">
          ¿No tienes una cuenta?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium transition-colors"
            disabled={isLoading}
          >
            Regístrate aquí
          </button>
        </p>
      </motion.div>

      {/* Divider */}
      <motion.div variants={itemVariants} className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">Acceso Rápido</span>
        </div>
      </motion.div>

      {/* Botones de acceso rápido para desarrollo */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        <motion.button
          type="button"
          onClick={() => {
            setFormData({
              email: "admin@bovinoujat.com",
              password: "admin123",
            });
            setRememberMe(true);
          }}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          👨‍💼 Administrador
        </motion.button>
        <motion.button
          type="button"
          onClick={() => {
            setFormData({
              email: "veterinario@bovinoujat.com",
              password: "vet123",
            });
            setRememberMe(true);
          }}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          🩺 Veterinario
        </motion.button>
      </motion.div>

      {/* Información de usuarios temporales */}
      <motion.div variants={itemVariants} className="text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            <strong>🔧 Modo de Desarrollo:</strong> Usa los botones de acceso
            rápido para entrar con credenciales temporales y explorar la
            aplicación.
          </p>
        </div>
      </motion.div>
    </motion.form>
  );
};

export default LoginForm;
