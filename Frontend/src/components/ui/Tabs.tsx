import React, { useState, useRef, useEffect } from "react";

// Utility function para combinar clases CSS
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};

// Tipos para las variantes de tabs
type TabsVariant = "default" | "pills" | "underline" | "card" | "segment";
type TabsSize = "sm" | "default" | "lg";
type TabsOrientation = "horizontal" | "vertical";

// Tipo para una pestaña individual
export interface TabItem {
  key: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  closable?: boolean;
  hidden?: boolean;
}

// Props del componente Tabs
export interface TabsProps {
  // Pestañas a mostrar
  items: TabItem[];
  // Pestaña activa por defecto
  defaultActiveKey?: string;
  // Pestaña activa (modo controlado)
  activeKey?: string;
  // Callback cuando cambia la pestaña activa
  onChange?: (key: string) => void;
  // Callback cuando se cierra una pestaña
  onTabClose?: (key: string) => void;
  // Variante visual
  variant?: TabsVariant;
  // Tamaño de las pestañas
  size?: TabsSize;
  // Orientación
  orientation?: TabsOrientation;
  // Centrar pestañas
  centered?: boolean;
  // Justificar pestañas (llenar ancho)
  justified?: boolean;
  // Permitir scroll en pestañas
  scrollable?: boolean;
  // Ancho completo
  fullWidth?: boolean;
  // Clase CSS personalizada
  className?: string;
  // Clase CSS para el contenedor de pestañas
  tabsClassName?: string;
  // Clase CSS para el contenido
  contentClassName?: string;
  // Renderizar todo el contenido (no lazy)
  forceRender?: boolean;
  // Mantener contenido montado al cambiar pestaña
  destroyInactiveTabPane?: boolean;
  // Posición de las pestañas
  tabPosition?: "top" | "bottom" | "left" | "right";
  // Elementos adicionales en la barra de pestañas
  tabBarExtraContent?: React.ReactNode;
  // Animación al cambiar contenido
  animated?: boolean;
}

// Props para TabPanel individual
export interface TabPanelProps {
  children: React.ReactNode;
  tab: string;
  key: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  closable?: boolean;
  forceRender?: boolean;
  className?: string;
}

// Hook para manejar scroll en pestañas
const useTabScroll = (
  tabsRef: React.RefObject<HTMLDivElement | null>,
  scrollable: boolean
) => {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollable || !tabsRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [scrollable]);

  const scrollLeft = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return {
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight,
    checkScroll,
  };
};

// Función para obtener clases según la variante
const getVariantClasses = (
  variant: TabsVariant,
  isActive: boolean,
  disabled: boolean
): string => {
  const baseClasses =
    "relative inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

  if (disabled) {
    return cn(baseClasses, "opacity-50 cursor-not-allowed");
  }

  const variants = {
    default: isActive
      ? "text-blue-600 border-b-2 border-blue-600 bg-transparent"
      : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300",

    pills: isActive
      ? "text-white bg-blue-600 rounded-md"
      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md",

    underline: isActive
      ? "text-blue-600 border-b-2 border-blue-600"
      : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent",

    card: isActive
      ? "text-blue-600 bg-white border border-gray-200 border-b-white rounded-t-md -mb-px"
      : "text-gray-500 hover:text-gray-700 bg-gray-50 border border-transparent hover:border-gray-200 rounded-t-md",

    segment: isActive
      ? "text-blue-600 bg-blue-50 border border-blue-200"
      : "text-gray-500 hover:text-gray-700 bg-white border border-gray-200 hover:bg-gray-50",
  };

  return cn(baseClasses, variants[variant]);
};

// Función para obtener clases según el tamaño
const getSizeClasses = (size: TabsSize, variant: TabsVariant): string => {
  const sizeMap = {
    sm: {
      default: "px-3 py-2 text-sm",
      pills: "px-3 py-1.5 text-sm",
      underline: "px-3 py-2 text-sm",
      card: "px-3 py-2 text-sm",
      segment: "px-3 py-1.5 text-sm",
    },
    default: {
      default: "px-4 py-3 text-sm",
      pills: "px-4 py-2 text-sm",
      underline: "px-4 py-3 text-sm",
      card: "px-4 py-3 text-sm",
      segment: "px-4 py-2 text-sm",
    },
    lg: {
      default: "px-6 py-4 text-base",
      pills: "px-6 py-3 text-base",
      underline: "px-6 py-4 text-base",
      card: "px-6 py-4 text-base",
      segment: "px-6 py-3 text-base",
    },
  };

  return sizeMap[size][variant];
};

// Componente principal Tabs
const Tabs: React.FC<TabsProps> = ({
  items,
  defaultActiveKey,
  activeKey: controlledActiveKey,
  onChange,
  onTabClose,
  variant = "default",
  size = "default",
  orientation = "horizontal",
  centered = false,
  justified = false,
  scrollable = false,
  fullWidth = false,
  className,
  tabsClassName,
  contentClassName,
  forceRender = false,
  destroyInactiveTabPane = true,
  tabPosition = "top",
  tabBarExtraContent,
  animated = true,
}) => {
  // Estado interno para pestaña activa
  const [internalActiveKey, setInternalActiveKey] = useState<string>(
    defaultActiveKey ||
      items.find((item) => !item.disabled && !item.hidden)?.key ||
      ""
  );

  // Determinar pestaña activa (controlado vs no controlado)
  const activeKey = controlledActiveKey ?? internalActiveKey;

  // Referencias
  const tabsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Hook para scroll
  const {
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight,
    checkScroll,
  } = useTabScroll(tabsRef, scrollable);

  // Filtrar pestañas visibles
  const visibleItems = items.filter((item) => !item.hidden);

  // Manejar cambio de pestaña
  const handleTabChange = (key: string) => {
    const item = items.find((item) => item.key === key);
    if (item?.disabled) return;

    if (controlledActiveKey === undefined) {
      setInternalActiveKey(key);
    }
    onChange?.(key);
  };

  // Manejar cierre de pestaña
  const handleTabClose = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    onTabClose?.(key);
  };

  // Clases del contenedor principal
  const containerClasses = cn(
    "w-full",
    orientation === "vertical" && "flex",
    fullWidth && "w-full",
    className
  );

  // Clases del contenedor de pestañas
  const tabsContainerClasses = cn(
    "relative",
    scrollable && "overflow-hidden",
    orientation === "vertical" && "flex-shrink-0 w-48 pr-4"
  );

  // Clases de la lista de pestañas
  const tabsListClasses = cn(
    "flex",
    orientation === "vertical" ? "flex-col space-y-1" : "space-x-1",
    centered && orientation === "horizontal" && "justify-center",
    justified && orientation === "horizontal" && "w-full",
    scrollable &&
      orientation === "horizontal" &&
      "overflow-x-auto scrollbar-hide",
    variant === "card" && "border-b border-gray-200",
    variant === "segment" && "p-1 bg-gray-100 rounded-lg",
    tabsClassName
  );

  // Clases del contenido
  const contentClasses = cn(
    "mt-4",
    orientation === "vertical" && "flex-1 mt-0 ml-4",
    tabPosition === "bottom" && "mt-0 mb-4 order-first",
    variant === "card" && "border border-gray-200 border-t-0 rounded-b-md p-4",
    animated && "transition-all duration-200",
    contentClassName
  );

  // Renderizar botón de scroll
  const ScrollButton = ({
    direction,
    onClick,
    disabled,
  }: {
    direction: "left" | "right";
    onClick: () => void;
    disabled: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "absolute top-0 bottom-0 z-10 w-8 bg-white shadow-md border border-gray-200",
        "flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed",
        direction === "left" ? "left-0 rounded-r" : "right-0 rounded-l"
      )}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={direction === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
        />
      </svg>
    </button>
  );

  return (
    <div className={containerClasses}>
      {/* Barra de pestañas */}
      <div className={tabsContainerClasses}>
        {/* Botones de scroll */}
        {scrollable && orientation === "horizontal" && (
          <>
            <ScrollButton
              direction="left"
              onClick={scrollLeft}
              disabled={!canScrollLeft}
            />
            <ScrollButton
              direction="right"
              onClick={scrollRight}
              disabled={!canScrollRight}
            />
          </>
        )}

        {/* Header con pestañas y contenido extra */}
        <div className="flex items-center justify-between">
          <div
            ref={tabsRef}
            className={tabsListClasses}
            onScroll={checkScroll}
            role="tablist"
            aria-orientation={orientation}
          >
            {visibleItems.map((item) => {
              const isActive = item.key === activeKey;
              const tabClasses = cn(
                getVariantClasses(variant, isActive, item.disabled || false),
                getSizeClasses(size, variant),
                justified && orientation === "horizontal" && "flex-1"
              );

              return (
                <button
                  key={item.key}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${item.key}`}
                  tabIndex={isActive ? 0 : -1}
                  className={tabClasses}
                  onClick={() => handleTabChange(item.key)}
                  disabled={item.disabled}
                >
                  {/* Icono */}
                  {item.icon && (
                    <span className="mr-2 flex items-center">{item.icon}</span>
                  )}

                  {/* Label */}
                  <span>{item.label}</span>

                  {/* Badge */}
                  {item.badge && <span className="ml-2">{item.badge}</span>}

                  {/* Botón cerrar */}
                  {item.closable && (
                    <button
                      className="ml-2 p-0.5 rounded hover:bg-black hover:bg-opacity-10 transition-colors"
                      onClick={(e) => handleTabClose(e, item.key)}
                      aria-label={`Cerrar pestaña ${item.label}`}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </button>
              );
            })}
          </div>

          {/* Contenido extra */}
          {tabBarExtraContent && (
            <div className="ml-4">{tabBarExtraContent}</div>
          )}
        </div>
      </div>

      {/* Contenido de las pestañas */}
      <div ref={contentRef} className={contentClasses}>
        {visibleItems.map((item) => {
          const isActive = item.key === activeKey;
          const shouldRender =
            forceRender || isActive || !destroyInactiveTabPane;

          if (!shouldRender) return null;

          return (
            <div
              key={item.key}
              id={`tabpanel-${item.key}`}
              role="tabpanel"
              aria-labelledby={`tab-${item.key}`}
              hidden={!isActive}
              className={cn(
                isActive ? "block" : "hidden",
                animated && "transition-opacity duration-200",
                isActive ? "opacity-100" : "opacity-0"
              )}
            >
              {item.content}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componente TabPanel (para uso alternativo)
const TabPanel: React.FC<TabPanelProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn("w-full", className)} {...props}>
      {children}
    </div>
  );
};

// Asignar displayName
Tabs.displayName = "Tabs";
TabPanel.displayName = "TabPanel";

export { Tabs, TabPanel };
