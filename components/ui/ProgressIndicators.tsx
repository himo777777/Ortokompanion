'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { colors } from '@/lib/design-tokens';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  animated?: boolean;
  striped?: boolean;
  label?: string;
}

/**
 * Linear Progress Bar
 */
export function ProgressBar({
  progress,
  height = 8,
  color = colors.primary[500],
  backgroundColor = colors.gray[200],
  showPercentage = false,
  animated = true,
  striped = false,
  label,
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-semibold" style={{ color }}>
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      <div
        className="relative w-full rounded-full overflow-hidden"
        style={{ height, backgroundColor }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            backgroundColor: color,
            ...(striped && {
              backgroundImage: `linear-gradient(
                45deg,
                rgba(255, 255, 255, 0.2) 25%,
                transparent 25%,
                transparent 50%,
                rgba(255, 255, 255, 0.2) 50%,
                rgba(255, 255, 255, 0.2) 75%,
                transparent 75%,
                transparent
              )`,
              backgroundSize: '30px 30px',
            }),
          }}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{
            duration: animated ? 0.8 : 0,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {striped && animated && (
            <motion.div
              className="absolute inset-0"
              animate={{ backgroundPosition: '30px 0' }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Circular Progress
 */
interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  label?: string;
  icon?: React.ReactNode;
}

export function CircularProgress({
  progress,
  size = 120,
  strokeWidth = 8,
  color = colors.primary[500],
  backgroundColor = colors.gray[200],
  showPercentage = true,
  label,
  icon,
}: CircularProgressProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {icon && <div className="mb-1">{icon}</div>}
        {showPercentage && (
          <span className="text-2xl font-bold" style={{ color }}>
            {Math.round(clampedProgress)}%
          </span>
        )}
        {label && <span className="text-xs text-gray-600 mt-1">{label}</span>}
      </div>
    </div>
  );
}

/**
 * Step Progress Indicator
 */
interface StepProgressProps {
  steps: Array<{ label: string; description?: string }>;
  currentStep: number; // 0-indexed
  completedColor?: string;
  activeColor?: string;
  inactiveColor?: string;
}

export function StepProgress({
  steps,
  currentStep,
  completedColor = colors.success[500],
  activeColor = colors.primary[500],
  inactiveColor = colors.gray[300],
}: StepProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isInactive = index > currentStep;

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center flex-1">
                {/* Step circle */}
                <motion.div
                  className="relative flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold"
                  style={{
                    borderColor: isCompleted
                      ? completedColor
                      : isActive
                      ? activeColor
                      : inactiveColor,
                    backgroundColor: isCompleted ? completedColor : 'white',
                    color: isCompleted ? 'white' : isActive ? activeColor : inactiveColor,
                  }}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </motion.div>

                {/* Label */}
                <div className="mt-2 text-center">
                  <p
                    className="text-sm font-medium"
                    style={{
                      color: isCompleted || isActive ? colors.gray[900] : colors.gray[500],
                    }}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className="flex-1 h-0.5 mx-2 mb-8"
                  style={{
                    backgroundColor: index < currentStep ? completedColor : inactiveColor,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Radial Progress (like Apple Watch)
 */
interface RadialProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  gradientFrom?: string;
  gradientTo?: string;
  icon?: React.ReactNode;
}

export function RadialProgress({
  progress,
  size = 160,
  strokeWidth = 12,
  gradientFrom = colors.primary[400],
  gradientTo = colors.secondary[500],
  icon,
}: RadialProgressProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedProgress / 100) * circumference;

  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="relative inline-flex">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        </defs>
        {/* Background circle with glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.gray[200]}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          filter="drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {icon && (
        <div className="absolute inset-0 flex items-center justify-center">
          {icon}
        </div>
      )}
    </div>
  );
}

/**
 * Skill Level Progress
 */
interface SkillLevelProps {
  skill: string;
  level: number; // 1-5
  maxLevel?: number;
  color?: string;
}

export function SkillLevel({ skill, level, maxLevel = 5, color = colors.primary[500] }: SkillLevelProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700 min-w-24">{skill}</span>
      <div className="flex gap-1 flex-1">
        {Array.from({ length: maxLevel }).map((_, index) => {
          const isActive = index < level;
          return (
            <motion.div
              key={index}
              className="h-2 flex-1 rounded-full"
              style={{
                backgroundColor: isActive ? color : colors.gray[200],
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            />
          );
        })}
      </div>
      <span className="text-sm font-semibold text-gray-600 min-w-12">
        {level}/{maxLevel}
      </span>
    </div>
  );
}

/**
 * Animated Counter
 */
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

export function AnimatedCounter({
  value,
  duration = 1,
  suffix = '',
  prefix = '',
  decimals = 0,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(value * easeOutQuart);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <span className="tabular-nums">
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
}
