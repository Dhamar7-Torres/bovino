// Frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthCredentials, RegisterData } from '../types/auth';
import { authService } from '../services/authService';

// Tipos para el estado de autenticación
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Tipos para las acciones del reducer
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Interface para el contexto
interface AuthContextType {
  // Estado
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Acciones
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

// Estado inicial
const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

// Reducer para manejar las acciones de autenticación
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    
    case 'AUTH_LOGOUT':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props para el AuthProvider
interface AuthProviderProps {
  children: React.ReactNode;
}

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Función de login usando el authService real
  const login = async (credentials: AuthCredentials): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      console.log('🔐 Iniciando login con backend...');
      const response = await authService.login(credentials);
      
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
      console.log('✅ Login exitoso con backend');
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      
      // Extraer mensaje de error más específico
      let errorMessage = 'Error en el login';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Función de registro usando el authService real
  const register = async (data: RegisterData): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      console.log('📝 Iniciando registro con backend...');
      const response = await authService.register(data);
      
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
      console.log('✅ Registro exitoso con backend');
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      
      // Extraer mensaje de error más específico
      let errorMessage = 'Error en el registro';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Función de logout usando el authService real
  const logout = async (): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      console.log('🚪 Cerrando sesión...');
      await authService.logout();
      
      dispatch({ type: 'AUTH_LOGOUT' });
      console.log('✅ Logout exitoso');
    } catch (error: any) {
      console.error('❌ Error en logout:', error);
      // Aun si hay error, limpiar estado local
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Función para refrescar token usando el authService real
  const refreshToken = async (): Promise<void> => {
    try {
      console.log('🔄 Refrescando token...');
      await authService.refreshTokens();
      console.log('✅ Token refrescado exitosamente');
    } catch (error: any) {
      console.error('❌ Error refrescando token:', error);
      // Si no se puede refrescar, hacer logout
      dispatch({ type: 'AUTH_LOGOUT' });
      throw error;
    }
  };

  // Función para actualizar perfil usando el authService real
  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    try {
      console.log('👤 Actualizando perfil...');
      const updatedUser = await authService.updateProfile(updates);
      
      dispatch({ type: 'AUTH_SUCCESS', payload: updatedUser });
      console.log('✅ Perfil actualizado exitosamente');
    } catch (error: any) {
      console.error('❌ Error actualizando perfil:', error);
      throw error;
    }
  };

  // Función para cambiar contraseña usando el authService real
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      console.log('🔑 Cambiando contraseña...');
      await authService.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword: newPassword,
      });
      console.log('✅ Contraseña cambiada exitosamente');
    } catch (error: any) {
      console.error('❌ Error cambiando contraseña:', error);
      throw error;
    }
  };

  // Función para limpiar errores
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Inicializar autenticación desde el authService al cargar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Verificar si hay una sesión activa
        if (authService.isAuthenticated && authService.currentUser) {
          console.log('🔄 Restaurando sesión existente...');
          dispatch({ type: 'AUTH_SUCCESS', payload: authService.currentUser });
          console.log('✅ Sesión restaurada desde authService');
        } else {
          // Intentar validar token si existe
          const isValid = await authService.validateToken();
          if (isValid && authService.currentUser) {
            dispatch({ type: 'AUTH_SUCCESS', payload: authService.currentUser });
            console.log('✅ Token validado, sesión restaurada');
          }
        }
      } catch (error) {
        console.warn('⚠️ No se pudo restaurar la sesión:', error);
        // No mostrar error al usuario, simplemente mantener estado no autenticado
      }
    };

    initializeAuth();
  }, []);

  // Escuchar cambios en el authService
  useEffect(() => {
    const checkAuthStatus = () => {
      if (!authService.isAuthenticated && state.isAuthenticated) {
        // El authService perdió la autenticación, actualizar contexto
        dispatch({ type: 'AUTH_LOGOUT' });
      } else if (authService.isAuthenticated && authService.currentUser && !state.isAuthenticated) {
        // El authService ganó autenticación, actualizar contexto
        dispatch({ type: 'AUTH_SUCCESS', payload: authService.currentUser });
      }
    };

    // Verificar estado cada 30 segundos
    const interval = setInterval(checkAuthStatus, 30000);

    return () => clearInterval(interval);
  }, [state.isAuthenticated]);

  // Valor del contexto
  const contextValue: AuthContextType = {
    // Estado
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,
    
    // Acciones
    login,
    register,
    logout,
    clearError,
    refreshToken,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Export por defecto
export default AuthContext;