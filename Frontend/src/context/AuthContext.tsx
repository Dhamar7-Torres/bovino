// Frontend/src/context/AuthContext.tsx
// ✅ VERSIÓN CORREGIDA - Errores de tipos e imports solucionados

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
// ❌ REMOVIDO: import { useNavigate } from "react-router-dom"; - No se usa
import { authService } from "../services/authService"; // ✅ Importar authService real
import {
  User,
  AuthCredentials, // ✅ CORREGIDO: usar AuthCredentials en lugar de LoginCredentials
  RegisterData,
} from "../types/auth";

// Estado de autenticación
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  sessionExpiry: Date | null;
  isLoading: boolean;
  error: string | null;
}

// Estado inicial
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  sessionExpiry: null,
  isLoading: false,
  error: null,
};

// Tipos de acciones
type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: User; token: string; refreshToken: string } }
  | { type: "AUTH_ERROR"; payload: string }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: Partial<User> }
  | { type: "CLEAR_ERROR" }
  | { type: "REFRESH_TOKEN_SUCCESS"; payload: { token: string; refreshToken: string } }
  | { type: "SESSION_EXPIRED" };

// Reducer de autenticación
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
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        isLoading: false,
        error: null,
      };

    case "AUTH_ERROR":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        sessionExpiry: null,
        isLoading: false,
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
  login: (credentials: AuthCredentials) => Promise<void>; // ✅ CORREGIDO: usar AuthCredentials
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
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

  // ✅ Función de login REAL usando authService
  const login = async (credentials: AuthCredentials): Promise<void> => { // ✅ CORREGIDO: usar AuthCredentials
    dispatch({ type: "AUTH_START" });

    try {
      console.log("🔐 Iniciando login a través de AuthContext...");
      
      // ✅ Usar authService REAL para hacer petición HTTP
      const response = await authService.login(credentials);
      
      console.log("✅ Login exitoso, datos recibidos:", response);

      // ✅ Despachar éxito con datos reales del backend
      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: response.user,
          token: response.tokens.accessToken,
          refreshToken: response.tokens.refreshToken,
        },
      });

      console.log("✅ Estado de autenticación actualizado, usuario logueado");

    } catch (error: any) {
      console.error("❌ Error en login:", error);
      
      dispatch({
        type: "AUTH_ERROR",
        payload: error.message || "Error al iniciar sesión",
      });
      
      throw error;
    }
  };

  // ✅ Función de registro REAL usando authService
  const register = async (userData: RegisterData): Promise<void> => {
    dispatch({ type: "AUTH_START" });

    try {
      console.log("📝 Iniciando registro a través de AuthContext...");
      
      // ✅ Usar authService REAL para hacer petición HTTP
      const response = await authService.register(userData);
      
      console.log("✅ Registro exitoso, datos recibidos:", response);

      // ✅ Despachar éxito con datos reales del backend
      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: response.user,
          token: response.tokens.accessToken,
          refreshToken: response.tokens.refreshToken,
        },
      });

      console.log("✅ Estado de autenticación actualizado después del registro");

    } catch (error: any) {
      console.error("❌ Error en registro:", error);
      
      dispatch({
        type: "AUTH_ERROR",
        payload: error.message || "Error al registrarse",
      });
      
      throw error;
    }
  };

  // ✅ Función de logout REAL
  const logout = async (): Promise<void> => {
    try {
      console.log("🚪 Cerrando sesión...");
      
      // ✅ Usar authService REAL para notificar al backend
      await authService.logout();
      
      // ✅ Limpiar estado local
      dispatch({ type: "LOGOUT" });
      
      console.log("✅ Sesión cerrada correctamente");
      
    } catch (error: any) {
      console.error("❌ Error cerrando sesión:", error);
      // Limpiar estado local aunque haya error
      dispatch({ type: "LOGOUT" });
    }
  };

  // ✅ Función para refrescar token
  const refreshToken = async (): Promise<void> => {
    try {
      const tokens = await authService.refreshTokens();
      
      dispatch({
        type: "REFRESH_TOKEN_SUCCESS",
        payload: {
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
    } catch (error: any) {
      console.error("❌ Error renovando token:", error);
      dispatch({ type: "SESSION_EXPIRED" });
    }
  };

  // ✅ Función para actualizar perfil
  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      
      dispatch({
        type: "UPDATE_USER",
        payload: updatedUser,
      });
    } catch (error: any) {
      console.error("❌ Error actualizando perfil:", error);
      throw error;
    }
  };

  // ✅ Función para verificar permisos
  const checkPermission = (resource: string, action: string): boolean => {
    return authService.hasPermission(resource, action);
  };

  // ✅ Función para verificar roles
  const hasRole = (role: User["role"]): boolean => {
    return authService.hasRole(role as any);
  };

  // Función para limpiar errores
  const clearError = (): void => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  // ✅ Efecto para inicializar desde localStorage (usando authService)
  useEffect(() => {
    const initializeAuth = () => {
      // Verificar si authService ya tiene una sesión activa
      if (authService.isAuthenticated && authService.currentUser) {
        console.log("✅ Sesión existente encontrada, restaurando estado...");
        
        dispatch({
          type: "AUTH_SUCCESS",
          payload: {
            user: authService.currentUser,
            token: authService.currentToken || "",
            refreshToken: "", // authService maneja esto internamente
          },
        });
      }
    };

    initializeAuth();
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