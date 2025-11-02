'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '@/lib/design-tokens';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
  maxWidth?: number;
}

export default function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
  disabled = false,
  maxWidth = 200,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (disabled) return;

    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        let x = 0;
        let y = 0;

        switch (position) {
          case 'top':
            x = rect.left + rect.width / 2;
            y = rect.top + scrollY - 8;
            break;
          case 'bottom':
            x = rect.left + rect.width / 2;
            y = rect.bottom + scrollY + 8;
            break;
          case 'left':
            x = rect.left + scrollX - 8;
            y = rect.top + rect.height / 2 + scrollY;
            break;
          case 'right':
            x = rect.right + scrollX + 8;
            y = rect.top + rect.height / 2 + scrollY;
            break;
        }

        setCoords({ x, y });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getTransformOrigin = () => {
    switch (position) {
      case 'top':
        return 'bottom';
      case 'bottom':
        return 'top';
      case 'left':
        return 'right';
      case 'right':
        return 'left';
      default:
        return 'bottom';
    }
  };

  const getTranslate = () => {
    switch (position) {
      case 'top':
        return { x: '-50%', y: '-100%' };
      case 'bottom':
        return { x: '-50%', y: '0%' };
      case 'left':
        return { x: '-100%', y: '-50%' };
      case 'right':
        return { x: '0%', y: '-50%' };
      default:
        return { x: '-50%', y: '-100%' };
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 pointer-events-none"
            style={{
              left: coords.x,
              top: coords.y,
              transform: `translate(${getTranslate().x}, ${getTranslate().y})`,
              transformOrigin: getTransformOrigin(),
            }}
          >
            <div
              className="px-3 py-2 rounded-lg shadow-lg text-sm font-medium text-white"
              style={{
                backgroundColor: colors.gray[900],
                maxWidth: `${maxWidth}px`,
              }}
            >
              {content}
              {/* Arrow */}
              <div
                className="absolute"
                style={{
                  ...(position === 'top' && {
                    bottom: -4,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderTop: `4px solid ${colors.gray[900]}`,
                  }),
                  ...(position === 'bottom' && {
                    top: -4,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderBottom: `4px solid ${colors.gray[900]}`,
                  }),
                  ...(position === 'left' && {
                    right: -4,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    borderTop: '4px solid transparent',
                    borderBottom: '4px solid transparent',
                    borderLeft: `4px solid ${colors.gray[900]}`,
                  }),
                  ...(position === 'right' && {
                    left: -4,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    borderTop: '4px solid transparent',
                    borderBottom: '4px solid transparent',
                    borderRight: `4px solid ${colors.gray[900]}`,
                  }),
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Info Tooltip with icon
 */
interface InfoTooltipProps {
  content: string | React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function InfoTooltip({ content, position = 'top' }: InfoTooltipProps) {
  return (
    <Tooltip content={content} position={position}>
      <button
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors text-xs font-bold"
        type="button"
      >
        ?
      </button>
    </Tooltip>
  );
}

/**
 * Keyboard shortcut tooltip
 */
interface KeyboardTooltipProps {
  keys: string[];
  description: string;
  children: React.ReactElement;
}

export function KeyboardTooltip({ keys, description, children }: KeyboardTooltipProps) {
  const content = (
    <div>
      <div className="mb-1">{description}</div>
      <div className="flex gap-1">
        {keys.map((key, i) => (
          <kbd
            key={i}
            className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );

  return (
    <Tooltip content={content} maxWidth={250}>
      {children}
    </Tooltip>
  );
}
