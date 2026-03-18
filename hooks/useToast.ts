'use client';

import { useState, useCallback } from 'react';
import { Toast } from '@/components/Toast';

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36);
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message: string, action?: Toast['action']) => {
    return addToast({ type: 'success', message, action });
  }, [addToast]);

  const error = useCallback((message: string, action?: Toast['action']) => {
    return addToast({ type: 'error', message, action, duration: 5000 });
  }, [addToast]);

  const warning = useCallback((message: string, action?: Toast['action']) => {
    return addToast({ type: 'warning', message, action });
  }, [addToast]);

  const info = useCallback((message: string, action?: Toast['action']) => {
    return addToast({ type: 'info', message, action });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
