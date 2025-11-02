'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { colors, shadows, borderRadius, spacing, transitions } from '@/lib/design-tokens';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export default function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: colors.success[50],
      borderColor: colors.success[200],
      iconColor: colors.success[600],
      titleColor: colors.success[900],
    },
    error: {
      icon: XCircle,
      bgColor: colors.error[50],
      borderColor: colors.error[200],
      iconColor: colors.error[600],
      titleColor: colors.error[900],
    },
    warning: {
      icon: AlertCircle,
      bgColor: colors.warning[50],
      borderColor: colors.warning[200],
      iconColor: colors.warning[600],
      titleColor: colors.warning[900],
    },
    info: {
      icon: Info,
      bgColor: colors.primary[50],
      borderColor: colors.primary[200],
      iconColor: colors.primary[600],
      titleColor: colors.primary[900],
    },
  };

  const { icon: Icon, bgColor, borderColor, iconColor, titleColor } = config[type];

  return (
    <div
      className="pointer-events-auto animate-slideUp mb-4"
      style={{
        background: bgColor,
        border: `2px solid ${borderColor}`,
        borderRadius: borderRadius.xl,
        boxShadow: shadows.lg,
        padding: spacing[4],
        minWidth: '320px',
        maxWidth: '420px',
      }}
    >
      <div className="flex items-start gap-3">
        <Icon className="flex-shrink-0 mt-0.5" style={{ color: iconColor, width: '20px', height: '20px' }} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm mb-1" style={{ color: titleColor }}>
            {title}
          </p>
          {message && (
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              {message}
            </p>
          )}
        </div>
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-black hover:bg-opacity-5 transition-colors"
          aria-label="Close notification"
        >
          <X style={{ width: '16px', height: '16px', color: colors.text.tertiary }} />
        </button>
      </div>
    </div>
  );
}
