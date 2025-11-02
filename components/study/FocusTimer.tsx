'use client';

import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, X, Coffee, Sparkles } from 'lucide-react';
import { useFocusTimer, FocusTimerConfig } from '@/hooks/useFocusTimer';
import { colors, spacing, borderRadius, shadows } from '@/lib/design-tokens';

interface FocusTimerProps {
  config?: Partial<FocusTimerConfig>;
  onSessionComplete?: (stats: {
    pomodorosCompleted: number;
    totalFocusTime: number;
    xpBonus: number;
  }) => void;
  onClose?: () => void;
  compact?: boolean;
}

export default function FocusTimer({
  config,
  onSessionComplete,
  onClose,
  compact = false,
}: FocusTimerProps) {
  const {
    phase,
    timeLeft,
    pomodorosCompleted,
    isRunning,
    xpBonus,
    totalFocusTime,
    start,
    pause,
    reset,
    skip,
    resetSession,
    formatTime,
    getProgress,
  } = useFocusTimer(config);

  const phaseConfig = {
    work: {
      label: 'Fokustid',
      icon: <Sparkles className="w-6 h-6" />,
      color: colors.primary[600],
      bgColor: colors.primary[50],
      borderColor: colors.primary[200],
    },
    break: {
      label: 'Kort paus',
      icon: <Coffee className="w-6 h-6" />,
      color: colors.success[600],
      bgColor: colors.success[50],
      borderColor: colors.success[200],
    },
    longBreak: {
      label: 'Lång paus',
      icon: <Coffee className="w-6 h-6" />,
      color: colors.success[600],
      bgColor: colors.success[50],
      borderColor: colors.success[200],
    },
    paused: {
      label: 'Pausad',
      icon: <Pause className="w-6 h-6" />,
      color: colors.gray[600],
      bgColor: colors.gray[50],
      borderColor: colors.gray[200],
    },
  };

  const currentConfig = phaseConfig[phase];
  const progress = getProgress();

  const handleComplete = () => {
    if (onSessionComplete) {
      onSessionComplete({
        pomodorosCompleted,
        totalFocusTime,
        xpBonus,
      });
    }
    resetSession();
  };

  if (compact) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-2 rounded-lg border-2"
        style={{
          background: currentConfig.bgColor,
          borderColor: currentConfig.borderColor,
        }}
      >
        <div style={{ color: currentConfig.color }}>
          {currentConfig.icon}
        </div>
        <div>
          <div className="text-sm font-medium" style={{ color: colors.text.primary }}>
            {currentConfig.label}
          </div>
          <div className="text-2xl font-bold" style={{ color: currentConfig.color }}>
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="flex gap-2 ml-auto">
          {!isRunning ? (
            <button
              onClick={start}
              className="p-2 rounded-lg hover:bg-black hover:bg-opacity-5 transition-colors"
              aria-label="Start"
            >
              <Play className="w-5 h-5" style={{ color: currentConfig.color }} />
            </button>
          ) : (
            <button
              onClick={pause}
              className="p-2 rounded-lg hover:bg-black hover:bg-opacity-5 transition-colors"
              aria-label="Pause"
            >
              <Pause className="w-5 h-5" style={{ color: currentConfig.color }} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="self-end p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Stäng"
        >
          <X className="w-5 h-5" style={{ color: colors.text.secondary }} />
        </button>
      )}

      {/* Phase Indicator */}
      <div
        className="px-6 py-3 rounded-full flex items-center gap-3"
        style={{
          background: currentConfig.bgColor,
          border: `2px solid ${currentConfig.borderColor}`,
        }}
      >
        <div style={{ color: currentConfig.color }}>
          {currentConfig.icon}
        </div>
        <span className="font-semibold text-lg" style={{ color: currentConfig.color }}>
          {currentConfig.label}
        </span>
      </div>

      {/* Timer Display */}
      <div className="relative">
        {/* Circular Progress */}
        <svg className="transform -rotate-90" width="280" height="280">
          {/* Background circle */}
          <circle
            cx="140"
            cy="140"
            r="130"
            fill="none"
            stroke={colors.gray[200]}
            strokeWidth="12"
          />
          {/* Progress circle */}
          <circle
            cx="140"
            cy="140"
            r="130"
            fill="none"
            stroke={currentConfig.color}
            strokeWidth="12"
            strokeDasharray={`${2 * Math.PI * 130}`}
            strokeDashoffset={`${2 * Math.PI * 130 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>

        {/* Time Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="text-6xl font-bold tabular-nums"
            style={{ color: currentConfig.color }}
          >
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm mt-2" style={{ color: colors.text.secondary }}>
            {isRunning ? 'Pågår...' : 'Pausad'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!isRunning ? (
          <button
            onClick={start}
            className="px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
            style={{
              background: currentConfig.color,
              color: 'white',
              boxShadow: shadows.lg,
            }}
          >
            <Play className="w-6 h-6 inline mr-2" />
            Starta
          </button>
        ) : (
          <button
            onClick={pause}
            className="px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
            style={{
              background: colors.warning[500],
              color: 'white',
              boxShadow: shadows.lg,
            }}
          >
            <Pause className="w-6 h-6 inline mr-2" />
            Pausa
          </button>
        )}

        <button
          onClick={reset}
          className="p-4 rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="Återställ"
          title="Återställ timer"
        >
          <RotateCcw className="w-6 h-6" style={{ color: colors.text.secondary }} />
        </button>

        <button
          onClick={skip}
          className="p-4 rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="Hoppa över"
          title="Hoppa till nästa fas"
        >
          <SkipForward className="w-6 h-6" style={{ color: colors.text.secondary }} />
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-6 mt-6">
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: colors.primary[600] }}>
            {pomodorosCompleted}
          </div>
          <div className="text-sm" style={{ color: colors.text.secondary }}>
            Pomodoros
          </div>
        </div>

        <div className="w-px bg-gray-300" />

        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: colors.success[600] }}>
            +{xpBonus} XP
          </div>
          <div className="text-sm" style={{ color: colors.text.secondary }}>
            Bonus
          </div>
        </div>

        <div className="w-px bg-gray-300" />

        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: colors.warning[600] }}>
            {Math.floor(totalFocusTime / 60)}m
          </div>
          <div className="text-sm" style={{ color: colors.text.secondary }}>
            Fokustid
          </div>
        </div>
      </div>

      {/* Pomodoro Progress Indicator */}
      {pomodorosCompleted > 0 && (
        <div className="flex gap-2 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full"
              style={{
                background: i < (pomodorosCompleted % 4) ? colors.primary[500] : colors.gray[300],
              }}
            />
          ))}
        </div>
      )}

      {/* Complete Session Button */}
      {pomodorosCompleted > 0 && (
        <button
          onClick={handleComplete}
          className="mt-4 px-6 py-3 rounded-lg font-medium transition-colors"
          style={{
            background: colors.success[100],
            color: colors.success[700],
          }}
        >
          Avsluta session & spara
        </button>
      )}
    </div>
  );
}
