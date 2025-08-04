import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { authService } from "../../services/authService"; // ✅ Importar authService real

// Props del componente
interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
  navigation: {
    currentMode: string;
    onModeChange: (mode: any) => void;
  };
}

// Tipos para el estado del formulario
interface ForgotPasswordFormData {
  email: string;
}

// Tipos para los errores de validación
interface FormErrors {
  email?: string;
  general?: string;
}

// Estados del proceso de recuperación
type RecoveryState = "initial" | "sending" | "sent" | "error";

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBackToLogin,
  navigation,
}) => {
  // Estados del componente
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [recoveryState, setRecoveryState] = useState<RecoveryState>("initial");
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const [sentToEmail, setSentToEmail] = useState<string>("");

  // Función para manejar cambios en el input
  const handleInputChange = (value: string) => {
    setFormData({ email: value });

    // Limpiar errores cuando el usuario empiece a escribir
    if (errors.email) {
      setErrors((prev) => ({
        ...prev,
        email: undefined,
      }));
    }
  };

  // Función para validar email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Función para validar el formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "La dirección de correo electrónico es requerida";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Por favor ingresa una dirección de correo electrónico válida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para iniciar el contador de reenvío
  const startResendCountdown = () => {
    setResendCountdown(60);
    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ✅ FUNCIÓN REAL - Conectada al backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setRecoveryState("sending");
    setErrors({});

    try {
      console.log("🔄 Enviando solicitud de restablecimiento para:", formData.email);

      // ✅ PETICIÓN REAL AL BACKEND usando authService
      await authService.forgotPassword(formData.email);

      // Si llegamos aquí, la petición fue exitosa
      setSentToEmail(formData.email);
      setRecoveryState("sent");
      startResendCountdown();
      
      console.log("✅ Email de restablecimiento enviado exitosamente al backend");

    } catch (error: any) {
      console.error("❌ Error enviando email de restablecimiento:", error);
      
      setRecoveryState("error");
      
      // Manejar diferentes tipos de errores del backend
      let errorMessage = "Error al enviar el correo de restablecimiento. Por favor intenta más tarde.";
      
      if (error.message) {
        if (error.message.includes("not found") || error.message.includes("no encontrado")) {
          errorMessage = "Dirección de correo electrónico no encontrada. Por favor verifica tu correo o crea una nueva cuenta.";
        } else if (error.message.includes("rate limit") || error.message.includes("too many")) {
          errorMessage = "Demasiados intentos. Por favor espera unos minutos antes de intentar de nuevo.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors({ general: errorMessage });
    }
  };

  // ✅ FUNCIÓN REAL - Reenvío conectado al backend
  const handleResendEmail = async () => {
    if (resendCountdown > 0) return;

    setRecoveryState("sending");

    try {
      console.log("🔄 Reenviando email de restablecimiento para:", sentToEmail);

      // ✅ PETICIÓN REAL AL BACKEND
      await authService.forgotPassword(sentToEmail);

      setRecoveryState("sent");
      startResendCountdown();
      
      console.log("✅ Email de restablecimiento reenviado exitosamente");

    } catch (error: any) {
      console.error("❌ Error reenviando email:", error);
      
      setRecoveryState("error");
      setErrors({
        general: error.message || "No se pudo reenviar el correo. Por favor intenta de nuevo.",
      });
    }
  };

  // Función para volver al formulario inicial
  const handleTryAgain = () => {
    setRecoveryState("initial");
    setFormData({ email: "" });
    setErrors({});
    setSentToEmail("");
    setResendCountdown(0);
  };

  // Función para ir al registro
  const handleGoToRegister = () => {
    navigation.onModeChange("register");
  };

  // Variantes de animación
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  // Función para renderizar el contenido según el estado
  const renderContent = () => {
    switch (recoveryState) {
      case "initial":
      case "sending":
        return (
          <motion.div variants={formVariants} initial="hidden" animate="visible">
            {/* Descripción */}
            <motion.div variants={itemVariants} className="text-center mb-6">
              <p className="text-gray-600 leading-relaxed">
                Ingresa tu dirección de correo electrónico y te enviaremos un
                enlace para restablecer tu contraseña.
              </p>
            </motion.div>

            {/* Error general del formulario */}
            {errors.general && (
              <motion.div
                className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              </motion.div>
            )}

            {/* Campo de email */}
            <motion.div variants={itemVariants}>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Correo Electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange(e.target.value)}
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
                  placeholder="Ingresa tu dirección de correo electrónico"
                  disabled={recoveryState === "sending"}
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

            {/* Botón de envío */}
            <motion.div variants={itemVariants} className="mt-6">
              <motion.button
                type="submit"
                disabled={recoveryState === "sending"}
                className={`
                  w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-semibold
                  transition-all duration-200 transform
                  ${
                    recoveryState === "sending"
                      ? "bg-emerald-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98]"
                  }
                  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                `}
                whileHover={recoveryState !== "sending" ? { y: -2 } : {}}
                whileTap={recoveryState !== "sending" ? { y: 0 } : {}}
              >
                {recoveryState === "sending" ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    Enviando Enlace de Restablecimiento...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    Enviar Enlace de Restablecimiento
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        );

      case "sent":
        return (
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Icono de éxito */}
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </motion.div>

            {/* Mensaje de éxito */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ✅ Correo Enviado
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Hemos enviado un enlace de restablecimiento de contraseña a{" "}
                <span className="font-semibold text-gray-900">
                  {sentToEmail}
                </span>
              </p>
            </div>

            {/* Instrucciones */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="text-left">
                  <h4 className="font-semibold text-blue-900 mb-1">
                    ¿Qué sigue?
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Revisa tu bandeja de entrada (y carpeta de spam)</li>
                    <li>• Haz clic en el enlace de restablecimiento en el correo</li>
                    <li>• Crea una nueva contraseña</li>
                    <li>• Inicia sesión con tus nuevas credenciales</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botón de reenvío */}
            <div>
              {resendCountdown > 0 ? (
                <p className="text-sm text-gray-500">
                  ¿No recibiste el correo? Puedes reenviarlo en{" "}
                  <span className="font-semibold text-emerald-600">
                    {resendCountdown}s
                  </span>
                </p>
              ) : (
                <motion.button
                  onClick={handleResendEmail}
                  className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw className="w-4 h-4 inline mr-1" />
                  Reenviar correo de restablecimiento
                </motion.button>
              )}
            </div>
          </motion.div>
        );

      case "error":
        return (
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Icono de error */}
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <AlertCircle className="w-8 h-8 text-red-600" />
            </motion.div>

            {/* Mensaje de error */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ❌ Error en el Envío
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {errors.general || "Encontramos un error al procesar tu solicitud."}
              </p>
            </div>

            {/* Botón para intentar de nuevo */}
            <motion.button
              onClick={handleTryAgain}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Intentar de Nuevo
            </motion.button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={recoveryState}
          variants={formVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      {/* Enlaces de navegación */}
      <motion.div
        variants={itemVariants}
        className="text-center pt-4 border-t border-gray-200"
        initial="hidden"
        animate="visible"
      >
        <p className="text-sm text-gray-600">
          ¿Recuerdas tu contraseña?{" "}
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors"
            disabled={recoveryState === "sending"}
          >
            Volver al Inicio de Sesión
          </button>
        </p>

        {recoveryState === "initial" && (
          <p className="text-xs text-gray-500 mt-2">
            ¿No tienes una cuenta?{" "}
            <button
              type="button"
              onClick={handleGoToRegister}
              className="text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
            >
              Crear una aquí
            </button>
          </p>
        )}
      </motion.div>

      {/* ✅ Información de conexión real */}
      <motion.div
        className="text-center"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-green-700">
            <strong>🟢 Conectado al Backend:</strong> Las peticiones se envían a 
            <code className="mx-1 px-1 bg-green-100 rounded">
              http://localhost:5000/api/v1/auth/forgot-password
            </code>
          </p>
          <p className="text-xs text-green-600 mt-1">
            Estado actual: {recoveryState} | Email: {formData.email || 'No ingresado'}
          </p>
        </div>
      </motion.div>
    </form>
  );
};

export default ForgotPasswordForm;