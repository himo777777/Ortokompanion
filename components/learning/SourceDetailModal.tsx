'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SourceReference } from '@/types/verification';
import EvidenceBadge from './EvidenceBadge';
import { modalBackdrop, modalContent } from '@/lib/animations';
import { colors } from '@/lib/design-tokens';
import { InteractiveButton } from '@/components/ui/InteractiveCard';

interface SourceDetailModalProps {
  source: SourceReference | null;
  isOpen: boolean;
  onClose: () => void;
}

type CitationFormat = 'vancouver' | 'apa';

const SOURCE_TYPE_LABELS: Record<string, string> = {
  'clinical-guideline': 'Klinisk riktlinje',
  'textbook': 'Lärobok',
  'journal-article': 'Vetenskaplig artikel',
  'registry-data': 'Registerdata',
  'classification-system': 'Klassifikationssystem',
  'previous-exam': 'Tidigare tentamen',
  'expert-consensus': 'Expertkonsensus',
  'clinical-trial': 'Klinisk studie',
};

export default function SourceDetailModal({ source, isOpen, onClose }: SourceDetailModalProps) {
  const [citationFormat, setCitationFormat] = useState<CitationFormat>('vancouver');
  const [copied, setCopied] = useState(false);

  if (!source) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const vancouverCitation = generateVancouverCitation(source);
  const apaCitation = generateAPACitation(source);
  const currentCitation = citationFormat === 'vancouver' ? vancouverCitation : apaCitation;

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 90) return colors.success[500];
    if (reliability >= 75) return colors.primary[500];
    if (reliability >= 60) return colors.warning[500];
    return colors.error[500];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              variants={modalContent}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-sm font-semibold opacity-90 mb-1">
                      {SOURCE_TYPE_LABELS[source.type]}
                    </div>
                    <h2 className="text-xl font-bold leading-tight">
                      {source.title}
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Author and Year */}
                <div className="mb-6">
                  <div className="flex items-center gap-4 text-gray-700">
                    {source.author && (
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">{source.author}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">{source.year}</span>
                    </div>
                  </div>
                </div>

                {/* Badges and Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Evidence Level */}
                  {source.evidenceLevel && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Evidensnivå
                      </div>
                      <EvidenceBadge level={source.evidenceLevel} size="lg" />
                    </div>
                  )}

                  {/* Reliability */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Tillförlitlighet
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: getReliabilityColor(source.reliability) }}
                            initial={{ width: 0 }}
                            animate={{ width: `${source.reliability}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </div>
                      <span
                        className="text-2xl font-bold"
                        style={{ color: getReliabilityColor(source.reliability) }}
                      >
                        {source.reliability}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* External Links */}
                {(source.doi || source.url) && (
                  <div className="mb-6">
                    <div className="text-sm font-semibold text-gray-700 mb-3">Externa länkar</div>
                    <div className="flex flex-wrap gap-2">
                      {source.doi && (
                        <a
                          href={`https://doi.org/${source.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors font-medium text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          DOI: {source.doi}
                        </a>
                      )}
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors font-medium text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          Öppna källa
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Citation Section */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-gray-700">Citera denna källa</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCitationFormat('vancouver')}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          citationFormat === 'vancouver'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Vancouver
                      </button>
                      <button
                        onClick={() => setCitationFormat('apa')}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          citationFormat === 'apa'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        APA
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="bg-gray-50 rounded-xl p-4 pr-12 border-2 border-gray-200 font-mono text-sm text-gray-800 leading-relaxed">
                      {currentCitation}
                    </div>
                    <button
                      onClick={() => handleCopy(currentCitation)}
                      className="absolute top-4 right-4 p-2 hover:bg-white rounded-lg transition-colors group"
                      title="Kopiera citation"
                    >
                      {copied ? (
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {copied && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-green-600 font-medium"
                    >
                      Citation kopierad!
                    </motion.div>
                  )}
                </div>

                {/* Metadata */}
                {source.lastVerified && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          Senast verifierad: {new Date(source.lastVerified).toLocaleDateString('sv-SE')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <InteractiveButton variant="secondary" onClick={onClose}>
                  Stäng
                </InteractiveButton>
                <InteractiveButton
                  variant="primary"
                  onClick={() => handleCopy(currentCitation)}
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  }
                >
                  Kopiera citation
                </InteractiveButton>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Generate Vancouver citation
 */
function generateVancouverCitation(source: SourceReference): string {
  let citation = '';

  // Author
  if (source.author) {
    citation += `${source.author}. `;
  }

  // Title
  citation += `${source.title}. `;

  // Type-specific formatting
  switch (source.type) {
    case 'journal-article':
      if (source.journal) {
        citation += `${source.journal}. `;
      }
      citation += `${source.year}`;
      if (source.volume) {
        citation += `;${source.volume}`;
        if (source.issue) {
          citation += `(${source.issue})`;
        }
        if (source.pages) {
          citation += `:${source.pages}`;
        }
      }
      break;

    case 'textbook':
      if (source.edition) {
        citation += `${source.edition} ed. `;
      }
      if (source.publisher) {
        citation += `${source.publisher}; `;
      }
      citation += `${source.year}`;
      break;

    case 'clinical-guideline':
      citation += `${source.year}`;
      break;

    default:
      citation += `${source.year}`;
  }

  // DOI
  if (source.doi) {
    citation += `. doi:${source.doi}`;
  }

  return citation;
}

/**
 * Generate APA citation
 */
function generateAPACitation(source: SourceReference): string {
  let citation = '';

  // Author and year
  if (source.author) {
    citation += `${source.author} (${source.year}). `;
  } else {
    citation += `(${source.year}). `;
  }

  // Title
  citation += `${source.title}. `;

  // Type-specific formatting
  switch (source.type) {
    case 'journal-article':
      if (source.journal) {
        citation += `${source.journal}`;
        if (source.volume) {
          citation += `, ${source.volume}`;
          if (source.issue) {
            citation += `(${source.issue})`;
          }
        }
        if (source.pages) {
          citation += `, ${source.pages}`;
        }
        citation += '. ';
      }
      break;

    case 'textbook':
      if (source.edition) {
        citation += `(${source.edition} ed.). `;
      }
      if (source.publisher) {
        citation += `${source.publisher}. `;
      }
      break;

    case 'clinical-guideline':
      if (source.publisher) {
        citation += `${source.publisher}. `;
      }
      break;
  }

  // DOI or URL
  if (source.doi) {
    citation += `https://doi.org/${source.doi}`;
  } else if (source.url) {
    citation += source.url;
  }

  return citation;
}
