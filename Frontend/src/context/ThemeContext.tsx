import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";

// Tipos para los temas y colores
interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  error: string;
  warning: string;
  success: string;
  info: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
  border: string;
  shadow: string;
}

interface ThemeVariant {
  id: string;
  name: string;
  colors: ColorPalette;
  isDark: boolean;
}

interface FontSettings {
  family: string;
  size: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
    "4xl": string;
  };
  weight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

interface AnimationSettings {
  enabled: boolean;
  duration: {
    fast: number;
    normal: number;
    slow: number;
  };
  easing: {
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    bounce: string;
  };
}

interface AccessibilitySettings {
  highContrast: boolean;
  focusVisible: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  fontSize: "small" | "medium" | "large" | "extra-large";
  reducedMotion: boolean;
}

// Estado del tema
interface ThemeState {
  currentTheme: ThemeVariant;
  availableThemes: ThemeVariant[];
  customTheme: Partial<ThemeVariant> | null;
  fonts: FontSettings;
  animations: AnimationSettings;
  accessibility: AccessibilitySettings;
  systemPreference: "light" | "dark" | "auto";
  isSystemDarkMode: boolean;
}

// Acciones del reducer
type ThemeAction =
  | { type: "SET_THEME"; payload: string }
  | { type: "SET_CUSTOM_THEME"; payload: Partial<ThemeVariant> }
  | { type: "TOGGLE_THEME" }
  | { type: "SET_SYSTEM_PREFERENCE"; payload: "light" | "dark" | "auto" }
  | { type: "UPDATE_SYSTEM_DARK_MODE"; payload: boolean }
  | { type: "UPDATE_FONT_SIZE"; payload: string }
  | { type: "UPDATE_FONT_FAMILY"; payload: string }
  | { type: "TOGGLE_ANIMATIONS"; payload: boolean }
  | { type: "UPDATE_ACCESSIBILITY"; payload: Partial<AccessibilitySettings> }
  | { type: "RESET_THEME" };

// Temas predefinidos
const lightTheme: ThemeVariant = {
  id: "light",
  name: "Claro",
  isDark: false,
  colors: {
    primary: "#10b981", // Verde esmeralda
    secondary: "#6366f1", // Índigo
    accent: "#f59e0b", // Ámbar
    background: "#ffffff",
    surface: "#f9fafb",
    error: "#ef4444",
    warning: "#f59e0b",
    success: "#10b981",
    info: "#3b82f6",
    text: {
      primary: "#111827",
      secondary: "#6b7280",
      disabled: "#9ca3af",
      inverse: "#ffffff",
    },
    border: "#e5e7eb",
    shadow: "rgba(0, 0, 0, 0.1)",
  },
};

const darkTheme: ThemeVariant = {
  id: "dark",
  name: "Oscuro",
  isDark: true,
  colors: {
    primary: "#34d399", // Verde más claro para dark mode
    secondary: "#818cf8", // Índigo más claro
    accent: "#fbbf24", // Ámbar más claro
    background: "#111827",
    surface: "#1f2937",
    error: "#f87171",
    warning: "#fbbf24",
    success: "#34d399",
    info: "#60a5fa",
    text: {
      primary: "#f9fafb",
      secondary: "#d1d5db",
      disabled: "#6b7280",
      inverse: "#111827",
    },
    border: "#374151",
    shadow: "rgba(0, 0, 0, 0.3)",
  },
};

const farmTheme: ThemeVariant = {
  id: "farm",
  name: "Campo",
  isDark: false,
  colors: {
    primary: "#84cc16", // Verde lima
    secondary: "#a3a3a3", // Gris neutral
    accent: "#ea580c", // Naranja
    background: "#fefce8", // Amarillo muy claro
    surface: "#f7fee7", // Verde muy claro
    error: "#dc2626",
    warning: "#d97706",
    success: "#65a30d",
    info: "#0284c7",
    text: {
      primary: "#365314",
      secondary: "#52525b",
      disabled: "#a3a3a3",
      inverse: "#ffffff",
    },
    border: "#d4d4aa",
    shadow: "rgba(132, 204, 22, 0.2)",
  },
};

// Configuración de fuentes
const defaultFonts: FontSettings = {
  family: "Inter, system-ui, -apple-system, sans-serif",
  size: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },
  weight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

// Configuración de animaciones
const defaultAnimations: AnimationSettings = {
  enabled: true,
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
};

// Configuración de accesibilidad
const defaultAccessibility: AccessibilitySettings = {
  highContrast: false,
  focusVisible: true,
  screenReaderOptimized: false,
  keyboardNavigation: true,
  fontSize: "medium",
  reducedMotion: false,
};

// Estado inicial
const initialState: ThemeState = {
  currentTheme: lightTheme,
  availableThemes: [lightTheme, darkTheme, farmTheme],
  customTheme: null,
  fonts: defaultFonts,
  animations: defaultAnimations,
  accessibility: defaultAccessibility,
  systemPreference: "auto",
  isSystemDarkMode: false,
};

// Reducer para manejar las acciones del tema
const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case "SET_THEME":
      const selectedTheme = state.availableThemes.find(
        (theme) => theme.id === action.payload
      );
      if (selectedTheme) {
        return { ...state, currentTheme: selectedTheme };
      }
      return state;

    case "SET_CUSTOM_THEME":
      const customTheme = {
        ...state.currentTheme,
        ...action.payload,
        id: "custom",
      };
      return {
        ...state,
        currentTheme: customTheme,
        customTheme: action.payload,
      };

    case "TOGGLE_THEME":
      const newTheme = state.currentTheme.isDark ? lightTheme : darkTheme;
      return { ...state, currentTheme: newTheme };

    case "SET_SYSTEM_PREFERENCE":
      let autoTheme = state.currentTheme;
      if (action.payload === "auto") {
        autoTheme = state.isSystemDarkMode ? darkTheme : lightTheme;
      } else if (action.payload === "light") {
        autoTheme = lightTheme;
      } else if (action.payload === "dark") {
        autoTheme = darkTheme;
      }
      return {
        ...state,
        systemPreference: action.payload,
        currentTheme: autoTheme,
      };

    case "UPDATE_SYSTEM_DARK_MODE":
      const shouldUpdateTheme = state.systemPreference === "auto";
      return {
        ...state,
        isSystemDarkMode: action.payload,
        currentTheme: shouldUpdateTheme
          ? action.payload
            ? darkTheme
            : lightTheme
          : state.currentTheme,
      };

    case "UPDATE_FONT_SIZE":
      return {
        ...state,
        fonts: {
          ...state.fonts,
          size: {
            ...state.fonts.size,
            base: action.payload,
          },
        },
      };

    case "UPDATE_FONT_FAMILY":
      return {
        ...state,
        fonts: {
          ...state.fonts,
          family: action.payload,
        },
      };

    case "TOGGLE_ANIMATIONS":
      return {
        ...state,
        animations: {
          ...state.animations,
          enabled: action.payload,
        },
      };

    case "UPDATE_ACCESSIBILITY":
      return {
        ...state,
        accessibility: {
          ...state.accessibility,
          ...action.payload,
        },
      };

    case "RESET_THEME":
      return {
        ...initialState,
        isSystemDarkMode: state.isSystemDarkMode,
      };

    default:
      return state;
  }
};

// Contexto del tema
interface ThemeContextType {
  state: ThemeState;
  dispatch: React.Dispatch<ThemeAction>;
  // Funciones de tema
  setTheme: (themeId: string) => void;
  toggleTheme: () => void;
  setCustomTheme: (theme: Partial<ThemeVariant>) => void;
  setSystemPreference: (preference: "light" | "dark" | "auto") => void;
  // Funciones de personalización
  updateFontSize: (size: string) => void;
  updateFontFamily: (family: string) => void;
  toggleAnimations: (enabled: boolean) => void;
  updateAccessibility: (settings: Partial<AccessibilitySettings>) => void;
  // Funciones utilitarias
  applyThemeToDocument: () => void;
  getThemeVariables: () => Record<string, string>;
  resetTheme: () => void;
  // Getters
  isDarkMode: () => boolean;
  isHighContrast: () => boolean;
  shouldReduceMotion: () => boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Proveedor del contexto de tema
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Función para establecer tema
  const setTheme = (themeId: string): void => {
    dispatch({ type: "SET_THEME", payload: themeId });
    localStorage.setItem("selectedTheme", themeId);
  };

  // Función para alternar tema
  const toggleTheme = (): void => {
    dispatch({ type: "TOGGLE_THEME" });
    const newThemeId = state.currentTheme.isDark ? "light" : "dark";
    localStorage.setItem("selectedTheme", newThemeId);
  };

  // Función para establecer tema personalizado
  const setCustomTheme = (theme: Partial<ThemeVariant>): void => {
    dispatch({ type: "SET_CUSTOM_THEME", payload: theme });
    localStorage.setItem("customTheme", JSON.stringify(theme));
  };

  // Función para establecer preferencia del sistema
  const setSystemPreference = (preference: "light" | "dark" | "auto"): void => {
    dispatch({ type: "SET_SYSTEM_PREFERENCE", payload: preference });
    localStorage.setItem("systemPreference", preference);
  };

  // Función para actualizar tamaño de fuente
  const updateFontSize = (size: string): void => {
    dispatch({ type: "UPDATE_FONT_SIZE", payload: size });
    localStorage.setItem("fontSize", size);
  };

  // Función para actualizar familia de fuente
  const updateFontFamily = (family: string): void => {
    dispatch({ type: "UPDATE_FONT_FAMILY", payload: family });
    localStorage.setItem("fontFamily", family);
  };

  // Función para alternar animaciones
  const toggleAnimations = (enabled: boolean): void => {
    dispatch({ type: "TOGGLE_ANIMATIONS", payload: enabled });
    localStorage.setItem("animationsEnabled", enabled.toString());
  };

  // Función para actualizar configuración de accesibilidad
  const updateAccessibility = (
    settings: Partial<AccessibilitySettings>
  ): void => {
    dispatch({ type: "UPDATE_ACCESSIBILITY", payload: settings });
    localStorage.setItem("accessibilitySettings", JSON.stringify(settings));
  };

  // Función para aplicar tema al documento
  const applyThemeToDocument = (): void => {
    const root = document.documentElement;
    const colors = state.currentTheme.colors;

    // Aplicar variables CSS personalizadas
    root.style.setProperty("--color-primary", colors.primary);
    root.style.setProperty("--color-secondary", colors.secondary);
    root.style.setProperty("--color-accent", colors.accent);
    root.style.setProperty("--color-background", colors.background);
    root.style.setProperty("--color-surface", colors.surface);
    root.style.setProperty("--color-error", colors.error);
    root.style.setProperty("--color-warning", colors.warning);
    root.style.setProperty("--color-success", colors.success);
    root.style.setProperty("--color-info", colors.info);
    root.style.setProperty("--color-text-primary", colors.text.primary);
    root.style.setProperty("--color-text-secondary", colors.text.secondary);
    root.style.setProperty("--color-text-disabled", colors.text.disabled);
    root.style.setProperty("--color-text-inverse", colors.text.inverse);
    root.style.setProperty("--color-border", colors.border);
    root.style.setProperty("--color-shadow", colors.shadow);

    // Aplicar fuentes
    root.style.setProperty("--font-family", state.fonts.family);
    root.style.setProperty("--font-size-base", state.fonts.size.base);

    // Aplicar configuraciones de animación
    root.style.setProperty(
      "--animation-duration",
      `${state.animations.duration.normal}ms`
    );
    root.style.setProperty(
      "--animation-easing",
      state.animations.easing.easeInOut
    );

    // Aplicar clase de tema al body
    document.body.className = document.body.className.replace(/theme-\w+/, "");
    document.body.classList.add(`theme-${state.currentTheme.id}`);

    // Aplicar configuraciones de accesibilidad
    if (state.accessibility.highContrast) {
      document.body.classList.add("high-contrast");
    } else {
      document.body.classList.remove("high-contrast");
    }

    if (state.accessibility.reducedMotion || !state.animations.enabled) {
      document.body.classList.add("reduce-motion");
    } else {
      document.body.classList.remove("reduce-motion");
    }
  };

  // Función para obtener variables del tema como objeto
  const getThemeVariables = (): Record<string, string> => {
    const colors = state.currentTheme.colors;
    return {
      "--color-primary": colors.primary,
      "--color-secondary": colors.secondary,
      "--color-accent": colors.accent,
      "--color-background": colors.background,
      "--color-surface": colors.surface,
      "--color-error": colors.error,
      "--color-warning": colors.warning,
      "--color-success": colors.success,
      "--color-info": colors.info,
      "--color-text-primary": colors.text.primary,
      "--color-text-secondary": colors.text.secondary,
      "--color-text-disabled": colors.text.disabled,
      "--color-text-inverse": colors.text.inverse,
      "--color-border": colors.border,
      "--color-shadow": colors.shadow,
      "--font-family": state.fonts.family,
      "--font-size-base": state.fonts.size.base,
      "--animation-duration": `${state.animations.duration.normal}ms`,
      "--animation-easing": state.animations.easing.easeInOut,
    };
  };

  // Función para resetear tema
  const resetTheme = (): void => {
    dispatch({ type: "RESET_THEME" });
    localStorage.removeItem("selectedTheme");
    localStorage.removeItem("customTheme");
    localStorage.removeItem("systemPreference");
    localStorage.removeItem("fontSize");
    localStorage.removeItem("fontFamily");
    localStorage.removeItem("animationsEnabled");
    localStorage.removeItem("accessibilitySettings");
  };

  // Getters utilitarios
  const isDarkMode = (): boolean => state.currentTheme.isDark;
  const isHighContrast = (): boolean => state.accessibility.highContrast;
  const shouldReduceMotion = (): boolean =>
    state.accessibility.reducedMotion || !state.animations.enabled;

  // Efecto para cargar configuraciones guardadas
  useEffect(() => {
    const savedTheme = localStorage.getItem("selectedTheme");
    const savedCustomTheme = localStorage.getItem("customTheme");
    const savedSystemPreference =
      (localStorage.getItem("systemPreference") as "light" | "dark" | "auto") ||
      "auto";
    const savedFontSize = localStorage.getItem("fontSize");
    const savedFontFamily = localStorage.getItem("fontFamily");
    const savedAnimationsEnabled = localStorage.getItem("animationsEnabled");
    const savedAccessibilitySettings = localStorage.getItem(
      "accessibilitySettings"
    );

    if (savedTheme) {
      dispatch({ type: "SET_THEME", payload: savedTheme });
    }

    if (savedCustomTheme) {
      try {
        const customTheme = JSON.parse(savedCustomTheme);
        dispatch({ type: "SET_CUSTOM_THEME", payload: customTheme });
      } catch (error) {
        console.error("Error al cargar tema personalizado:", error);
      }
    }

    dispatch({ type: "SET_SYSTEM_PREFERENCE", payload: savedSystemPreference });

    if (savedFontSize) {
      dispatch({ type: "UPDATE_FONT_SIZE", payload: savedFontSize });
    }

    if (savedFontFamily) {
      dispatch({ type: "UPDATE_FONT_FAMILY", payload: savedFontFamily });
    }

    if (savedAnimationsEnabled) {
      dispatch({
        type: "TOGGLE_ANIMATIONS",
        payload: savedAnimationsEnabled === "true",
      });
    }

    if (savedAccessibilitySettings) {
      try {
        const accessibilitySettings = JSON.parse(savedAccessibilitySettings);
        dispatch({
          type: "UPDATE_ACCESSIBILITY",
          payload: accessibilitySettings,
        });
      } catch (error) {
        console.error(
          "Error al cargar configuraciones de accesibilidad:",
          error
        );
      }
    }
  }, []);

  // Efecto para detectar preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      dispatch({ type: "UPDATE_SYSTEM_DARK_MODE", payload: e.matches });
    };

    // Establecer valor inicial
    dispatch({ type: "UPDATE_SYSTEM_DARK_MODE", payload: mediaQuery.matches });

    // Escuchar cambios
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // Efecto para detectar preferencia de movimiento reducido
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (e: MediaQueryListEvent) => {
      dispatch({
        type: "UPDATE_ACCESSIBILITY",
        payload: { reducedMotion: e.matches },
      });
    };

    // Establecer valor inicial
    dispatch({
      type: "UPDATE_ACCESSIBILITY",
      payload: { reducedMotion: mediaQuery.matches },
    });

    // Escuchar cambios
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // Efecto para aplicar tema cuando cambia
  useEffect(() => {
    applyThemeToDocument();
  }, [state.currentTheme, state.fonts, state.animations, state.accessibility]);

  const value: ThemeContextType = {
    state,
    dispatch,
    setTheme,
    toggleTheme,
    setCustomTheme,
    setSystemPreference,
    updateFontSize,
    updateFontFamily,
    toggleAnimations,
    updateAccessibility,
    applyThemeToDocument,
    getThemeVariables,
    resetTheme,
    isDarkMode,
    isHighContrast,
    shouldReduceMotion,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Hook personalizado para usar el contexto de tema
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Exportaciones de tipos
export type {
  ThemeVariant,
  ColorPalette,
  FontSettings,
  AnimationSettings,
  AccessibilitySettings,
  ThemeState,
  ThemeAction,
};

export default ThemeContext;
