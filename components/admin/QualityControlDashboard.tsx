'use client';

import React, { useState, useMemo } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  TrendingUp,
  FileText,
  AlertCircle,
  Info,
} from 'lucide-react';
import { colors, spacing, borderRadius, shadows } from '@/lib/design-tokens';
import {
  VERIFIED_SOURCES,
  getSourcesNeedingReview,
  getRecentlyVerifiedSources,
  getSourcesByType,
} from '@/data/verified-sources';
import { SourceReference, VerificationStatus } from '@/types/verification';

export default function QualityControlDashboard() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'sources' | 'alerts'>('overview');

  const sources = Object.values(VERIFIED_SOURCES);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = sources.length;
    const verified = sources.filter((s) => s.verificationStatus === 'verified').length;
    const needsReview = sources.filter((s) => s.verificationStatus === 'needs-review').length;
    const outdated = sources.filter((s) => s.verificationStatus === 'outdated').length;

    const avgReliability =
      sources.reduce((sum, s) => sum + s.reliability, 0) / sources.length;

    const now = new Date();
    const expiringSoon = sources.filter((s) => {
      if (!s.expirationDate) return false;
      const daysUntil = (s.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntil > 0 && daysUntil <= 30;
    }).length;

    const expired = sources.filter((s) => {
      if (!s.expirationDate) return false;
      return s.expirationDate < now;
    }).length;

    return {
      total,
      verified,
      needsReview,
      outdated,
      avgReliability: Math.round(avgReliability),
      expiringSoon,
      expired,
      verificationRate: Math.round((verified / total) * 100),
    };
  }, [sources]);

  const sourcesByType = useMemo(() => {
    const types: Record<string, number> = {};
    sources.forEach((s) => {
      types[s.type] = (types[s.type] || 0) + 1;
    });
    return types;
  }, [sources]);

  const recentlyVerified = getRecentlyVerifiedSources(30);
  const sourcesNeedingReview = getSourcesNeedingReview();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-lg"
            style={{ background: colors.primary[100] }}
          >
            <Shield className="w-6 h-6" style={{ color: colors.primary[600] }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
              Kvalitetskontroll
            </h1>
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              Säkerställer 100% korrekt och uppdaterad medicinsk information
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: colors.success[50], border: `2px solid ${colors.success[200]}` }}>
          <CheckCircle className="w-5 h-5" style={{ color: colors.success[600] }} />
          <span className="font-semibold" style={{ color: colors.success[900] }}>
            {metrics.verificationRate}% Verifierat
          </span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<CheckCircle className="w-6 h-6" />}
          label="Verifierade Källor"
          value={metrics.verified}
          total={metrics.total}
          color={colors.success[600]}
          bgColor={colors.success[50]}
        />
        <MetricCard
          icon={<Clock className="w-6 h-6" />}
          label="Behöver Granskning"
          value={metrics.needsReview}
          total={metrics.total}
          color={colors.warning[600]}
          bgColor={colors.warning[50]}
        />
        <MetricCard
          icon={<AlertTriangle className="w-6 h-6" />}
          label="Utgångna Källor"
          value={metrics.expired}
          total={metrics.total}
          color={colors.error[600]}
          bgColor={colors.error[50]}
        />
        <MetricCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Genomsnittlig Tillförlitlighet"
          value={`${metrics.avgReliability}%`}
          color={colors.primary[600]}
          bgColor={colors.primary[50]}
        />
      </div>

      {/* Alerts Section */}
      {(metrics.expired > 0 || metrics.expiringSoon > 0 || metrics.needsReview > 0) && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold" style={{ color: colors.text.primary }}>
            Varningar
          </h2>
          <div className="space-y-2">
            {metrics.expired > 0 && (
              <Alert
                type="critical"
                icon={<XCircle className="w-5 h-5" />}
                message={`${metrics.expired} källor har passerat utgångsdatum och behöver omedelbar uppdatering`}
              />
            )}
            {metrics.expiringSoon > 0 && (
              <Alert
                type="warning"
                icon={<AlertTriangle className="w-5 h-5" />}
                message={`${metrics.expiringSoon} källor går ut inom 30 dagar`}
              />
            )}
            {metrics.needsReview > 0 && (
              <Alert
                type="info"
                icon={<Info className="w-5 h-5" />}
                message={`${metrics.needsReview} källor väntar på granskning`}
              />
            )}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b" style={{ borderColor: colors.border.light }}>
        <TabButton
          active={selectedTab === 'overview'}
          onClick={() => setSelectedTab('overview')}
          label="Översikt"
        />
        <TabButton
          active={selectedTab === 'sources'}
          onClick={() => setSelectedTab('sources')}
          label="Alla Källor"
        />
        <TabButton
          active={selectedTab === 'alerts'}
          onClick={() => setSelectedTab('alerts')}
          label="Kräver Åtgärd"
        />
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Source Types Distribution */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>
              Källor per Typ
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(sourcesByType).map(([type, count]) => (
                <div
                  key={type}
                  className="p-4 rounded-lg border"
                  style={{
                    borderColor: colors.border.light,
                    background: colors.background.primary,
                  }}
                >
                  <div className="text-2xl font-bold mb-1" style={{ color: colors.primary[600] }}>
                    {count}
                  </div>
                  <div className="text-sm capitalize" style={{ color: colors.text.secondary }}>
                    {type.replace(/-/g, ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Verified */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>
              Nyligen Verifierade (senaste 30 dagarna)
            </h3>
            <div className="space-y-2">
              {recentlyVerified.slice(0, 5).map((source) => (
                <SourceCard key={source.id} source={source} />
              ))}
              {recentlyVerified.length === 0 && (
                <p className="text-sm p-4 text-center" style={{ color: colors.text.tertiary }}>
                  Inga källor verifierade de senaste 30 dagarna
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'sources' && (
        <div className="space-y-2">
          {sources.map((source) => (
            <SourceCard key={source.id} source={source} detailed />
          ))}
        </div>
      )}

      {selectedTab === 'alerts' && (
        <div className="space-y-2">
          {sourcesNeedingReview.length === 0 ? (
            <div className="text-center p-8">
              <CheckCircle
                className="w-16 h-16 mx-auto mb-4"
                style={{ color: colors.success[600] }}
              />
              <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text.primary }}>
                Allt ser bra ut!
              </h3>
              <p style={{ color: colors.text.secondary }}>
                Alla källor är uppdaterade och verifierade
              </p>
            </div>
          ) : (
            sourcesNeedingReview.map((source) => (
              <SourceCard key={source.id} source={source} detailed showAlert />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  total,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  total?: number;
  color: string;
  bgColor: string;
}) {
  return (
    <div
      className="p-6 rounded-xl border"
      style={{
        borderColor: colors.border.light,
        background: colors.background.primary,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg" style={{ background: bgColor }}>
          {React.cloneElement(icon as React.ReactElement, { style: { color } })}
        </div>
        {total && (
          <span className="text-xs" style={{ color: colors.text.tertiary }}>
            av {total}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold mb-1" style={{ color: colors.text.primary }}>
        {value}
      </div>
      <div className="text-sm" style={{ color: colors.text.secondary }}>
        {label}
      </div>
    </div>
  );
}

function Alert({
  type,
  icon,
  message,
}: {
  type: 'critical' | 'warning' | 'info';
  icon: React.ReactNode;
  message: string;
}) {
  const config = {
    critical: {
      bg: colors.error[50],
      border: colors.error[200],
      icon: colors.error[600],
      text: colors.error[900],
    },
    warning: {
      bg: colors.warning[50],
      border: colors.warning[200],
      icon: colors.warning[600],
      text: colors.warning[900],
    },
    info: {
      bg: colors.primary[50],
      border: colors.primary[200],
      icon: colors.primary[600],
      text: colors.primary[900],
    },
  };

  const style = config[type];

  return (
    <div
      className="flex items-center gap-3 p-4 rounded-lg"
      style={{
        background: style.bg,
        border: `2px solid ${style.border}`,
      }}
    >
      {React.cloneElement(icon as React.ReactElement, { style: { color: style.icon } })}
      <span className="text-sm font-medium" style={{ color: style.text }}>
        {message}
      </span>
    </div>
  );
}

function SourceCard({
  source,
  detailed = false,
  showAlert = false,
}: {
  source: SourceReference;
  detailed?: boolean;
  showAlert?: boolean;
}) {
  const statusConfig: Record<VerificationStatus, { color: string; bg: string; label: string }> = {
    verified: {
      color: colors.success[600],
      bg: colors.success[50],
      label: 'Verifierad',
    },
    pending: {
      color: colors.warning[600],
      bg: colors.warning[50],
      label: 'Väntar',
    },
    'needs-review': {
      color: colors.warning[600],
      bg: colors.warning[50],
      label: 'Behöver Granskning',
    },
    outdated: {
      color: colors.error[600],
      bg: colors.error[50],
      label: 'Föråldrad',
    },
    deprecated: {
      color: colors.error[600],
      bg: colors.error[50],
      label: 'Utgången',
    },
  };

  const status = statusConfig[source.verificationStatus];

  const isExpired = source.expirationDate && source.expirationDate < new Date();
  const expiresVerySoon =
    source.expirationDate &&
    (source.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24) <= 30;

  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        borderColor: showAlert && isExpired ? colors.error[300] : colors.border.light,
        background: colors.background.primary,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold truncate" style={{ color: colors.text.primary }}>
              {source.title}
            </h4>
            <span
              className="px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap"
              style={{
                background: status.bg,
                color: status.color,
              }}
            >
              {status.label}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm" style={{ color: colors.text.secondary }}>
            <span>{source.author}</span>
            <span>•</span>
            <span>{source.year}</span>
            {source.edition && (
              <>
                <span>•</span>
                <span>{source.edition} upplaga</span>
              </>
            )}
            <span>•</span>
            <span className="capitalize">{source.type.replace(/-/g, ' ')}</span>
          </div>

          {detailed && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-full bg-gray-200 rounded-full h-2"
                    style={{ width: '100px' }}
                  >
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${source.reliability}%`,
                        background: source.reliability >= 90 ? colors.success[500] : source.reliability >= 70 ? colors.warning[500] : colors.error[500],
                      }}
                    />
                  </div>
                  <span style={{ color: colors.text.secondary }}>
                    {source.reliability}% tillförlitlighet
                  </span>
                </div>
                {source.evidenceLevel && (
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      background: colors.primary[100],
                      color: colors.primary[700],
                    }}
                  >
                    Evidens: {source.evidenceLevel}
                  </span>
                )}
              </div>

              {source.expirationDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" style={{ color: isExpired ? colors.error[600] : expiresVerySoon ? colors.warning[600] : colors.text.tertiary }} />
                  <span style={{ color: isExpired ? colors.error[600] : expiresVerySoon ? colors.warning[600] : colors.text.secondary }}>
                    {isExpired ? 'Utgången: ' : 'Går ut: '}
                    {source.expirationDate.toLocaleDateString('sv-SE')}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs" style={{ color: colors.text.tertiary }}>
                Senast verifierad: {source.lastVerified.toLocaleDateString('sv-SE')}
                {source.verifiedBy && ` av ${source.verifiedBy}`}
              </div>
            </div>
          )}
        </div>

        {showAlert && (isExpired || expiresVerySoon) && (
          <AlertCircle
            className="w-5 h-5 flex-shrink-0"
            style={{ color: isExpired ? colors.error[600] : colors.warning[600] }}
          />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 font-medium transition-colors border-b-2"
      style={{
        borderColor: active ? colors.primary[500] : 'transparent',
        color: active ? colors.primary[600] : colors.text.secondary,
      }}
    >
      {label}
    </button>
  );
}
