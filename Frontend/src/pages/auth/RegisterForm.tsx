import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext"; // ✅ Usar AuthContext

// Tipos para las props del componente
interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onAuthSuccess: (data: any) => void;
  navigation: {
    currentMode: string;
    onModeChange: (mode: any) => void;
  };
}

// Tipos para el estado del formulario
interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Tipos para los errores de validación
interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

// Tipos para los requisitos de contraseña
interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

// Interfaz para manejar errores del servidor
interface ServerError {
  message?: string;
  code?: string;
  field?: string;
  response?: {
    data?: {
      message?: string;
      code?: string;
      field?: string;
    };
  };
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchToLogin,
  onAuthSuccess,
}) => {
  // ✅ USAR HOOK DE AUTENTICACIÓN EN LUGAR DE authService
  const { register, isLoading, error, clearError } = useAuth();

  // Estado para los datos del formulario
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Estado para los errores de validación
  const [errors, setErrors] = useState<FormErrors>({});

  // Estado para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Estado para aceptar términos y condiciones
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);

  // Estado para mostrar requisitos de contraseña
  const [showPasswordRequirements, setShowPasswordRequirements] = useState<boolean>(false);

  // Requisitos de contraseña
  const passwordRequirements: PasswordRequirement[] = [
    { label: "Al menos 8 caracteres", test: (pwd) => pwd.length >= 8 },
    { label: "Una letra mayúscula", test: (pwd) => /[A-Z]/.test(pwd) },
    { label: "Una letra minúscula", test: (pwd) => /[a-z]/.test(pwd) },
    { label: "Un número", test: (pwd) => /\d/.test(pwd) },
    {
      label: "Un carácter especial",
      test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    },
  ];

  // Función para manejar cambios en los inputs
  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }

    // Limpiar error general
    if (errors.general) {
      setErrors((prev) => ({
        ...prev,
        general: undefined,
      }));
    }

    // ✅ Limpiar error del contexto también
    if (error) {
      clearError();
    }
  };

  // Función para validar email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Función para validar contraseña
  const validatePassword = (password: string): boolean => {
    return passwordRequirements.every((req) => req.test(password));
  };

  // Función para validar el formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar nombre
    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es requerido";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "El nombre debe tener al menos 2 caracteres";
    } else if (formData.firstName.trim().length > 50) {
      newErrors.firstName = "El nombre no puede tener más de 50 caracteres";
    }

    // Validar apellido
    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es requerido";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "El apellido debe tener al menos 2 caracteres";
    } else if (formData.lastName.trim().length > 50) {
      newErrors.lastName = "El apellido no puede tener más de 50 caracteres";
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Por favor ingresa un correo electrónico válido";
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "La contraseña no cumple con los requisitos de seguridad";
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Por favor confirma tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para procesar errores del servidor
  const processBackendError = (error: any): void => {
    console.error("Error del servidor:", error);

    // Resetear errores
    const newErrors: FormErrors = {};

    // Manejar estructura de error de respuesta de la API
    let errorData: Partial<ServerError> = {};
    
    if (error?.response?.data) {
      errorData = error.response.data;
    } else if (error?.message || error?.code || error?.field) {
      errorData = {
        message: error.message,
        code: error.code,
        field: error.field
      };
    }

    // Manejar errores específicos por campo
    if (errorData?.field) {
      switch (errorData.field) {
        case "email":
          newErrors.email = errorData.message || "Error con el correo electrónico";
          break;
        case "password":
          newErrors.password = errorData.message || "Error con la contraseña";
          break;
        case "firstName":
          newErrors.firstName = errorData.message || "Error con el nombre";
          break;
        case "lastName":
          newErrors.lastName = errorData.message || "Error con el apellido";
          break;
        default:
          newErrors.general = errorData.message || "Error en el registro";
      }
    } else {
      // Errores generales basados en código
      const errorCode = errorData?.code || '';
      const errorMessage = errorData?.message || '';

      switch (errorCode) {
        case "EMAIL_ALREADY_EXISTS":
          newErrors.email = "Este correo electrónico ya está registrado";
          break;
        case "INVALID_EMAIL":
          newErrors.email = "El formato del correo electrónico no es válido";
          break;
        case "WEAK_PASSWORD":
          newErrors.password = "La contraseña no cumple con los requisitos de seguridad";
          break;
        case "VALIDATION_ERROR":
          newErrors.general = "Algunos datos del formulario no son válidos";
          break;
        case "SERVER_ERROR":
          newErrors.general = "Error del servidor. Por favor intenta más tarde";
          break;
        default:
          // Manejar errores basados en mensaje
          if (errorMessage.toLowerCase().includes("email")) {
            newErrors.email = errorMessage;
          } else if (errorMessage.toLowerCase().includes("password")) {
            newErrors.password = errorMessage;
          } else if (errorMessage.toLowerCase().includes("network") || errorMessage.toLowerCase().includes("fetch")) {
            newErrors.general = "Error de conexión. Verifica tu conexión a internet";
          } else if (errorMessage.toLowerCase().includes("timeout")) {
            newErrors.general = "La solicitud ha tardado demasiado. Intenta nuevamente";
          } else {
            newErrors.general = errorMessage || "Ha ocurrido un error inesperado. Por favor intenta más tarde";
          }
      }
    }

    setErrors(newErrors);
  };

  // ✅ FUNCIÓN ACTUALIZADA: Usar función register del contexto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    // Validar términos y condiciones
    if (!acceptTerms) {
      setErrors({
        general: "Por favor acepta los Términos de Servicio y la Política de Privacidad",
      });
      return;
    }

    try {
      // ✅ PREPARAR DATOS PARA EL CONTEXTO (estructura simplificada)
      const registerData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      console.log("📝 Enviando datos de registro al AuthContext...");

      // ✅ USAR FUNCIÓN DEL CONTEXTO EN LUGAR DE authService
      await register(registerData);

      console.log("✅ Registro exitoso");

      // Mostrar mensaje de éxito
      setTimeout(() => {
        alert(
          `¡Cuenta creada exitosamente para ${formData.firstName}! Ya has sido conectado automáticamente.`
        );
      }, 500);

      // Notificar éxito al componente padre
      onAuthSuccess({
        user: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        },
        timestamp: new Date().toISOString(),
      });

    } catch (error: any) {
      console.error("❌ Error en el registro:", error);
      processBackendError(error);
    }
  };

  // Función para obtener el color del requisito de contraseña
  const getRequirementColor = (requirement: PasswordRequirement): string => {
    if (!formData.password) return "text-gray-400";
    return requirement.test(formData.password) ? "text-emerald-600" : "text-red-500";
  };

  // Variantes de animación para los elementos del formulario
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ✅ Error general del formulario - Combinando errores locales y del contexto */}
      {(errors.general || error) && (
        <motion.div
          className="bg-red-50 border border-red-200 rounded-lg p-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-sm text-red-600 text-center">{errors.general || error}</p>
        </motion.div>
      )}

      {/* Campos de nombre */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
        {/* Primer nombre */}
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Nombre *
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className={`
                w-full pl-10 pr-4 py-3 border rounded-lg text-gray-900 placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                transition-all duration-200 bg-gray-50 focus:bg-white
                ${
                  errors.firstName
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                }
              `}
              placeholder="Tu nombre"
              disabled={isLoading}
              maxLength={50}
            />
          </div>
          {errors.firstName && (
            <motion.p
              className="mt-1 text-sm text-red-600"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.firstName}
            </motion.p>
          )}
        </div>

        {/* Apellido */}
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Apellido *
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className={`
                w-full pl-10 pr-4 py-3 border rounded-lg text-gray-900 placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                transition-all duration-200 bg-gray-50 focus:bg-white
                ${
                  errors.lastName
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                }
              `}
              placeholder="Tu apellido"
              disabled={isLoading}
              maxLength={50}
            />
          </div>
          {errors.lastName && (
            <motion.p
              className="mt-1 text-sm text-red-600"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.lastName}
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Campo de email */}
      <motion.div variants={itemVariants}>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Correo Electrónico *
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          </div>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={`
              w-full pl-10 pr-4 py-3 border rounded-lg text-gray-900 placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
              transition-all duration-200 bg-gray-50 focus:bg-white
              ${
                errors.email
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
              }
            `}
            placeholder="tu@email.com"
            disabled={isLoading}
            autoComplete="email"
          />
        </div>
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
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Contraseña *
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            onFocus={() => setShowPasswordRequirements(true)}
            className={`
              w-full pl-10 pr-12 py-3 border rounded-lg text-gray-900 placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
              transition-all duration-200 bg-gray-50 focus:bg-white
              ${
                errors.password
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
              }
            `}
            placeholder="Crea una contraseña segura"
            disabled={isLoading}
            autoComplete="new-password"
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

        {/* Requisitos de contraseña */}
        {showPasswordRequirements && formData.password && (
          <motion.div
            className="mt-3 p-3 bg-gray-50 rounded-lg border"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Requisitos de contraseña:
            </h4>
            <div className="space-y-1">
              {passwordRequirements.map((requirement, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Check
                    className={`h-4 w-4 ${getRequirementColor(requirement)}`}
                  />
                  <span
                    className={`text-sm ${getRequirementColor(requirement)}`}
                  >
                    {requirement.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

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

      {/* Campo de confirmación de contraseña */}
      <motion.div variants={itemVariants}>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Confirmar Contraseña *
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          </div>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            className={`
              w-full pl-10 pr-12 py-3 border rounded-lg text-gray-900 placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
              transition-all duration-200 bg-gray-50 focus:bg-white
              ${
                errors.confirmPassword
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300"
              }
            `}
            placeholder="Confirma tu contraseña"
            disabled={isLoading}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-emerald-600 transition-colors"
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <motion.p
            className="mt-1 text-sm text-red-600"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errors.confirmPassword}
          </motion.p>
        )}
      </motion.div>

      {/* Términos y condiciones */}
      <motion.div variants={itemVariants}>
        <label className="flex items-start space-x-3 group cursor-pointer">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2 mt-0.5"
            disabled={isLoading}
          />
          <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors leading-relaxed">
            Acepto los{" "}
            <button
              type="button"
              className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
            >
              Términos de Servicio
            </button>{" "}
            y la{" "}
            <button
              type="button"
              className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
            >
              Política de Privacidad
            </button>
          </span>
        </label>
      </motion.div>

      {/* Botón de envío */}
      <motion.div variants={itemVariants}>
        <motion.button
          type="submit"
          disabled={isLoading || !acceptTerms}
          className={`
            w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-semibold
            transition-all duration-200 transform
            ${
              isLoading || !acceptTerms
                ? "bg-emerald-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98]"
            }
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
          `}
          whileHover={!isLoading && acceptTerms ? { y: -2 } : {}}
          whileTap={!isLoading && acceptTerms ? { y: 0 } : {}}
        >
          {isLoading ? (
            <>
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Creando Cuenta...
            </>
          ) : (
            <>
              Crear Cuenta
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Enlace de login */}
      <motion.div variants={itemVariants} className="text-center">
        <p className="text-sm text-gray-600">
          ¿Ya tienes una cuenta?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors"
            disabled={isLoading}
          >
            Inicia sesión aquí
          </button>
        </p>
      </motion.div>

      {/* Información adicional */}
      <motion.div variants={itemVariants} className="text-center">
        <p className="text-xs text-gray-500 leading-relaxed">
          Al crear una cuenta, tendrás acceso a nuestra plataforma de seguimiento ganadero
          con monitoreo GPS, registros de salud y herramientas de gestión de hatos.
        </p>
      </motion.div>

      {/* ✅ Estado de conexión actualizado */}
      {isLoading && (
        <motion.div variants={itemVariants} className="text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              🔄 Creando cuenta a través del AuthContext... Esto puede tomar unos segundos.
            </p>
          </div>
        </motion.div>
      )}

      {/* ✅ Información de conexión con AuthContext */}
      <motion.div variants={itemVariants} className="text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-green-700">
            <strong>🟢 Usando AuthContext:</strong> Registro integrado con gestión de estado unificada
          </p>
          <p className="text-xs text-green-600 mt-1">
            Loading: {isLoading ? 'Sí' : 'No'} | Términos: {acceptTerms ? 'Aceptados' : 'Pendientes'}
          </p>
        </div>
      </motion.div>
    </motion.form>
  );
};

export default RegisterForm;