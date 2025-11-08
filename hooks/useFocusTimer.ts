import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';

export type TimerPhase = 'work' | 'break' | 'longBreak' | 'paused';

export interface FocusTimerConfig {
  workDuration: number; // in seconds, default 25 min
  breakDuration: number; // in seconds, default 5 min
  longBreakDuration: number; // in seconds, default 15 min
  longBreakInterval: number; // after N pomodoros, default 4
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
}

export interface FocusTimerState {
  phase: TimerPhase;
  timeLeft: number;
  pomodorosCompleted: number;
  isRunning: boolean;
  xpBonus: number;
  totalFocusTime: number; // in seconds
}

const DEFAULT_CONFIG: FocusTimerConfig = {
  workDuration: 25 * 60, // 25 minutes
  breakDuration: 5 * 60, // 5 minutes
  longBreakDuration: 15 * 60, // 15 minutes
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartWork: false,
  soundEnabled: true,
};

export function useFocusTimer(config: Partial<FocusTimerConfig> = {}) {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  const [phase, setPhase] = useState<TimerPhase>('work');
  const [timeLeft, setTimeLeft] = useState(fullConfig.workDuration);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalFocusTime, setTotalFocusTime] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const phaseRef = useRef(phase);

  // Keep phase ref in sync
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Calculate XP bonus: 5 XP per completed pomodoro
  const xpBonus = pomodorosCompleted * 5;

  // Play sound notification
  const playSound = useCallback(() => {
    if (fullConfig.soundEnabled && typeof Audio !== 'undefined') {
      try {
        // Simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (error) {
        logger.debug('Sound not supported', { error });
      }
    }
  }, [fullConfig.soundEnabled]);

  // Handle timer tick
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handlePhaseComplete();
            return 0;
          }

          // Track focus time (only during work phase)
          if (phaseRef.current === 'work') {
            setTotalFocusTime((time) => time + 1);
          }

          return prev - 1;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isRunning, timeLeft]);

  // Handle phase completion
  const handlePhaseComplete = useCallback(() => {
    playSound();
    setIsRunning(false);

    if (phase === 'work') {
      // Completed a pomodoro
      const newCount = pomodorosCompleted + 1;
      setPomodorosCompleted(newCount);

      // Decide next phase
      const isLongBreak = newCount % fullConfig.longBreakInterval === 0;
      const nextPhase = isLongBreak ? 'longBreak' : 'break';
      const nextDuration = isLongBreak ? fullConfig.longBreakDuration : fullConfig.breakDuration;

      setPhase(nextPhase);
      setTimeLeft(nextDuration);

      if (fullConfig.autoStartBreaks) {
        setIsRunning(true);
      }
    } else {
      // Completed a break
      setPhase('work');
      setTimeLeft(fullConfig.workDuration);

      if (fullConfig.autoStartWork) {
        setIsRunning(true);
      }
    }
  }, [phase, pomodorosCompleted, fullConfig, playSound]);

  // Control functions
  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setPhase('work');
    setTimeLeft(fullConfig.workDuration);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [fullConfig.workDuration]);

  const skip = useCallback(() => {
    handlePhaseComplete();
  }, [handlePhaseComplete]);

  const resetSession = useCallback(() => {
    setIsRunning(false);
    setPhase('work');
    setTimeLeft(fullConfig.workDuration);
    setPomodorosCompleted(0);
    setTotalFocusTime(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [fullConfig.workDuration]);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Get progress percentage
  const getProgress = useCallback((): number => {
    const totalDuration = phase === 'work'
      ? fullConfig.workDuration
      : phase === 'longBreak'
      ? fullConfig.longBreakDuration
      : fullConfig.breakDuration;

    return ((totalDuration - timeLeft) / totalDuration) * 100;
  }, [phase, timeLeft, fullConfig]);

  return {
    // State
    phase,
    timeLeft,
    pomodorosCompleted,
    isRunning,
    xpBonus,
    totalFocusTime,

    // Controls
    start,
    pause,
    reset,
    skip,
    resetSession,

    // Helpers
    formatTime,
    getProgress,
  };
}
