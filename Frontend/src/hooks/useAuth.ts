import { useState, useCallback, useEffect } from "react";

// Tipos principales para autenticación
export type UserRole =
  | "ADMIN"
  | "VETERINARIAN"
  | "RANCH_OWNER"
  | "WORKER"
  | "VIEWER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  ranch?: {
    id: string;
    name: string;
    address: string;
  };
  preferences?: {
    language: string;
    timezone: string;
    notifications: boolean;
  };
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  token: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  role?: UserRole;
  ranchName?: string;
  ranchAddress?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// Permisos por rol
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: ["*"],
  VETERINARIAN: [
    "cattle:read",
    "cattle:update",
    "vaccinations:*",
    "illnesses:*",
    "reports:read",
  ],
  RANCH_OWNER: [
    "cattle:*",
    "vaccinations:*",
    "illnesses:*",
    "reports:*",
    "users:read",
  ],
  WORKER: [
    "cattle:read",
    "cattle:create",
    "cattle:update",
    "vaccinations:read",
    "vaccinations:create",
    "illnesses:read",
    "illnesses:create",
  ],
  VIEWER: [
    "cattle:read",
    "vaccinations:read",
    "illnesses:read",
    "reports:read",
  ],
};

// Claves para localStorage
const STORAGE_KEYS = {
  TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user_data",
  REMEMBER_ME: "remember_me",
} as const;

// Función helper para hacer peticiones HTTP
const apiRequest = async (url: string, options: RequestInit = {}) => {
  const baseURL = "/api/v1";
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${baseURL}${url}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error en la petición");
  }

  return data;
};

// Hook principal de autenticación
export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
    token: null,
  });

  // Función para guardar datos de autenticación
  const saveAuthData = useCallback(
    (
      user: User,
      token: string,
      refreshToken: string,
      rememberMe: boolean = false
    ) => {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(
        STORAGE_KEYS.REMEMBER_ME,
        JSON.stringify(rememberMe)
      );

      if (!rememberMe) {
        sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
        sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }

      setState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
        token,
      });
    },
    []
  );

  // Función para limpiar datos de autenticación
  const clearAuthData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);

    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER);

    setState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      token: null,
    });
  }, []);

  // Función de login
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const response = await apiRequest("/auth/login", {
          method: "POST",
          body: JSON.stringify(credentials),
        });

        if (response.success && response.data) {
          const { user, token, refreshToken } = response.data;
          saveAuthData(
            user,
            token,
            refreshToken,
            credentials.rememberMe || false
          );
          return true;
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: response.message || "Error al iniciar sesión",
          }));
          return false;
        }
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Error de conexión",
        }));
        return false;
      }
    },
    [saveAuthData]
  );

  // Función de registro
  const register = useCallback(
    async (data: RegisterData): Promise<boolean> => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        if (data.password !== data.confirmPassword) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Las contraseñas no coinciden",
          }));
          return false;
        }

        if (data.password.length < 8) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "La contraseña debe tener al menos 8 caracteres",
          }));
          return false;
        }

        const response = await apiRequest("/auth/register", {
          method: "POST",
          body: JSON.stringify(data),
        });

        if (response.success && response.data) {
          const { user, token, refreshToken } = response.data;
          saveAuthData(user, token, refreshToken, false);
          return true;
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: response.message || "Error al registrar usuario",
          }));
          return false;
        }
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Error de conexión",
        }));
        return false;
      }
    },
    [saveAuthData]
  );

  // Función de logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch (error) {
      console.warn("Error al hacer logout en el servidor:", error);
    } finally {
      clearAuthData();
    }
  }, [clearAuthData]);

  // Función para refrescar token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshTokenValue = localStorage.getItem(
        STORAGE_KEYS.REFRESH_TOKEN
      );

      if (!refreshTokenValue) {
        clearAuthData();
        return false;
      }

      const response = await apiRequest("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (response.success && response.data) {
        const { user, token, refreshToken: newRefreshToken } = response.data;
        const rememberMe = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) || "false"
        );
        saveAuthData(user, token, newRefreshToken, rememberMe);
        return true;
      } else {
        clearAuthData();
        return false;
      }
    } catch (error) {
      clearAuthData();
      return false;
    }
  }, [saveAuthData, clearAuthData]);

  // Función para cambiar contraseña
  const changePassword = useCallback(
    async (data: ChangePasswordData): Promise<boolean> => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        if (data.newPassword !== data.confirmPassword) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Las contraseñas nuevas no coinciden",
          }));
          return false;
        }

        const response = await apiRequest("/auth/change-password", {
          method: "POST",
          body: JSON.stringify(data),
        });

        if (response.success) {
          setState((prev) => ({ ...prev, loading: false, error: null }));
          return true;
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: response.message || "Error al cambiar contraseña",
          }));
          return false;
        }
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Error de conexión",
        }));
        return false;
      }
    },
    []
  );

  // Función para solicitar recuperación de contraseña
  const forgotPassword = useCallback(
    async (data: ForgotPasswordData): Promise<boolean> => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const response = await apiRequest("/auth/forgot-password", {
          method: "POST",
          body: JSON.stringify(data),
        });

        setState((prev) => ({ ...prev, loading: false }));
        return response.success || false;
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Error de conexión",
        }));
        return false;
      }
    },
    []
  );

  // Función para resetear contraseña
  const resetPassword = useCallback(
    async (data: ResetPasswordData): Promise<boolean> => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        if (data.password !== data.confirmPassword) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Las contraseñas no coinciden",
          }));
          return false;
        }

        const response = await apiRequest("/auth/reset-password", {
          method: "POST",
          body: JSON.stringify(data),
        });

        setState((prev) => ({ ...prev, loading: false }));
        return response.success || false;
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Error de conexión",
        }));
        return false;
      }
    },
    []
  );

  // Función para actualizar perfil
  const updateProfile = useCallback(
    async (profileData: Partial<User>): Promise<boolean> => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const response = await apiRequest("/auth/profile", {
          method: "PUT",
          body: JSON.stringify(profileData),
        });

        if (response.success && response.data) {
          const updatedUser = response.data;

          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
          sessionStorage.setItem(
            STORAGE_KEYS.USER,
            JSON.stringify(updatedUser)
          );

          setState((prev) => ({
            ...prev,
            user: updatedUser,
            loading: false,
            error: null,
          }));

          return true;
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: response.message || "Error al actualizar perfil",
          }));
          return false;
        }
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Error de conexión",
        }));
        return false;
      }
    },
    []
  );

  // Función para verificar permisos
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!state.user) return false;

      const userPermissions = ROLE_PERMISSIONS[state.user.role] || [];

      if (userPermissions.includes("*")) return true;
      if (userPermissions.includes(permission)) return true;

      const parts = permission.split(":");
      if (parts.length === 2) {
        const [resource] = parts;
        const wildcardPermission = `${resource}:*`;
        return userPermissions.includes(wildcardPermission);
      }

      return false;
    },
    [state.user]
  );

  // Función para verificar roles
  const hasRole = useCallback(
    (role: UserRole): boolean => {
      return state.user?.role === role;
    },
    [state.user]
  );

  // Función para verificar si es admin
  const isAdmin = useCallback((): boolean => {
    return hasRole("ADMIN");
  }, [hasRole]);

  // Función para obtener etiqueta del rol
  const getRoleLabel = useCallback((role: UserRole): string => {
    const labels = {
      ADMIN: "Administrador",
      VETERINARIAN: "Veterinario",
      RANCH_OWNER: "Propietario",
      WORKER: "Trabajador",
      VIEWER: "Visor",
    };
    return labels[role] || "Desconocido";
  }, []);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Inicializar autenticación al cargar
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token =
          localStorage.getItem(STORAGE_KEYS.TOKEN) ||
          sessionStorage.getItem(STORAGE_KEYS.TOKEN);
        const userData =
          localStorage.getItem(STORAGE_KEYS.USER) ||
          sessionStorage.getItem(STORAGE_KEYS.USER);

        if (token && userData) {
          try {
            JSON.parse(userData);

            const response = await apiRequest("/auth/me");

            if (response.success && response.data) {
              saveAuthData(response.data, token, "", false);
            } else {
              const refreshed = await refreshToken();
              if (!refreshed) {
                clearAuthData();
              }
            }
          } catch (parseError) {
            clearAuthData();
          }
        } else {
          setState((prev) => ({ ...prev, loading: false }));
        }
      } catch (error) {
        try {
          const refreshed = await refreshToken();
          if (!refreshed) {
            clearAuthData();
          }
        } catch (refreshError) {
          clearAuthData();
        }
      }
    };

    initAuth();
  }, []); // Solo ejecutar al montar

  return {
    // Estado
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    token: state.token,

    // Funciones de autenticación
    login,
    register,
    logout,
    refreshToken,

    // Gestión de contraseña
    changePassword,
    forgotPassword,
    resetPassword,

    // Gestión de perfil
    updateProfile,

    // Verificaciones de permisos
    hasPermission,
    hasRole,
    isAdmin,
    getRoleLabel,

    // Utilidades
    clearError,
  };
};

export default useAuth;
