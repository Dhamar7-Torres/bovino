import React, { createContext, useContext, useReducer, ReactNode } from "react";

// Tipos para el estado global de la aplicación
interface AppState {
  isLoading: boolean;
  notifications: Notification[];
  currentView: "dashboard" | "map" | "calendar" | "bovines" | "reports";
  sidebarOpen: boolean;
  language: "es" | "en";
  theme: "light" | "dark";
}

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Tipos de acciones para el reducer
type AppAction =
  | { type: "SET_LOADING"; payload: boolean }
  | {
      type: "ADD_NOTIFICATION";
      payload: Omit<Notification, "id" | "timestamp" | "read">;
    }
  | { type: "REMOVE_NOTIFICATION"; payload: string }
  | { type: "MARK_NOTIFICATION_READ"; payload: string }
  | { type: "SET_CURRENT_VIEW"; payload: AppState["currentView"] }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_LANGUAGE"; payload: AppState["language"] }
  | { type: "SET_THEME"; payload: AppState["theme"] }
  | { type: "CLEAR_ALL_NOTIFICATIONS" };

// Estado inicial de la aplicación
const initialState: AppState = {
  isLoading: false,
  notifications: [],
  currentView: "dashboard",
  sidebarOpen: true,
  language: "es",
  theme: "light",
};

// Reducer para manejar las acciones del estado global
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "ADD_NOTIFICATION":
      const newNotification: Notification = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        read: false,
      };
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
      };

    case "REMOVE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload
        ),
      };

    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };

    case "SET_CURRENT_VIEW":
      return { ...state, currentView: action.payload };

    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case "SET_LANGUAGE":
      return { ...state, language: action.payload };

    case "SET_THEME":
      return { ...state, theme: action.payload };

    case "CLEAR_ALL_NOTIFICATIONS":
      return { ...state, notifications: [] };

    default:
      return state;
  }
};

// Contexto de la aplicación
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Funciones auxiliares para acciones comunes
  setLoading: (loading: boolean) => void;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  setCurrentView: (view: AppState["currentView"]) => void;
  toggleSidebar: () => void;
  setLanguage: (language: AppState["language"]) => void;
  setTheme: (theme: AppState["theme"]) => void;
  clearAllNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Proveedor del contexto de aplicación
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Funciones auxiliares para simplificar el uso del contexto
  const setLoading = (loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  };

  const addNotification = (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => {
    dispatch({ type: "ADD_NOTIFICATION", payload: notification });
  };

  const removeNotification = (id: string) => {
    dispatch({ type: "REMOVE_NOTIFICATION", payload: id });
  };

  const markNotificationRead = (id: string) => {
    dispatch({ type: "MARK_NOTIFICATION_READ", payload: id });
  };

  const setCurrentView = (view: AppState["currentView"]) => {
    dispatch({ type: "SET_CURRENT_VIEW", payload: view });
  };

  const toggleSidebar = () => {
    dispatch({ type: "TOGGLE_SIDEBAR" });
  };

  const setLanguage = (language: AppState["language"]) => {
    dispatch({ type: "SET_LANGUAGE", payload: language });
  };

  const setTheme = (theme: AppState["theme"]) => {
    dispatch({ type: "SET_THEME", payload: theme });
  };

  const clearAllNotifications = () => {
    dispatch({ type: "CLEAR_ALL_NOTIFICATIONS" });
  };

  const value: AppContextType = {
    state,
    dispatch,
    setLoading,
    addNotification,
    removeNotification,
    markNotificationRead,
    setCurrentView,
    toggleSidebar,
    setLanguage,
    setTheme,
    clearAllNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook personalizado para usar el contexto de aplicación
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export default AppContext;
