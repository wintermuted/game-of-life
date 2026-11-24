import type { ReactElement, ReactNode } from 'react';

export interface ToastProps {
  open: boolean;
  message: ReactNode;
  action?: ReactNode;
  tone?: 'success' | 'danger' | 'warning' | 'info';
  onDismiss: () => void;
  dismissLabel: string;
}

export function Toast({
  open,
  message,
  action,
  tone = 'success',
  onDismiss,
  dismissLabel,
}: ToastProps): ReactElement {
  return (
    <div
      className={`wm-toast wm-toast-${tone}${open ? ' wm-toast-visible' : ''}`}
      role="status"
      aria-live="polite"
      aria-hidden={!open}
      inert={!open}
    >
      <span>{message}</span>
      {action}
      <button
        className="wm-toast-dismiss"
        type="button"
        aria-label={dismissLabel}
        onClick={onDismiss}
      >
        &#x2715;
      </button>
    </div>
  );
}
