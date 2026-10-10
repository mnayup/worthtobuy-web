import { StatusModal, StatusModalType } from './StatusModal';

export interface ToastProps {
  message: string;
  type?: StatusModalType;
  title?: string;
  onClose: () => void;
  confirmText?: string;
}

export function Toast({
  message,
  type = 'success',
  title,
  onClose,
  confirmText,
}: ToastProps) {
  return (
    <StatusModal
      open={true}
      type={type}
      title={title}
      message={message}
      onClose={onClose}
      confirmText={confirmText}
    />
  );
}

