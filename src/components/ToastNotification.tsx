import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface ToastNotificationProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const isSuccess = toast.type === 'success';
  const Icon = isSuccess ? CheckCircle : AlertTriangle;

  return (
    <div className={`
      flex items-center gap-3 p-4 rounded-lg shadow-lg border-l-4 bg-white
      ${isSuccess ? 'border-green-500' : 'border-red-500'}
      animate-in slide-in-from-right duration-300
    `}>
      <Icon className={`w-5 h-5 ${isSuccess ? 'text-green-500' : 'text-red-500'}`} />
      <span className="text-sm text-gray-800 flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ToastNotification;