import React, {
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Info,
  Search,
  Hash,
  Mail,
  Phone,
  Lock,
  User,
  FileText,
  Tag,
  Weight,
  Clock,
} from "lucide-react";

// Tipos de campo disponibles
type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "search"
  | "textarea"
  | "select"
  | "multiselect"
  | "ear-tag" // Específico para arete de bovino
  | "weight" // Específico para peso
  | "age" // Específico para edad
  | "breed" // Específico para raza
  | "veterinarian" // Específico para veterinario
  | "vaccine" // Específico para vacuna
  | "disease"; // Específico para enfermedad

// Estados de validación
type ValidationState = "idle" | "validating" | "valid" | "invalid";

// Reglas de validación
interface ValidationRule {
  type:
    | "required"
    | "minLength"
    | "maxLength"
    | "pattern"
    | "custom"
    | "earTag"
    | "weight"
    | "age";
  value?: any;
  message: string;
  validator?: (value: string) => boolean;
}

// Opciones para select
interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  group?: string;
}

// Props del FormField
interface FormFieldProps {
  type?: FieldType;
  name: string;
  label?: string;
  placeholder?: string;
  value?: string | number | string[];
  defaultValue?: string | number | string[];
  onChange?: (value: any, name: string) => void;
  onBlur?: (name: string) => void;
  onFocus?: (name: string) => void;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;

  // Validación
  validationRules?: ValidationRule[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  externalError?: string;

  // Estilo y apariencia
  size?: "small" | "medium" | "large";
  variant?: "default" | "filled" | "bordered";
  className?: string;

  // Opciones para select
  options?: SelectOption[];
  searchable?: boolean;
  clearable?: boolean;

  // Textarea específico
  rows?: number;
  maxLength?: number;

  // Características especiales
  showCharacterCount?: boolean;
  helpText?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;

  // Contexto ganadero
  cattleContext?: boolean;
  enableSuggestions?: boolean;
  onSuggestionSelect?: (suggestion: string) => void;
}

// Ref interface para métodos externos
interface FormFieldRef {
  focus: () => void;
  blur: () => void;
  validate: () => boolean;
  reset: () => void;
  getValue: () => any;
  setValue: (value: any) => void;
}

// Configuraciones de tamaño
const sizeConfigs = {
  small: {
    input: "px-3 py-2 text-sm",
    select: "px-3 py-2 text-sm",
    textarea: "px-3 py-2 text-sm",
    label: "text-sm",
    help: "text-xs",
    icon: "w-4 h-4",
  },
  medium: {
    input: "px-4 py-3 text-base",
    select: "px-4 py-3 text-base",
    textarea: "px-4 py-3 text-base",
    label: "text-sm",
    help: "text-sm",
    icon: "w-5 h-5",
  },
  large: {
    input: "px-5 py-4 text-lg",
    select: "px-5 py-4 text-lg",
    textarea: "px-5 py-4 text-lg",
    label: "text-base",
    help: "text-base",
    icon: "w-6 h-6",
  },
} as const;

// Configuraciones de variante
const variantConfigs = {
  default: {
    base: "border border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
    error: "border-red-500 focus:border-red-500 focus:ring-red-200",
    success: "border-green-500 focus:border-green-500 focus:ring-green-200",
  },
  filled: {
    base: "border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
    error:
      "border-red-500 bg-red-50 focus:bg-white focus:border-red-500 focus:ring-red-200",
    success:
      "border-green-500 bg-green-50 focus:bg-white focus:border-green-500 focus:ring-green-200",
  },
  bordered: {
    base: "border-2 border-gray-300 bg-white focus:border-blue-500",
    error: "border-2 border-red-500 focus:border-red-500",
    success: "border-2 border-green-500 focus:border-green-500",
  },
};

// Íconos por tipo de campo
const fieldIcons: Record<string, React.ReactNode> = {
  text: <FileText className="w-full h-full" />,
  email: <Mail className="w-full h-full" />,
  password: <Lock className="w-full h-full" />,
  number: <Hash className="w-full h-full" />,
  tel: <Phone className="w-full h-full" />,
  search: <Search className="w-full h-full" />,
  "ear-tag": <Tag className="w-full h-full" />,
  weight: <Weight className="w-full h-full" />,
  age: <Clock className="w-full h-full" />,
  breed: <User className="w-full h-full" />,
  veterinarian: <User className="w-full h-full" />,
  vaccine: <FileText className="w-full h-full" />,
  disease: <AlertCircle className="w-full h-full" />,
};

// Sugerencias por contexto ganadero
const cattleSuggestions: Record<string, string[]> = {
  breed: [
    "Holstein",
    "Jersey",
    "Angus",
    "Hereford",
    "Simmental",
    "Charolais",
    "Brahman",
    "Limousin",
    "Gelbvieh",
    "Red Angus",
    "Brown Swiss",
  ],
  vaccine: [
    "Brucelosis",
    "Fiebre Aftosa",
    "Carbunco",
    "Clostridiosis",
    "Leptospirosis",
    "Rinotraqueítis",
    "Diarrea Viral Bovina",
    "Parainfluenza",
    "Rabia",
  ],
  disease: [
    "Mastitis",
    "Neumonía",
    "Diarrea",
    "Cojera",
    "Infección Uterina",
    "Problemas Digestivos",
    "Infección Respiratoria",
    "Lesiones",
  ],
  veterinarian: [
    "Dr. García López",
    "Dra. Martínez Silva",
    "Dr. Rodríguez Pérez",
    "Dra. Hernández Torres",
    "Dr. González Morales",
  ],
};

// Validadores específicos para ganadería
const cattleValidators: Record<string, (value: string) => boolean> = {
  earTag: (value: string): boolean => {
    // Formato típico: 2-4 letras seguidas de 3-6 números
    const earTagPattern = /^[A-Z]{2,4}[0-9]{3,6}$/i;
    return earTagPattern.test(value);
  },

  weight: (value: string): boolean => {
    const weight = parseFloat(value);
    return weight > 0 && weight <= 2000; // Peso razonable para bovinos
  },

  age: (value: string): boolean => {
    const age = parseInt(value);
    return age >= 0 && age <= 30; // Edad razonable para bovinos
  },
};

/**
 * Componente FormField reutilizable para formularios de la aplicación de ganado
 * Incluye validación, sugerencias específicas para ganadería y múltiples tipos de campo
 */
const FormField = forwardRef<FormFieldRef, FormFieldProps>(
  (
    {
      type = "text",
      name,
      label,
      placeholder,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      disabled = false,
      readonly = false,
      required = false,
      autoComplete,
      autoFocus = false,

      // Validación
      validationRules = [],
      validateOnChange = true,
      validateOnBlur = true,
      externalError,

      // Estilo
      size = "medium",
      variant = "default",
      className = "",

      // Select options
      options = [],

      // Textarea
      rows = 4,
      maxLength,

      // Características especiales
      showCharacterCount = false,
      helpText,
      prefix,
      suffix,

      // Contexto ganadero
      cattleContext = false,
      enableSuggestions = false,
      onSuggestionSelect,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue ?? "");
    const [validationState, setValidationState] =
      useState<ValidationState>("idle");
    const [validationMessage, setValidationMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const currentValue = value !== undefined ? value : internalValue;
    const sizeConfig = sizeConfigs[size];
    const variantConfig = variantConfigs[variant];

    // Validar campo
    const validateField = useCallback(
      (val: any): { isValid: boolean; message: string } => {
        const stringValue = String(val || "");

        // Validación requerido
        if (required && !stringValue.trim()) {
          return { isValid: false, message: "Este campo es obligatorio" };
        }

        // Validaciones personalizadas
        for (const rule of validationRules) {
          switch (rule.type) {
            case "required":
              if (!stringValue.trim()) {
                return { isValid: false, message: rule.message };
              }
              break;

            case "minLength":
              if (stringValue.length < rule.value) {
                return { isValid: false, message: rule.message };
              }
              break;

            case "maxLength":
              if (stringValue.length > rule.value) {
                return { isValid: false, message: rule.message };
              }
              break;

            case "pattern":
              if (!rule.value.test(stringValue)) {
                return { isValid: false, message: rule.message };
              }
              break;

            case "earTag":
              if (!cattleValidators.earTag(stringValue)) {
                return { isValid: false, message: rule.message };
              }
              break;

            case "weight":
              if (!cattleValidators.weight(stringValue)) {
                return { isValid: false, message: rule.message };
              }
              break;

            case "age":
              if (!cattleValidators.age(stringValue)) {
                return { isValid: false, message: rule.message };
              }
              break;

            case "custom":
              if (rule.validator && !rule.validator(stringValue)) {
                return { isValid: false, message: rule.message };
              }
              break;
          }
        }

        return { isValid: true, message: "" };
      },
      [required, validationRules]
    );

    // Obtener sugerencias
    const getSuggestions = useCallback(
      (inputValue: string): string[] => {
        if (!cattleContext || !enableSuggestions || !inputValue.trim()) {
          return [];
        }

        const suggestionList = cattleSuggestions[type] || [];
        return suggestionList
          .filter((suggestion) =>
            suggestion.toLowerCase().includes(inputValue.toLowerCase())
          )
          .slice(0, 5);
      },
      [cattleContext, enableSuggestions, type]
    );

    // Manejar cambio de valor
    const handleChange = useCallback(
      (newValue: any) => {
        if (value === undefined) {
          setInternalValue(newValue);
        }

        onChange?.(newValue, name);

        // Validar en cambio si está habilitado
        if (validateOnChange) {
          const validation = validateField(newValue);
          setValidationState(validation.isValid ? "valid" : "invalid");
          setValidationMessage(validation.message);
        }

        // Mostrar sugerencias
        if (
          cattleContext &&
          enableSuggestions &&
          typeof newValue === "string"
        ) {
          const newSuggestions = getSuggestions(newValue);
          setSuggestions(newSuggestions);
          setShowSuggestions(newSuggestions.length > 0);
        }
      },
      [
        value,
        onChange,
        name,
        validateOnChange,
        validateField,
        cattleContext,
        enableSuggestions,
        getSuggestions,
      ]
    );

    // Manejar focus
    const handleFocus = useCallback(() => {
      setIsFocused(true);
      onFocus?.(name);

      if (cattleContext && enableSuggestions) {
        const currentSuggestions = getSuggestions(String(currentValue));
        setSuggestions(currentSuggestions);
        setShowSuggestions(currentSuggestions.length > 0);
      }
    }, [
      onFocus,
      name,
      cattleContext,
      enableSuggestions,
      getSuggestions,
      currentValue,
    ]);

    // Manejar blur
    const handleBlur = useCallback(() => {
      setIsFocused(false);
      setShowSuggestions(false);
      onBlur?.(name);

      // Validar en blur si está habilitado
      if (validateOnBlur) {
        const validation = validateField(currentValue);
        setValidationState(validation.isValid ? "valid" : "invalid");
        setValidationMessage(validation.message);
      }
    }, [onBlur, name, validateOnBlur, validateField, currentValue]);

    // Manejar selección de sugerencia
    const handleSuggestionSelect = useCallback(
      (suggestion: string) => {
        handleChange(suggestion);
        setShowSuggestions(false);
        onSuggestionSelect?.(suggestion);
      },
      [handleChange, onSuggestionSelect]
    );

    // Exponer métodos via ref
    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          // Implementar focus según el tipo de campo
        },
        blur: () => {
          setIsFocused(false);
          setShowSuggestions(false);
        },
        validate: () => {
          const validation = validateField(currentValue);
          setValidationState(validation.isValid ? "valid" : "invalid");
          setValidationMessage(validation.message);
          return validation.isValid;
        },
        reset: () => {
          const resetValue = defaultValue ?? "";
          if (value === undefined) {
            setInternalValue(resetValue);
          }
          setValidationState("idle");
          setValidationMessage("");
          onChange?.(resetValue, name);
        },
        getValue: () => currentValue,
        setValue: (newValue: any) => {
          handleChange(newValue);
        },
      }),
      [
        currentValue,
        validateField,
        defaultValue,
        value,
        onChange,
        name,
        handleChange,
      ]
    );

    // Determinar estado visual
    const getFieldState = () => {
      if (externalError) return "error";
      if (validationState === "invalid") return "error";
      if (validationState === "valid") return "success";
      return "base";
    };

    const fieldState = getFieldState();
    const finalError = externalError || validationMessage;
    const fieldIcon = prefix || fieldIcons[type] || fieldIcons.text;

    // Clases CSS
    const baseClasses = `
      w-full rounded-lg transition-all duration-200 focus:outline-none
      ${variantConfig[fieldState]}
      ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      ${readonly ? "bg-gray-100" : ""}
    `;

    // Renderizar campo según tipo
    const renderField = () => {
      switch (type) {
        case "textarea":
          return (
            <textarea
              name={name}
              value={String(currentValue)}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              disabled={disabled}
              readOnly={readonly}
              required={required}
              autoComplete={autoComplete}
              autoFocus={autoFocus}
              rows={rows}
              maxLength={maxLength}
              className={`${baseClasses} ${sizeConfig.textarea} resize-vertical`}
            />
          );

        case "select":
          return (
            <select
              name={name}
              value={String(currentValue)}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={disabled}
              required={required}
              className={`${baseClasses} ${sizeConfig.select}`}
            >
              {placeholder && (
                <option value="" disabled>
                  {placeholder}
                </option>
              )}
              {options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))}
            </select>
          );

        default:
          const inputType =
            type === "password" && showPassword
              ? "text"
              : type === "ear-tag" ||
                type === "breed" ||
                type === "veterinarian" ||
                type === "vaccine" ||
                type === "disease"
              ? "text"
              : type === "weight" || type === "age"
              ? "number"
              : type;

          return (
            <div className="relative">
              <input
                type={inputType}
                name={name}
                value={String(currentValue)}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                disabled={disabled}
                readOnly={readonly}
                required={required}
                autoComplete={autoComplete}
                autoFocus={autoFocus}
                maxLength={maxLength}
                className={`${baseClasses} ${sizeConfig.input} ${
                  fieldIcon ? "pl-10" : ""
                } ${type === "password" || suffix ? "pr-10" : ""}`}
              />

              {/* Ícono prefijo */}
              {fieldIcon && (
                <div
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${sizeConfig.icon}`}
                >
                  {fieldIcon}
                </div>
              )}

              {/* Botón mostrar/ocultar contraseña */}
              {type === "password" && (
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? (
                    <EyeOff className={sizeConfig.icon} />
                  ) : (
                    <Eye className={sizeConfig.icon} />
                  )}
                </motion.button>
              )}

              {/* Sufijo */}
              {suffix && (
                <div
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${sizeConfig.icon}`}
                >
                  {suffix}
                </div>
              )}
            </div>
          );
      }
    };

    return (
      <div className={`space-y-2 ${className}`}>
        {/* Label */}
        {label && (
          <motion.label
            htmlFor={name}
            className={`block font-medium text-gray-700 ${sizeConfig.label}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
            {validationState === "valid" && (
              <CheckCircle className="inline w-4 h-4 text-green-500 ml-2" />
            )}
          </motion.label>
        )}

        {/* Campo principal */}
        <div className="relative">
          {renderField()}

          {/* Sugerencias */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && isFocused && (
              <motion.div
                className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors duration-150"
                    whileHover={{ backgroundColor: "#F9FAFB" }}
                  >
                    <span className="text-sm text-gray-900">{suggestion}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Información adicional */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {/* Error o ayuda */}
            <AnimatePresence mode="wait">
              {finalError ? (
                <motion.div
                  key="error"
                  className={`flex items-center text-red-600 ${sizeConfig.help}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span>{finalError}</span>
                </motion.div>
              ) : helpText ? (
                <motion.div
                  key="help"
                  className={`flex items-center text-gray-500 ${sizeConfig.help}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Info className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span>{helpText}</span>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Contador de caracteres */}
          {showCharacterCount && maxLength && (
            <motion.div
              className={`text-gray-400 ${sizeConfig.help} ml-2`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {String(currentValue).length}/{maxLength}
            </motion.div>
          )}
        </div>
      </div>
    );
  }
);

FormField.displayName = "FormField";

export default FormField;
