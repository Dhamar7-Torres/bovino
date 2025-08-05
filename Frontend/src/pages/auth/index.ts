// Exportaciones principales del módulo de autenticación
// Nota: Los componentes se deben importar cuando estén disponibles
export { default as AuthPage } from './AuthPage';
export { default as LoginForm } from './LoginForm';
export { default as RegisterForm } from './RegisterForm';
export { default as ForgotPasswordForm } from './ForgotPasswordForm';

// Tipos y interfaces del módulo de autenticación
export type AuthMode = "login" | "register" | "forgot-password";

export interface AuthNavigationProps {
  currentMode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

export interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}

export interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onAuthSuccess: (data: any) => void;
  navigation: AuthNavigationProps;
}

export interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
  onSwitchToLogin: () => void;
  navigation: AuthNavigationProps;
}

// Tipos para datos de autenticación
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

// Tipos para errores de validación
export interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  general?: string;
}

// Tipos para respuestas de autenticación
export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

// Estados de recuperación de contraseña
export type RecoveryState = "initial" | "sending" | "sent" | "error";

// Tipos para requisitos de contraseña
export interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

// Constantes del módulo
export const AUTH_ROUTES = {
  LOGIN: "/auth",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
} as const;

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (pwd) => pwd.length >= 8 },
  { label: "One uppercase letter", test: (pwd) => /[A-Z]/.test(pwd) },
  { label: "One lowercase letter", test: (pwd) => /[a-z]/.test(pwd) },
  { label: "One number", test: (pwd) => /\d/.test(pwd) },
  {
    label: "One special character",
    test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  },
];

// Utilidades de validación
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return PASSWORD_REQUIREMENTS.every((req) => req.test(password));
};

// Hook personalizado para manejar autenticación (placeholder)
export const useAuth = () => {
  // TODO: Implementar hook de autenticación completo
  return {
    user: null,
    isAuthenticated: false,
    login: async (loginData: LoginFormData) => {
      console.log("Login:", loginData);
    },
    register: async (registerData: RegisterFormData) => {
      console.log("Register:", registerData);
    },
    logout: () => {
      console.log("Logout");
    },
    resetPassword: async (resetEmail: string) => {
      console.log("Reset password for:", resetEmail);
    },
  };
};
