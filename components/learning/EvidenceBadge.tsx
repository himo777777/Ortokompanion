'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Tooltip from '@/components/ui/Tooltip';
import { colors } from '@/lib/design-tokens';

type EvidenceLevel = '1A' | '1B' | '2A' | '2B' | '3' | '4' | '5';

interface EvidenceBadgeProps {
  level: EvidenceLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const EVIDENCE_LEVEL_INFO: Record<EvidenceLevel, {
  label: string;
  description: string;
  color: string;
  strength: string;
}> = {
  '1A': {
    label: 'Nivå 1A',
    description: 'Systematisk översikt av RCT:er (randomiserade kontrollerade studier)',
    color: colors.success[600],
    strength: 'Högsta evidensstyrka',
  },
  '1B': {
    label: 'Nivå 1B',
    description: 'Individuell RCT med snävt konfidensintervall',
    color: colors.success[500],
    strength: 'Mycket hög evidensstyrka',
  },
  '2A': {
    label: 'Nivå 2A',
    description: 'Systematisk översikt av kohortstudier',
    color: colors.primary[600],
    strength: 'Hög evidensstyrka',
  },
  '2B': {
    label: 'Nivå 2B',
    description: 'Individuell kohortstudie eller RCT av lägre kvalitet',
    color: colors.primary[500],
    strength: 'Måttlig evidensstyrka',
  },
  '3': {
    label: 'Nivå 3',
    description: 'Fallkontrollstudie eller case-series',
    color: colors.warning[600],
    strength: 'Låg evidensstyrka',
  },
  '4': {
    label: 'Nivå 4',
    description: 'Expertutlåtande eller konsensus',
    color: colors.warning[500],
    strength: 'Mycket låg evidensstyrka',
  },
  '5': {
    label: 'Nivå 5',
    description: 'Okritiskt expertomdöme',
    color: colors.gray[500],
    strength: 'Lägsta evidensstyrka',
  },
};

export default function EvidenceBadge({ level, showLabel = true, size = 'md' }: EvidenceBadgeProps) {
  const info = EVIDENCE_LEVEL_INFO[level];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const tooltipContent = (
    <div className="max-w-xs">
      <div className="font-semibold mb-1">{info.label}</div>
      <div className="text-xs mb-2">{info.strength}</div>
      <div className="text-xs opacity-90">{info.description}</div>
    </div>
  );

  return (
    <Tooltip content={tooltipContent} position="top">
      <motion.div
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClasses[size]}`}
        style={{
          backgroundColor: `${info.color}20`,
          color: info.color,
          border: `1.5px solid ${info.color}`,
        }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {/* Evidence strength icon */}
        <svg
          width={iconSizes[size]}
          height={iconSizes[size]}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shield icon with bars indicating strength */}
          <path
            d="M8 1L2 3V7C2 11 5 14 8 15C11 14 14 11 14 7V3L8 1Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Strength bars */}
          {(level === '1A' || level === '1B') && (
            <>
              <line x1="5" y1="10" x2="5" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="8" y1="10" x2="8" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="11" y1="10" x2="11" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
          {(level === '2A' || level === '2B') && (
            <>
              <line x1="6" y1="10" x2="6" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="10" y1="10" x2="10" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
          {level === '3' && (
            <line x1="8" y1="10" x2="8" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          )}
          {(level === '4' || level === '5') && (
            <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          )}
        </svg>

        {showLabel && <span>{level}</span>}
      </motion.div>
    </Tooltip>
  );
}

/**
 * Compact evidence level indicator (icon only)
 */
export function EvidenceIcon({ level, size = 16 }: { level: EvidenceLevel; size?: number }) {
  const info = EVIDENCE_LEVEL_INFO[level];

  return (
    <Tooltip content={`${info.label}: ${info.description}`} position="top">
      <motion.div
        className="inline-flex items-center justify-center rounded-full"
        style={{
          width: size + 8,
          height: size + 8,
          backgroundColor: `${info.color}20`,
          border: `1.5px solid ${info.color}`,
          color: info.color,
        }}
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 1L2 3V7C2 11 5 14 8 15C11 14 14 11 14 7V3L8 1Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {(level === '1A' || level === '1B') && (
            <>
              <line x1="5" y1="10" x2="5" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="8" y1="10" x2="8" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="11" y1="10" x2="11" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
          {(level === '2A' || level === '2B') && (
            <>
              <line x1="6" y1="10" x2="6" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="10" y1="10" x2="10" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
          {level === '3' && (
            <line x1="8" y1="10" x2="8" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          )}
          {(level === '4' || level === '5') && (
            <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          )}
        </svg>
      </motion.div>
    </Tooltip>
  );
}

/**
 * Evidence level comparison display
 */
export function EvidenceComparison({ levels }: { levels: EvidenceLevel[] }) {
  const sortedLevels = [...new Set(levels)].sort((a, b) => {
    const order = ['1A', '1B', '2A', '2B', '3', '4', '5'];
    return order.indexOf(a) - order.indexOf(b);
  });

  const bestLevel = sortedLevels[0];
  const info = EVIDENCE_LEVEL_INFO[bestLevel];

  return (
    <div className="flex items-center gap-2">
      <div className="text-xs font-medium text-gray-600">Evidensstyrka:</div>
      <div className="flex items-center gap-1">
        {sortedLevels.map((level, index) => (
          <React.Fragment key={level}>
            <EvidenceBadge level={level} showLabel={true} size="sm" />
            {index < sortedLevels.length - 1 && (
              <span className="text-gray-400 text-xs">•</span>
            )}
          </React.Fragment>
        ))}
      </div>
      {sortedLevels.length > 1 && (
        <div className="text-xs text-gray-500 ml-1">
          (Baserat på {sortedLevels.length} källor)
        </div>
      )}
    </div>
  );
}
