'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { hoverLift, tapScale } from '@/lib/animations';
import { colors } from '@/lib/design-tokens';

interface InteractiveCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hoverEffect?: boolean;
  glowOnHover?: boolean;
  disabled?: boolean;
}

/**
 * Interactive Card with hover and click animations
 */
export default function InteractiveCard({
  children,
  onClick,
  className = '',
  hoverEffect = true,
  glowOnHover = false,
  disabled = false,
}: InteractiveCardProps) {
  return (
    <motion.div
      className={`relative ${disabled ? 'cursor-not-allowed opacity-60' : onClick ? 'cursor-pointer' : ''} ${className}`}
      whileHover={!disabled && hoverEffect ? hoverLift : undefined}
      whileTap={!disabled && onClick ? tapScale : undefined}
      onClick={disabled ? undefined : onClick}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {glowOnHover && !disabled && (
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0"
          style={{
            background: `radial-gradient(circle at center, ${colors.primary[500]}40 0%, transparent 70%)`,
            filter: 'blur(20px)',
          }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

/**
 * Interactive Button with haptic feedback
 */
interface InteractiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export function InteractiveButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type,
  ...props
}: InteractiveButtonProps) {
  const variantStyles = {
    primary: `bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700`,
    secondary: `bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300`,
    success: `bg-green-500 text-white hover:bg-green-600 active:bg-green-700`,
    danger: `bg-red-500 text-white hover:bg-red-600 active:bg-red-700`,
    ghost: `bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200`,
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      className={`
        relative inline-flex items-center justify-center gap-2
        font-medium rounded-lg
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
    >
      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </motion.button>
  );
}

/**
 * Interactive Icon Button
 */
interface InteractiveIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  tooltip?: string;
  variant?: 'default' | 'primary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function InteractiveIconButton({
  icon,
  tooltip,
  variant = 'default',
  size = 'md',
  disabled = false,
  className = '',
  onClick,
  type,
  ...props
}: InteractiveIconButtonProps) {
  const variantStyles = {
    default: 'hover:bg-gray-100 text-gray-600',
    primary: 'hover:bg-blue-50 text-blue-600',
    success: 'hover:bg-green-50 text-green-600',
    danger: 'hover:bg-red-50 text-red-600',
  };

  const sizeStyles = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  return (
    <motion.button
      className={`
        rounded-lg transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      whileHover={{ scale: disabled ? 1 : 1.1 }}
      whileTap={{ scale: disabled ? 1 : 0.9 }}
      disabled={disabled}
      title={tooltip}
      onClick={onClick}
      type={type}
    >
      {icon}
    </motion.button>
  );
}

/**
 * Success Checkmark Animation
 */
export function SuccessCheckmark({ size = 64 }: { size?: number }) {
  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: colors.success[500] }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
      />
      <motion.svg
        className="absolute inset-0"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M 18 32 L 28 42 L 46 22"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
        />
      </motion.svg>
    </motion.div>
  );
}

/**
 * Loading Spinner
 */
export function LoadingSpinner({ size = 24, color = colors.primary[500] }: { size?: number; color?: string }) {
  return (
    <motion.div
      className="rounded-full border-2 border-t-transparent"
      style={{
        width: size,
        height: size,
        borderColor: `${color}40`,
        borderTopColor: color,
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
}

/**
 * Floating Action Button (FAB)
 */
interface FABProps {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function FloatingActionButton({
  icon,
  onClick,
  tooltip,
  position = 'bottom-right',
}: FABProps) {
  const positionStyles = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  return (
    <motion.button
      className={`
        fixed z-40 w-14 h-14 rounded-full shadow-lg
        bg-gradient-to-br from-blue-500 to-blue-600
        text-white
        flex items-center justify-center
        ${positionStyles[position]}
      `}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      title={tooltip}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {icon}
    </motion.button>
  );
}

/**
 * Ripple effect on click
 */
export function useRipple() {
  const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);

  const addRipple = (event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, 600);
  };

  const RippleContainer = () => (
    <>
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
            opacity: 0.5,
          }}
          initial={{ width: 0, height: 0, opacity: 0.5 }}
          animate={{
            width: 200,
            height: 200,
            opacity: 0,
            x: -100,
            y: -100,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </>
  );

  return { addRipple, RippleContainer };
}
