import { useState, useCallback, useEffect, useRef } from "react";

// Tipos para el estado del modal
export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: any;
  size?: "small" | "medium" | "large" | "fullscreen";
  type?: "info" | "warning" | "error" | "success" | "confirm" | "custom";
  closable?: boolean;
  backdrop?: boolean;
  keyboard?: boolean;
  persistent?: boolean;
  animation?: boolean;
  zIndex?: number;
}

// Acciones del modal
export interface ModalActions {
  openModal: (config?: Partial<ModalState>) => void;
  closeModal: () => void;
  toggleModal: () => void;
  updateModal: (updates: Partial<ModalState>) => void;
}

// Configuración para modales específicos
export interface ModalConfig {
  title?: string;
  content?: any;
  size?: ModalState["size"];
  type?: ModalState["type"];
  closable?: boolean;
  backdrop?: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

// Estado inicial del modal
const initialState: ModalState = {
  isOpen: false,
  title: "",
  content: null,
  size: "medium",
  type: "custom",
  closable: true,
  backdrop: true,
  keyboard: true,
  persistent: false,
  animation: true,
  zIndex: 1000,
};

// Hook principal para manejo de modales
export const useModal = (defaultConfig?: Partial<ModalState>) => {
  const [state, setState] = useState<ModalState>({
    ...initialState,
    ...defaultConfig,
  });

  // Referencias para callbacks
  const onConfirmRef = useRef<(() => void | Promise<void>) | null>(null);
  const onCancelRef = useRef<(() => void) | null>(null);
  const onCloseRef = useRef<(() => void) | null>(null);

  // Función para abrir el modal
  const openModal = useCallback((config?: Partial<ModalState>) => {
    setState((prev) => ({
      ...prev,
      ...config,
      isOpen: true,
    }));
  }, []);

  // Función para cerrar el modal
  const closeModal = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
    // Ejecutar callback de cierre si existe
    if (onCloseRef.current) {
      onCloseRef.current();
    }
  }, []);

  // Función para alternar el modal
  const toggleModal = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  // Función para actualizar el modal
  const updateModal = useCallback((updates: Partial<ModalState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Manejo del teclado (ESC para cerrar)
  useEffect(() => {
    if (!state.isOpen || !state.keyboard) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && state.closable && !state.persistent) {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    state.isOpen,
    state.keyboard,
    state.closable,
    state.persistent,
    closeModal,
  ]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (state.isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [state.isOpen]);

  return {
    // Estado
    ...state,

    // Acciones
    openModal,
    closeModal,
    toggleModal,
    updateModal,

    // Referencias para callbacks
    setOnConfirm: (callback: () => void | Promise<void>) => {
      onConfirmRef.current = callback;
    },
    setOnCancel: (callback: () => void) => {
      onCancelRef.current = callback;
    },
    setOnClose: (callback: () => void) => {
      onCloseRef.current = callback;
    },

    // Ejecutar callbacks
    handleConfirm: async () => {
      if (onConfirmRef.current) {
        await onConfirmRef.current();
      }
      closeModal();
    },
    handleCancel: () => {
      if (onCancelRef.current) {
        onCancelRef.current();
      }
      closeModal();
    },
  };
};

// Hook para modal de confirmación
export const useConfirmModal = () => {
  const modal = useModal({
    type: "confirm",
    size: "small",
    closable: true,
  });

  const confirm = useCallback(
    (config: {
      title?: string;
      message: string;
      confirmText?: string;
      cancelText?: string;
      type?: "info" | "warning" | "error" | "success";
    }): Promise<boolean> => {
      return new Promise((resolve) => {
        modal.openModal({
          title: config.title || "Confirmar",
          content: config.message,
          type: config.type || "confirm",
        });

        modal.setOnConfirm(() => {
          resolve(true);
        });

        modal.setOnCancel(() => {
          resolve(false);
        });

        modal.setOnClose(() => {
          resolve(false);
        });
      });
    },
    [modal]
  );

  return {
    ...modal,
    confirm,
  };
};

// Hook para modal de creación/edición de bovinos
export const useBovineModal = () => {
  const modal = useModal({
    size: "large",
    title: "Gestión de Bovino",
  });

  const openCreateModal = useCallback(() => {
    modal.openModal({
      title: "Registrar Nuevo Bovino",
      content: { mode: "create", bovine: null },
    });
  }, [modal]);

  const openEditModal = useCallback(
    (bovine: any) => {
      modal.openModal({
        title: `Editar Bovino - ${bovine.earTag}`,
        content: { mode: "edit", bovine },
      });
    },
    [modal]
  );

  const openViewModal = useCallback(
    (bovine: any) => {
      modal.openModal({
        title: `Detalles - ${bovine.earTag}`,
        content: { mode: "view", bovine },
        size: "large",
      });
    },
    [modal]
  );

  return {
    ...modal,
    openCreateModal,
    openEditModal,
    openViewModal,
  };
};

// Hook para modal de vacunaciones
export const useVaccinationModal = () => {
  const modal = useModal({
    size: "medium",
    title: "Gestión de Vacunación",
  });

  const openScheduleModal = useCallback(
    (bovine: any) => {
      modal.openModal({
        title: `Programar Vacunación - ${bovine.earTag}`,
        content: { mode: "schedule", bovine },
      });
    },
    [modal]
  );

  const openApplyModal = useCallback(
    (bovine: any, vaccination: any) => {
      modal.openModal({
        title: `Aplicar Vacuna - ${bovine.earTag}`,
        content: { mode: "apply", bovine, vaccination },
      });
    },
    [modal]
  );

  const openHistoryModal = useCallback(
    (bovine: any) => {
      modal.openModal({
        title: `Historial de Vacunación - ${bovine.earTag}`,
        content: { mode: "history", bovine },
        size: "large",
      });
    },
    [modal]
  );

  return {
    ...modal,
    openScheduleModal,
    openApplyModal,
    openHistoryModal,
  };
};

// Hook para modal de enfermedades
export const useIllnessModal = () => {
  const modal = useModal({
    size: "medium",
    title: "Gestión de Enfermedades",
  });

  const openDiagnosisModal = useCallback(
    (bovine: any) => {
      modal.openModal({
        title: `Nuevo Diagnóstico - ${bovine.earTag}`,
        content: { mode: "diagnosis", bovine },
      });
    },
    [modal]
  );

  const openTreatmentModal = useCallback(
    (bovine: any, illness: any) => {
      modal.openModal({
        title: `Registrar Tratamiento - ${bovine.earTag}`,
        content: { mode: "treatment", bovine, illness },
      });
    },
    [modal]
  );

  const openRecoveryModal = useCallback(
    (bovine: any, illness: any) => {
      modal.openModal({
        title: `Marcar Recuperación - ${bovine.earTag}`,
        content: { mode: "recovery", bovine, illness },
      });
    },
    [modal]
  );

  return {
    ...modal,
    openDiagnosisModal,
    openTreatmentModal,
    openRecoveryModal,
  };
};

// Hook para modal de ubicación/mapa
export const useLocationModal = () => {
  const modal = useModal({
    size: "large",
    title: "Seleccionar Ubicación",
  });

  const openLocationPicker = useCallback(
    (
      currentLocation?: { latitude: number; longitude: number },
      onLocationSelect?: (location: {
        latitude: number;
        longitude: number;
      }) => void
    ) => {
      modal.openModal({
        title: "Seleccionar Ubicación en el Mapa",
        content: {
          mode: "picker",
          currentLocation,
          onLocationSelect,
        },
      });
    },
    [modal]
  );

  const openLocationViewer = useCallback(
    (bovines: any[]) => {
      modal.openModal({
        title: "Ubicaciones de Ganado",
        content: { mode: "viewer", bovines },
        size: "fullscreen",
      });
    },
    [modal]
  );

  return {
    ...modal,
    openLocationPicker,
    openLocationViewer,
  };
};

// Hook para modal de reportes
export const useReportsModal = () => {
  const modal = useModal({
    size: "large",
    title: "Generar Reporte",
  });

  const openReportModal = useCallback(
    (reportType: string) => {
      const reportTitles = {
        health: "Reporte de Salud",
        vaccination: "Reporte de Vacunación",
        breeding: "Reporte Reproductivo",
        financial: "Reporte Financiero",
        inventory: "Inventario de Ganado",
      };

      modal.openModal({
        title:
          reportTitles[reportType as keyof typeof reportTitles] ||
          "Generar Reporte",
        content: { reportType },
      });
    },
    [modal]
  );

  return {
    ...modal,
    openReportModal,
  };
};

// Hook para modal de configuraciones
export const useSettingsModal = () => {
  const modal = useModal({
    size: "medium",
    title: "Configuraciones",
  });

  const openUserSettings = useCallback(() => {
    modal.openModal({
      title: "Configuración de Usuario",
      content: { section: "user" },
    });
  }, [modal]);

  const openNotificationSettings = useCallback(() => {
    modal.openModal({
      title: "Configuración de Notificaciones",
      content: { section: "notifications" },
    });
  }, [modal]);

  const openSystemSettings = useCallback(() => {
    modal.openModal({
      title: "Configuración del Sistema",
      content: { section: "system" },
    });
  }, [modal]);

  return {
    ...modal,
    openUserSettings,
    openNotificationSettings,
    openSystemSettings,
  };
};

// Hook para gestión múltiple de modales
export const useModalStack = () => {
  const [modals, setModals] = useState<
    Array<{ id: string; config: ModalState }>
  >([]);

  const pushModal = useCallback((id: string, config: Partial<ModalState>) => {
    setModals((prev) => [
      ...prev,
      {
        id,
        config: {
          ...initialState,
          ...config,
          isOpen: true,
          zIndex: 1000 + prev.length,
        },
      },
    ]);
  }, []);

  const popModal = useCallback((id?: string) => {
    setModals((prev) => {
      if (id) {
        return prev.filter((modal) => modal.id !== id);
      }
      return prev.slice(0, -1);
    });
  }, []);

  const clearModals = useCallback(() => {
    setModals([]);
  }, []);

  const updateModal = useCallback(
    (id: string, updates: Partial<ModalState>) => {
      setModals((prev) =>
        prev.map((modal) =>
          modal.id === id
            ? { ...modal, config: { ...modal.config, ...updates } }
            : modal
        )
      );
    },
    []
  );

  return {
    modals,
    pushModal,
    popModal,
    clearModals,
    updateModal,
    hasModals: modals.length > 0,
    topModal: modals[modals.length - 1] || null,
  };
};

// Hook para modal de ayuda contextual
export const useHelpModal = () => {
  const modal = useModal({
    size: "medium",
    title: "Centro de Ayuda",
  });

  const showHelp = useCallback(
    (topic: string) => {
      const helpContent = {
        bovines: {
          title: "Gestión de Ganado",
          content:
            "Aprende a registrar, editar y gestionar tu ganado bovino...",
        },
        vaccinations: {
          title: "Control de Vacunación",
          content: "Programa y registra las vacunaciones de tu ganado...",
        },
        maps: {
          title: "Ubicaciones y Mapas",
          content: "Utiliza el sistema de mapas para localizar tu ganado...",
        },
        reports: {
          title: "Reportes y Análisis",
          content: "Genera reportes detallados de tu operación ganadera...",
        },
      };

      const help = helpContent[topic as keyof typeof helpContent];

      modal.openModal({
        title: help?.title || "Ayuda",
        content: { topic, help: help?.content || "Información no disponible" },
      });
    },
    [modal]
  );

  return {
    ...modal,
    showHelp,
  };
};

// Utilidades para modales
export const modalUtils = {
  // Generar ID único para modales
  generateId: (): string => {
    return `modal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Calcular z-index dinámico
  calculateZIndex: (
    baseZIndex: number = 1000,
    stackPosition: number = 0
  ): number => {
    return baseZIndex + stackPosition * 10;
  },

  // Verificar si el dispositivo es móvil para ajustar tamaños
  isMobileDevice: (): boolean => {
    return window.innerWidth <= 768;
  },

  // Ajustar tamaño de modal según dispositivo
  adjustModalSize: (size: ModalState["size"]): ModalState["size"] => {
    if (modalUtils.isMobileDevice()) {
      return size === "fullscreen" ? "fullscreen" : "medium";
    }
    return size;
  },

  // Prevenir scroll del fondo cuando hay modales abiertos
  preventBodyScroll: (prevent: boolean): void => {
    if (prevent) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  },
};

export default useModal;
