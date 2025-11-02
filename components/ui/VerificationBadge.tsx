'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { colors } from '@/lib/design-tokens';
import { SourceReference, VerificationStatus } from '@/types/verification';
import SourcesList, { SourcesSummary } from '@/components/learning/SourcesList';
import SourceDetailModal from '@/components/learning/SourceDetailModal';
import { calculateQualityScore } from '@/lib/verification-utils';

interface VerificationBadgeProps {
  sources: SourceReference[];
  compact?: boolean;
  showTooltip?: boolean;
  clickable?: boolean;
  showQualityScore?: boolean;
}

export default function VerificationBadge({
  sources,
  compact = false,
  showTooltip = true,
  clickable = true,
  showQualityScore = false,
}: VerificationBadgeProps) {
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState<SourceReference | null>(null);

  if (!sources || sources.length === 0) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs"
        style={{
          background: colors.gray[100],
          color: colors.gray[600],
        }}
        title="Ingen källa angiven"
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        {!compact && <span>Ej verifierad</span>}
      </div>
    );
  }

  const allVerified = sources.every((s) => s.verificationStatus === 'verified');
  const hasOutdated = sources.some(
    (s) => s.verificationStatus === 'outdated' || s.verificationStatus === 'deprecated'
  );
  const needsReview = sources.some((s) => s.verificationStatus === 'needs-review');

  const avgReliability =
    sources.reduce((sum, s) => sum + s.reliability, 0) / sources.length;

  // Calculate quality score if requested
  const qualityScore = showQualityScore
    ? Math.round(
        sources.reduce((sum, s) => {
          // Simplified quality calculation
          const verification = {
            contentId: '',
            contentType: 'question' as const,
            verificationStatus: s.verificationStatus,
            sources: [s],
            qualityScore: 0,
          };
          return sum + calculateQualityScore(verification as any);
        }, 0) / sources.length
      )
    : 0;

  let icon = <Shield className="w-3.5 h-3.5" />;
  let bgColor = colors.gray[100];
  let textColor = colors.gray[700];
  let label = 'Verifierad';
  let tooltipText = `${sources.length} källor`;

  if (allVerified && avgReliability >= 90) {
    icon = <CheckCircle className="w-3.5 h-3.5" />;
    bgColor = colors.success[100];
    textColor = colors.success[700];
    label = '100% Verifierad';
    tooltipText = `${sources.length} verifierade källor (${Math.round(avgReliability)}% tillförlitlighet)`;
  } else if (hasOutdated) {
    icon = <AlertTriangle className="w-3.5 h-3.5" />;
    bgColor = colors.error[100];
    textColor = colors.error[700];
    label = 'Föråldrad källa';
    tooltipText = 'En eller flera källor behöver uppdateras';
  } else if (needsReview) {
    icon = <Clock className="w-3.5 h-3.5" />;
    bgColor = colors.warning[100];
    textColor = colors.warning[700];
    label = 'Under granskning';
    tooltipText = 'Källorna granskas';
  } else if (allVerified) {
    icon = <CheckCircle className="w-3.5 h-3.5" />;
    bgColor = colors.success[100];
    textColor = colors.success[700];
    label = 'Verifierad';
    tooltipText = `${sources.length} verifierade källor (${Math.round(avgReliability)}% tillförlitlighet)`;
  }

  const BadgeContent = (
    <>
      {icon}
      {!compact && (
        <span>
          {label}
          {showQualityScore && ` (${qualityScore}/100)`}
        </span>
      )}
      {clickable && sources.length > 0 && (
        <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
    </>
  );

  if (!clickable) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium"
        style={{
          background: bgColor,
          color: textColor,
        }}
        title={showTooltip ? tooltipText : undefined}
      >
        {BadgeContent}
      </div>
    );
  }

  return (
    <>
      <motion.button
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium cursor-pointer transition-all"
        style={{
          background: bgColor,
          color: textColor,
        }}
        title={showTooltip ? `${tooltipText} - Klicka för detaljer` : undefined}
        onClick={() => setShowSourcesModal(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {BadgeContent}
      </motion.button>

      {/* Sources List Modal */}
      {showSourcesModal && (
        <SourcesListModal
          sources={sources}
          isOpen={showSourcesModal}
          onClose={() => setShowSourcesModal(false)}
          onSourceClick={(source) => {
            setSelectedSource(source);
            setShowSourcesModal(false);
          }}
        />
      )}

      {/* Source Detail Modal */}
      <SourceDetailModal
        source={selectedSource}
        isOpen={!!selectedSource}
        onClose={() => setSelectedSource(null)}
      />
    </>
  );
}

/**
 * Modal showing list of sources
 */
interface SourcesListModalProps {
  sources: SourceReference[];
  isOpen: boolean;
  onClose: () => void;
  onSourceClick: (source: SourceReference) => void;
}

function SourcesListModal({ sources, isOpen, onClose, onSourceClick }: SourcesListModalProps) {
  const { modalBackdrop, modalContent } = require('@/lib/animations');

  return (
    <motion.div
      variants={modalBackdrop}
      initial="hidden"
      animate={isOpen ? 'visible' : 'hidden'}
      exit="exit"
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        variants={modalContent}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Källor & Referenser</h2>
            <p className="text-sm opacity-90 mt-1">{sources.length} verifierade källor</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <SourcesList sources={sources} variant="detailed" onSourceClick={onSourceClick} />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <SourcesSummary sources={sources} />
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Stäng
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface SourceListProps {
  sources: SourceReference[];
  clickable?: boolean;
  onSourceClick?: (source: SourceReference) => void;
}

export function SourceList({ sources, clickable = true, onSourceClick }: SourceListProps) {
  const [selectedSource, setSelectedSource] = useState<SourceReference | null>(null);

  if (!sources || sources.length === 0) {
    return (
      <div className="text-sm p-3 rounded-lg" style={{ background: colors.gray[50], color: colors.text.secondary }}>
        Inga källor angivna
      </div>
    );
  }

  const handleSourceClick = (source: SourceReference) => {
    if (clickable) {
      if (onSourceClick) {
        onSourceClick(source);
      } else {
        setSelectedSource(source);
      }
    }
  };

  return (
    <>
      <div className="space-y-2">
        {sources.map((source, idx) => (
          <motion.div
            key={source.id}
            className={`p-3 rounded-lg border text-sm transition-all ${
              clickable ? 'cursor-pointer hover:border-blue-300 hover:shadow-md' : ''
            }`}
            style={{
              borderColor: colors.border.light,
              background: colors.background.primary,
            }}
            onClick={() => handleSourceClick(source)}
            whileHover={clickable ? { y: -2 } : undefined}
            whileTap={clickable ? { scale: 0.98 } : undefined}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium mb-1" style={{ color: colors.text.primary }}>
                  {source.title}
                </div>
                <div className="text-xs space-y-1" style={{ color: colors.text.secondary }}>
                  <div>
                    {source.author} ({source.year})
                    {source.edition && ` - ${source.edition} upplaga`}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="capitalize">{source.type.replace(/-/g, ' ')}</span>
                    {source.evidenceLevel && (
                      <>
                        <span>•</span>
                        <span>Evidens: {source.evidenceLevel}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{source.reliability}% tillförlitlighet</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <VerificationBadge sources={[source]} compact clickable={false} />
                {clickable && (
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Source Detail Modal */}
      {!onSourceClick && (
        <SourceDetailModal
          source={selectedSource}
          isOpen={!!selectedSource}
          onClose={() => setSelectedSource(null)}
        />
      )}
    </>
  );
}
