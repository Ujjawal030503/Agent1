'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const styles = {
    success: 'bg-green-50 text-green-800 border-green-300',
    error: 'bg-red-50 text-red-800 border-red-300',
    info: 'bg-blue-50 text-blue-800 border-blue-300',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 mb-2 rounded-lg border shadow-lg max-w-md w-full animate-in slide-in-from-right',
        styles[type]
      )}
    >
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="ml-4 inline-flex text-gray-400 hover:text-gray-500"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-2">
      {children}
    </div>
  );
};
