'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import './Toast.css';

type ToastType = 'success' | 'info' | 'warning' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  icon?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, options?: { type?: ToastType; icon?: string; duration?: number }) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [isExiting, setIsExiting] = useState(false);
  
  useEffect(() => {
    const duration = toast.duration || 3000;
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [toast.duration]);
  
  useEffect(() => {
    if (isExiting) {
      const timer = setTimeout(onRemove, 300);
      return () => clearTimeout(timer);
    }
  }, [isExiting, onRemove]);
  
  const defaultIcons: Record<ToastType, string> = {
    success: '✓',
    info: 'ℹ',
    warning: '⚠',
    error: '✕',
  };
  
  const icon = toast.icon || defaultIcons[toast.type];
  
  return (
    <div 
      className={`toast toast-${toast.type} ${isExiting ? 'toast-exit' : 'toast-enter'}`}
      role="alert"
      aria-live="polite"
    >
      <span className="toast-icon-wrapper">
        <span className="toast-icon">{icon}</span>
        <span className="toast-icon-ring" />
      </span>
      <span className="toast-message">{toast.message}</span>
      <button 
        className="toast-close"
        onClick={() => setIsExiting(true)}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const showToast = useCallback((
    message: string, 
    options?: { type?: ToastType; icon?: string; duration?: number }
  ) => {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = {
      id,
      message,
      type: options?.type || 'info',
      icon: options?.icon,
      duration: options?.duration,
    };
    
    setToasts(prev => [...prev, toast]);
  }, []);
  
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-label="Notifications">
        {toasts.map(toast => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            onRemove={() => removeToast(toast.id)} 
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
