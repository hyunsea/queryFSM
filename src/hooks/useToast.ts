import { useState, useCallback } from 'react';
import { Toast } from '../components/ToastNotification';

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type, message };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message: string) => {
    addToast('success', message);
  }, [addToast]);

  const showError = useCallback((message: string) => {
    addToast('error', message);
  }, [addToast]);

  return {
    toasts,
    showSuccess,
    showError,
    removeToast
  };
};