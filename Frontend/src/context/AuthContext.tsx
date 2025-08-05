// Frontend/src/context/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// ✅ TIPOS DE DATOS
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  phone?: string;
  farm?: {
    id: string;
    name: string;
    location: string;
  };
  permissions: string[];
  lastLogin?: string;
  isActive: boolean;
}

interface AuthCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ✅ ACCIONES DEL REDUCER
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string; refreshToken: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// ✅ ESTADO INICIAL
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// ✅ REDUCER
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
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};

// ✅ CONTEXTO
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  state: AuthState;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>; // ✅ Función logout
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ PROVEEDOR DEL CONTEXTO
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ✅ BASE URL DE LA API
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // ✅ FUNCIÓN DE LOGIN
  const login = async (credentials: AuthCredentials): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      console.log('🔐 Enviando petición de login a:', `${API_BASE_URL}/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      console.log('📦 Respuesta del servidor:', data);

      if (!response.ok) {
        throw new Error(data.message || data.errors?.general || 'Error en el login');
      }

      if (!data.success || !data.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Guardar tokens en localStorage
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('refresh_token', data.data.refreshToken);

      // Actualizar estado
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: data.data.user,
          token: data.data.token,
          refreshToken: data.data.refreshToken,
        },
      });

      console.log('✅ Login exitoso');
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message || 'Error al iniciar sesión',
      });
      throw error;
    }
  };

  // ✅ FUNCIÓN DE REGISTRO
  const register = async (data: RegisterData): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      console.log('📝 Enviando petición de registro a:', `${API_BASE_URL}/auth/register`);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('📦 Respuesta del servidor:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || responseData.errors?.general || 'Error en el registro');
      }

      if (!responseData.success || !responseData.data) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Guardar tokens en localStorage
      localStorage.setItem('auth_token', responseData.data.token);
      localStorage.setItem('refresh_token', responseData.data.refreshToken);

      // Actualizar estado
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: responseData.data.user,
          token: responseData.data.token,
          refreshToken: responseData.data.refreshToken,
        },
      });

      console.log('✅ Registro exitoso');
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message || 'Error al registrarse',
      });
      throw error;
    }
  };

  // ✅ NUEVA FUNCIÓN DE LOGOUT
  const logout = async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Si hay token, hacer petición al backend para logout
      if (state.token) {
        console.log('🔐 Enviando petición de logout a:', `${API_BASE_URL}/auth/logout`);
        
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.token}`,
          },
        });

        const data = await response.json();
        console.log('📦 Respuesta del logout:', data);

        // No importa si el backend falla, igual limpiamos el frontend
        if (!response.ok) {
          console.warn('⚠️ Advertencia en logout del backend:', data.message);
        }
      }

      // Limpiar localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data'); // Si guardas datos adicionales del usuario

      // Limpiar estado
      dispatch({ type: 'LOGOUT' });

      console.log('✅ Logout exitoso - Usuario deslogueado');
    } catch (error: any) {
      console.error('❌ Error en logout:', error);
      
      // Aunque haya error en el backend, limpiamos el frontend
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      dispatch({ type: 'LOGOUT' });
      
      console.log('✅ Logout forzado - Estado limpiado localmente');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ✅ FUNCIÓN PARA LIMPIAR ERRORES
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // ✅ VERIFICAR AUTENTICACIÓN AL CARGAR
  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        return;
      }

      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Token inválido');
        }

        const data = await response.json();
        
        if (data.success && data.data?.user) {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: data.data.user,
              token: token,
              refreshToken: localStorage.getItem('refresh_token') || '',
            },
          });
        } else {
          throw new Error('Datos de usuario inválidos');
        }
      } catch (error) {
        console.error('Token inválido o expirado:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        dispatch({ type: 'LOGOUT' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuthentication();
  }, []);

  // ✅ VALOR DEL CONTEXTO
  const contextValue: AuthContextType = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    state,
    login,
    register,
    logout, // ✅ Incluir función logout
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ HOOK PERSONALIZADO
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;