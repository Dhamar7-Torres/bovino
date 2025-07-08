import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";

// Tipos para el usuario y autenticación
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "veterinarian" | "farmer" | "viewer";
  avatar?: string;
  phone?: string;
  farm?: {
    id: string;
    name: string;
    location: string;
  };
  permissions: Permission[];
  lastLogin: Date;
  isActive: boolean;
}

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: "create" | "read" | "update" | "delete";
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: User["role"];
}

// Estado de autenticación
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
  sessionExpiry: Date | null;
}

// Tipos de acciones para el reducer de autenticación
type AuthAction =
  | { type: "AUTH_START" }
  | {
      type: "AUTH_SUCCESS";
      payload: { user: User; token: string; refreshToken: string };
    }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: Partial<User> }
  | { type: "CLEAR_ERROR" }
  | {
      type: "REFRESH_TOKEN_SUCCESS";
      payload: { token: string; refreshToken: string };
    }
  | { type: "SESSION_EXPIRED" };

// Estado inicial de autenticación
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: null,
  refreshToken: null,
  sessionExpiry: null,
};

// Reducer para manejar las acciones de autenticación
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "AUTH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        error: null,
      };

    case "AUTH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        sessionExpiry: null,
        error: action.payload,
      };

    case "LOGOUT":
      return {
        ...initialState,
      };

    case "UPDATE_USER":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };

    case "REFRESH_TOKEN_SUCCESS":
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

    case "SESSION_EXPIRED":
      return {
        ...initialState,
        error: "Sesión expirada. Por favor, inicia sesión nuevamente.",
      };

    default:
      return state;
  }
};

// Contexto de autenticación
interface AuthContextType {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  // Funciones de autenticación
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  checkPermission: (resource: string, action: string) => boolean;
  hasRole: (role: User["role"]) => boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor del contexto de autenticación
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Simular API calls - en producción estas serían llamadas reales al backend
  const apiCall = async (
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> => {
    // Simulación de delay de red
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Aquí iría la lógica real de API con fetch al backend Express
    console.log(`API Call to: ${endpoint}`, options);

    // Respuesta simulada
    return {
      success: true,
      data: {},
    };
  };

  // Función de login
  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: "AUTH_START" });

    try {
      // Simulación de autenticación exitosa
      const mockUser: User = {
        id: "1",
        email: credentials.email,
        firstName: "Juan",
        lastName: "Pérez",
        role: "farmer",
        phone: "+52 442 123 4567",
        farm: {
          id: "farm-1",
          name: "Rancho San Miguel",
          location: "Querétaro, México",
        },
        permissions: [
          {
            id: "1",
            name: "view_bovines",
            resource: "bovines",
            action: "read",
          },
          {
            id: "2",
            name: "create_bovines",
            resource: "bovines",
            action: "create",
          },
          {
            id: "3",
            name: "update_bovines",
            resource: "bovines",
            action: "update",
          },
        ],
        lastLogin: new Date(),
        isActive: true,
      };

      const mockTokens = {
        token: "mock-jwt-token",
        refreshToken: "mock-refresh-token",
      };

      // Guardar en localStorage si "recordarme" está seleccionado
      if (credentials.rememberMe) {
        localStorage.setItem("authToken", mockTokens.token);
        localStorage.setItem("refreshToken", mockTokens.refreshToken);
        localStorage.setItem("user", JSON.stringify(mockUser));
      }

      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: mockUser,
          token: mockTokens.token,
          refreshToken: mockTokens.refreshToken,
        },
      });
    } catch (error) {
      dispatch({
        type: "AUTH_FAILURE",
        payload:
          "Credenciales inválidas. Por favor, verifica tu email y contraseña.",
      });
    }
  };

  // Función de registro
  const register = async (userData: RegisterData): Promise<void> => {
    dispatch({ type: "AUTH_START" });

    try {
      if (userData.password !== userData.confirmPassword) {
        throw new Error("Las contraseñas no coinciden");
      }

      // Aquí iría la llamada real al backend
      await apiCall("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      // Después del registro exitoso, hacer login automático
      await login({
        email: userData.email,
        password: userData.password,
      });
    } catch (error) {
      dispatch({
        type: "AUTH_FAILURE",
        payload:
          error instanceof Error ? error.message : "Error en el registro",
      });
    }
  };

  // Función de logout
  const logout = (): void => {
    // Limpiar localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    dispatch({ type: "LOGOUT" });
  };

  // Función para refrescar token
  const refreshToken = async (): Promise<void> => {
    try {
      if (!state.refreshToken) {
        throw new Error("No refresh token available");
      }

      // Aquí iría la llamada real al backend
      const response = await apiCall("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: state.refreshToken }),
      });

      dispatch({
        type: "REFRESH_TOKEN_SUCCESS",
        payload: {
          token: response.token,
          refreshToken: response.refreshToken,
        },
      });
    } catch (error) {
      dispatch({ type: "SESSION_EXPIRED" });
    }
  };

  // Función para actualizar perfil
  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      // Aquí iría la llamada real al backend
      await apiCall("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify(userData),
      });

      dispatch({ type: "UPDATE_USER", payload: userData });
    } catch (error) {
      throw new Error("Error al actualizar el perfil");
    }
  };

  // Verificar permisos
  const checkPermission = (resource: string, action: string): boolean => {
    if (!state.user) return false;

    return state.user.permissions.some(
      (permission) =>
        permission.resource === resource && permission.action === action
    );
  };

  // Verificar rol
  const hasRole = (role: User["role"]): boolean => {
    return state.user?.role === role;
  };

  // Limpiar errores
  const clearError = (): void => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  // Efecto para verificar token al cargar la aplicación
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("user");
    const refreshTokenStored = localStorage.getItem("refreshToken");

    if (token && user && refreshTokenStored) {
      try {
        const parsedUser = JSON.parse(user);
        dispatch({
          type: "AUTH_SUCCESS",
          payload: {
            user: parsedUser,
            token,
            refreshToken: refreshTokenStored,
          },
        });
      } catch (error) {
        // Si hay error al parsear, limpiar localStorage
        logout();
      }
    }
  }, []);

  // Efecto para verificar expiración de sesión
  useEffect(() => {
    if (state.sessionExpiry && new Date() > state.sessionExpiry) {
      dispatch({ type: "SESSION_EXPIRED" });
    }
  }, [state.sessionExpiry]);

  const value: AuthContextType = {
    state,
    dispatch,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    checkPermission,
    hasRole,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
