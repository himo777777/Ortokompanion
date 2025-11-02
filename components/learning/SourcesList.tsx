'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SourceReference } from '@/types/verification';
import EvidenceBadge, { EvidenceIcon } from './EvidenceBadge';
import { colors } from '@/lib/design-tokens';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';

interface SourcesListProps {
  sources: SourceReference[];
  variant?: 'compact' | 'detailed';
  onSourceClick?: (source: SourceReference) => void;
  showEvidenceLevel?: boolean;
  maxVisible?: number;
}

const SOURCE_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  'clinical-guideline': { label: 'Klinisk riktlinje', icon: '📋' },
  'textbook': { label: 'Lärobok', icon: '📚' },
  'journal-article': { label: 'Vetenskaplig artikel', icon: '📄' },
  'registry-data': { label: 'Registerdata', icon: '📊' },
  'classification-system': { label: 'Klassifikationssystem', icon: '🏷️' },
  'previous-exam': { label: 'Tidigare tentamen', icon: '✓' },
  'expert-consensus': { label: 'Expertkonsensus', icon: '👥' },
  'clinical-trial': { label: 'Klinisk studie', icon: '🔬' },
};

export default function SourcesList({
  sources,
  variant = 'detailed',
  onSourceClick,
  showEvidenceLevel = true,
  maxVisible,
}: SourcesListProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleSources = maxVisible && !showAll ? sources.slice(0, maxVisible) : sources;
  const hasMore = maxVisible && sources.length > maxVisible;

  if (sources.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic py-4">
        Inga källor tillgängliga
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-2">
        {visibleSources.map((source, index) => (
          <CompactSourceItem
            key={source.id}
            source={source}
            index={index}
            onClick={onSourceClick}
            showEvidenceLevel={showEvidenceLevel}
          />
        ))}
        {hasMore && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
          >
            +{sources.length - maxVisible!} till
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-3"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {visibleSources.map((source, index) => (
        <DetailedSourceItem
          key={source.id}
          source={source}
          index={index}
          onClick={onSourceClick}
          showEvidenceLevel={showEvidenceLevel}
        />
      ))}
      {hasMore && !showAll && (
        <motion.button
          variants={staggerItem}
          onClick={() => setShowAll(true)}
          className="w-full py-3 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium border-2 border-dashed border-blue-200 hover:border-blue-300"
        >
          Visa {sources.length - maxVisible!} källor till
        </motion.button>
      )}
    </motion.div>
  );
}

/**
 * Compact source item (chip-style)
 */
function CompactSourceItem({
  source,
  index,
  onClick,
  showEvidenceLevel,
}: {
  source: SourceReference;
  index: number;
  onClick?: (source: SourceReference) => void;
  showEvidenceLevel: boolean;
}) {
  const typeInfo = SOURCE_TYPE_LABELS[source.type] || { label: source.type, icon: '📄' };

  return (
    <motion.button
      variants={staggerItem}
      onClick={() => onClick?.(source)}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="text-base">{typeInfo.icon}</span>
      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
        {source.author || source.title.split(':')[0]} ({source.year})
      </span>
      {showEvidenceLevel && source.evidenceLevel && (
        <EvidenceIcon level={source.evidenceLevel} size={12} />
      )}
      {source.reliability >= 90 && (
        <span className="text-xs" title={`${source.reliability}% tillförlitlighet`}>⭐</span>
      )}
    </motion.button>
  );
}

/**
 * Detailed source item (card-style)
 */
function DetailedSourceItem({
  source,
  index,
  onClick,
  showEvidenceLevel,
}: {
  source: SourceReference;
  index: number;
  onClick?: (source: SourceReference) => void;
  showEvidenceLevel: boolean;
}) {
  const typeInfo = SOURCE_TYPE_LABELS[source.type] || { label: source.type, icon: '📄' };

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 90) return colors.success[500];
    if (reliability >= 75) return colors.primary[500];
    if (reliability >= 60) return colors.warning[500];
    return colors.error[500];
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return colors.success[500];
      case 'pending-review':
        return colors.warning[500];
      case 'needs-update':
        return colors.warning[500];
      case 'flagged':
        return colors.error[500];
      case 'draft':
        return colors.gray[500];
      default:
        return colors.gray[400];
    }
  };

  const getVerificationStatusLabel = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Verifierad';
      case 'pending-review':
        return 'Under granskning';
      case 'needs-update':
        return 'Behöver uppdatering';
      case 'flagged':
        return 'Flaggad';
      case 'draft':
        return 'Utkast';
      default:
        return status;
    }
  };

  return (
    <motion.div
      variants={staggerItem}
      onClick={() => onClick?.(source)}
      className={`bg-white border-2 border-gray-200 rounded-xl p-4 transition-all ${
        onClick ? 'cursor-pointer hover:border-blue-300 hover:shadow-md' : ''
      }`}
      whileHover={onClick ? { y: -2 } : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Header with icon and type */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{typeInfo.icon}</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {typeInfo.label}
            </span>
            {showEvidenceLevel && source.evidenceLevel && (
              <EvidenceBadge level={source.evidenceLevel} size="sm" />
            )}
          </div>

          {/* Title */}
          <h4 className="font-semibold text-gray-900 mb-1 leading-snug">
            {source.title}
          </h4>

          {/* Author and year */}
          <div className="text-sm text-gray-600 mb-3">
            {source.author && <span className="font-medium">{source.author}</span>}
            {source.author && source.year && <span className="mx-1">•</span>}
            <span>{source.year}</span>
          </div>

          {/* Metadata row */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Reliability score */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: getReliabilityColor(source.reliability) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${source.reliability}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
                </div>
              </div>
              <span className="text-xs font-semibold" style={{ color: getReliabilityColor(source.reliability) }}>
                {source.reliability}%
              </span>
            </div>

            {/* Verification status */}
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getVerificationStatusColor(source.verificationStatus) }}
              />
              <span className="text-xs font-medium text-gray-600">
                {getVerificationStatusLabel(source.verificationStatus)}
              </span>
            </div>
          </div>
        </div>

        {/* Click indicator */}
        {onClick && (
          <div className="flex-shrink-0 text-gray-400 group-hover:text-blue-500 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Inline sources summary (for use in explanations)
 */
export function SourcesSummary({ sources }: { sources: SourceReference[] }) {
  if (sources.length === 0) return null;

  const evidenceLevels = sources
    .filter(s => s.evidenceLevel)
    .map(s => s.evidenceLevel!);

  const bestEvidence = evidenceLevels.length > 0
    ? evidenceLevels.sort((a, b) => {
        const order = ['1A', '1B', '2A', '2B', '3', '4', '5'];
        return order.indexOf(a) - order.indexOf(b);
      })[0]
    : null;

  const avgReliability = Math.round(
    sources.reduce((sum, s) => sum + s.reliability, 0) / sources.length
  );

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm">
      <span className="font-medium text-blue-900">
        {sources.length} {sources.length === 1 ? 'källa' : 'källor'}
      </span>
      {bestEvidence && (
        <>
          <span className="text-blue-400">•</span>
          <EvidenceBadge level={bestEvidence} size="sm" showLabel={false} />
        </>
      )}
      <span className="text-blue-400">•</span>
      <span className="text-blue-700 font-semibold">{avgReliability}% tillförlitligt</span>
    </div>
  );
}

/**
 * Sources counter badge
 */
export function SourcesCount({ count, evidenceLevel }: { count: number; evidenceLevel?: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-md">
      <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      <span className="text-xs font-semibold text-gray-700">{count}</span>
      {evidenceLevel && (
        <span className="text-xs text-gray-500">• {evidenceLevel}</span>
      )}
    </div>
  );
}
