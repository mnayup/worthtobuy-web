import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StatusModal, StatusModalType } from '~/components/StatusModal';
import { errorMessage } from '~/lib/api';

export interface NotificationOptions {
  type?: StatusModalType;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void | Promise<void>;
  onClose?: () => void;
  loading?: boolean;
}

interface NotificationState extends NotificationOptions {
  open: boolean;
}

export interface NotificationContextType {
  showAlert: (options: NotificationOptions) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (errorOrMessage: any, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showConfirm: (options: {
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    confirmText?: string;
    cancelText?: string;
    type?: StatusModalType;
  }) => void;
  closeAlert: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

type GlobalAlertSubscriber = (state: NotificationState | null) => void;
let globalSubscriber: GlobalAlertSubscriber | null = null;

/**
 * Global helper to trigger centered alert dialogs anywhere in the application,
 * even outside of React components (e.g. in API interceptors or utility functions).
 */
export const modalAlert = {
  show: (options: NotificationOptions) => {
    if (globalSubscriber) {
      globalSubscriber({ ...options, open: true });
    }
  },
  success: (message: string, title?: string) => {
    modalAlert.show({ type: 'success', title: title || 'Success', message });
  },
  error: (errorOrMessage: any, title?: string) => {
    const message = typeof errorOrMessage === 'string' ? errorMessage(errorOrMessage) : errorMessage(errorOrMessage);
    modalAlert.show({ type: 'error', title: title || 'Error Occurred', message });
  },
  warning: (message: string, title?: string) => {
    modalAlert.show({ type: 'warning', title: title || 'Warning', message });
  },
  confirm: (options: {
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    confirmText?: string;
    cancelText?: string;
    type?: StatusModalType;
  }) => {
    modalAlert.show({
      type: options.type || 'warning',
      title: options.title,
      message: options.message,
      confirmText: options.confirmText || 'Continue',
      cancelText: options.cancelText || 'Cancel',
      showCancel: true,
      onConfirm: options.onConfirm,
    });
  },
  close: () => {
    if (globalSubscriber) {
      globalSubscriber(null);
    }
  },
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [dialogState, setDialogState] = useState<NotificationState | null>(null);

  useEffect(() => {
    globalSubscriber = setDialogState;
    return () => {
      globalSubscriber = null;
    };
  }, []);

  const closeAlert = useCallback(() => {
    setDialogState((prev) => {
      if (prev?.onClose) {
        try {
          prev.onClose();
        } catch (e) {
          console.error(e);
        }
      }
      return null;
    });
  }, []);

  const showAlert = useCallback((options: NotificationOptions) => {
    setDialogState({ ...options, open: true });
  }, []);

  const showSuccess = useCallback(
    (message: string, title?: string) => {
      showAlert({ type: 'success', title: title || 'Success', message });
    },
    [showAlert]
  );

  const showError = useCallback(
    (errorOrMessage: any, title?: string) => {
      const message = errorMessage(errorOrMessage);
      showAlert({ type: 'error', title: title || 'Error Occurred', message });
    },
    [showAlert]
  );

  const showWarning = useCallback(
    (message: string, title?: string) => {
      showAlert({ type: 'warning', title: title || 'Warning', message });
    },
    [showAlert]
  );

  const showConfirm = useCallback(
    (options: {
      title: string;
      message: string;
      onConfirm: () => void | Promise<void>;
      confirmText?: string;
      cancelText?: string;
      type?: StatusModalType;
    }) => {
      showAlert({
        type: options.type || 'warning',
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || 'Continue',
        cancelText: options.cancelText || 'Cancel',
        showCancel: true,
        onConfirm: options.onConfirm,
      });
    },
    [showAlert]
  );

  return (
    <NotificationContext.Provider
      value={{
        showAlert,
        showSuccess,
        showError,
        showWarning,
        showConfirm,
        closeAlert,
      }}
    >
      {children}

      {dialogState && dialogState.open && (
        <StatusModal
          open={dialogState.open}
          type={dialogState.type}
          title={dialogState.title}
          message={dialogState.message}
          confirmText={dialogState.confirmText}
          cancelText={dialogState.cancelText}
          showCancel={dialogState.showCancel}
          loading={dialogState.loading}
          onConfirm={dialogState.onConfirm}
          onClose={closeAlert}
        />
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    // Graceful fallback to global modalAlert if called outside Provider
    return {
      showAlert: modalAlert.show,
      showSuccess: modalAlert.success,
      showError: modalAlert.error,
      showWarning: modalAlert.warning,
      showConfirm: modalAlert.confirm,
      closeAlert: modalAlert.close,
    };
  }
  return context;
}
