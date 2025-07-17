// Importación de componentes principales
import SettingsPage from './SettingsPage';
import ProfileSettings from './ProfileSettings';
import NotificationSettings from './NotificationSettings';

// Exportaciones nombradas para importación selectiva
export { SettingsPage };
export { ProfileSettings };
export { NotificationSettings };

// Exportación por defecto del componente principal
export default SettingsPage;

// Tipos y interfaces compartidas del módulo settings
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  profileImage?: string;
  role: string;
  department: string;
  joinDate: string;
  lastLogin: string;
}

export interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  enabled: boolean;
  settings: ChannelSettings;
}

export interface ChannelSettings {
  email?: EmailSettings;
  push?: PushSettings;
  sms?: SmsSettings;
  inApp?: InAppSettings;
}

export interface EmailSettings {
  enabled: boolean;
  frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
  digest: boolean;
  html: boolean;
}

export interface PushSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  badge: boolean;
}

export interface SmsSettings {
  enabled: boolean;
  emergencyOnly: boolean;
  phoneNumber: string;
}

export interface InAppSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  weeklyReports: boolean;
  emergencyAlerts: boolean;
}

// Constantes del módulo
export const SETTINGS_ROUTES = {
  MAIN: 'main',
  PROFILE: 'profile',
  NOTIFICATIONS: 'notifications',
  SECURITY: 'security',
  APPEARANCE: 'appearance',
  SYSTEM: 'system',
  PRIVACY: 'privacy'
} as const;

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

export const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  PUSH: 'push',
  SMS: 'sms',
  IN_APP: 'inApp'
} as const;

// Utilidades del módulo settings
export const settingsUtils = {
  /**
   * Valida si un email tiene formato correcto
   */
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Valida si un teléfono tiene formato correcto (México)
   */
  validatePhone: (phone: string): boolean => {
    const phoneRegex = /^\+52\s\d{3}\s\d{3}\s\d{4}$/;
    return phoneRegex.test(phone);
  },

  /**
   * Genera un avatar por defecto basado en las iniciales del usuario
   */
  generateAvatarInitials: (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  },

  /**
   * Verifica si una contraseña cumple con los requisitos de seguridad
   */
  validatePassword: (password: string): {
    isValid: boolean;
    requirements: {
      length: boolean;
      uppercase: boolean;
      lowercase: boolean;
      number: boolean;
      special: boolean;
    };
  } => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const isValid = Object.values(requirements).every(req => req);

    return { isValid, requirements };
  },

  /**
   * Formatea la fecha de último login
   */
  formatLastLogin: (lastLogin: string): string => {
    const date = new Date(lastLogin);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Hace menos de una hora';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }
  }
};


export const useSettingsState = () => {

  return {

    ...settingsUtils
  };
};