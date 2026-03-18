'use client';

import { useEffect } from 'react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const duration = toast.duration || (toast.type === 'error' ? 5000 : 3000);
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-whatsapp-50 border-whatsapp-500 text-whatsapp-700';
      case 'error':
        return 'bg-red-50 border-red-500 text-red-700';
      case 'warning':
        return 'bg-gold-50 border-gold-500 text-gold-700';
      case 'info':
        return 'bg-blue-50 border-blue-500 text-blue-700';
      default:
        return 'bg-slate-50 border-slate-500 text-slate-700';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '•';
    }
  };

  return (
    <div
      className={`
        ${getStyles()}
        border-l-4 rounded-lg shadow-lg p-4 pr-12
        animate-in slide-in-from-right-5 fade-in duration-300
        relative min-w-[300px] max-w-sm
      `}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{getIcon()}</span>
        <div className="flex-1">
          <p className="text-sm font-medium">{toast.message}</p>
          {toast.action && (
            <button
              onClick={() => {
                toast.action!.onClick();
                onDismiss(toast.id);
              }}
              className="mt-2 text-sm font-semibold underline hover:no-underline"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="absolute top-2 right-2 text-current opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
