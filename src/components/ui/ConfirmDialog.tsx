'use client';

import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  variant?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  variant = 'danger',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'bg-red-100 text-red-600',
      button: 'danger' as const,
    },
    warning: {
      icon: 'bg-yellow-100 text-yellow-600',
      button: 'primary' as const,
    },
    info: {
      icon: 'bg-blue-100 text-blue-600',
      button: 'primary' as const,
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={loading ? undefined : onClose}
        />
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${styles.icon}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-gray-600">{message}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 rounded-b-xl">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              {cancelText}
            </Button>
            <Button variant={styles.button} onClick={onConfirm} disabled={loading}>
              {loading ? 'Processing...' : confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
