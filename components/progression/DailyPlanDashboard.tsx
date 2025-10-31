'use client';

import { useState } from 'react';
import { DailyMix, DifficultyBand, UserProgressionState, DomainStatus } from '@/types/progression';
import { BAND_DEFINITIONS } from '@/lib/band-system';
import { DOMAIN_LABELS } from '@/types/onboarding';
import {
  Target,
  Zap,
  Repeat,
  Clock,
  TrendingUp,
  Award,
  Lock,
  CheckCircle2,
  ChevronRight,
  Info,
  Flame,
  Shield,
} from 'lucide-react';

interface DailyPlanDashboardProps {
  progressionState: UserProgressionState;
  onStartActivity: (activityId: string, type: 'new' | 'interleave' | 'srs') => void;
  onRequestRecovery?: () => void;
}

export default function DailyPlanDashboard({
  progressionState,
  onStartActivity,
  onRequestRecovery,
}: DailyPlanDashboardProps) {
  const { bandStatus, dailyMix, primaryDomain, domains } = progressionState;
  const [showBandInfo, setShowBandInfo] = useState(false);

  if (!dailyMix) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ingen plan tillgänglig</h2>
          <p className="text-gray-600">Din dagliga plan genereras automatiskt</p>
        </div>
      </div>
    );
  }

  const currentBand = bandStatus.currentBand;
  const bandDef = BAND_DEFINITIONS[currentBand];
  const primaryDomainStatus = domains[primaryDomain];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with Band Info */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dagens Plan</h1>
            <p className="text-blue-100">
              {new Date().toLocaleDateString('sv-SE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Band Chip */}
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => setShowBandInfo(!showBandInfo)}
              className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all"
            >
              <Shield className="w-5 h-5" />
              <span className="font-bold text-xl">Band {currentBand}</span>
              <Info className="w-4 h-4" />
            </button>
            {bandStatus.streakAtBand > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <Flame className="w-4 h-4 text-orange-300" />
                <span className="text-blue-100">{bandStatus.streakAtBand} dagar på band {currentBand}</span>
              </div>
            )}
          </div>
        </div>

        {/* Recovery Day Banner */}
        {dailyMix.isRecoveryDay && (
          <div className="bg-orange-500 bg-opacity-90 rounded-lg p-4 mb-4">
            <p className="font-medium">
              🛟 Recovery Day: Vi tar det lugnare idag. Fokus på repetition och självförtroende.
            </p>
          </div>
        )}

        {/* Band Description */}
        {showBandInfo && (
          <div className="bg-white bg-opacity-10 rounded-lg p-4 mt-4">
            <h3 className="font-semibold mb-2">{bandDef.label}</h3>
            <p className="text-sm text-blue-100 mb-3">{bandDef.description}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-blue-200">Beslutspunkter:</span>{' '}
                <span className="font-medium">{bandDef.decisionPoints}</span>
              </div>
              <div>
                <span className="text-blue-200">Hints:</span>{' '}
                <span className="font-medium">{bandDef.hints}</span>
              </div>
              <div>
                <span className="text-blue-200">Fallgropar:</span>{' '}
                <span className="font-medium">{bandDef.pitfalls}</span>
              </div>
              <div>
                <span className="text-blue-200">Tidsbegränsning:</span>{' '}
                <span className="font-medium">{bandDef.timeConstraint}</span>
              </div>
            </div>
          </div>
        )}

        {/* Encouragement Text */}
        {!dailyMix.isRecoveryDay && !dailyMix.isDifficultFollowUp && (
          <p className="text-blue-100 mt-4">
            {bandStatus.recentPerformance.correctRate >= 0.8
              ? '✨ Du presterar utmärkt! Fortsätt så här.'
              : '💪 Du gör framsteg. Varje övning räknas!'}
          </p>
        )}

        {dailyMix.isDifficultFollowUp && (
          <p className="text-blue-100 mt-4">
            🌟 Vi höjer svårigheten lite idag – du har levererat bra!
          </p>
        )}
      </div>

      {/* Primary Domain Progress */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Primär domän: {DOMAIN_LABELS[primaryDomain]}
          </h2>
          <div className="text-right">
            <div className="text-sm text-gray-600">Progress</div>
            <div className="text-2xl font-bold text-blue-600">
              {primaryDomainStatus.totalItems > 0
                ? Math.round((primaryDomainStatus.itemsCompleted / primaryDomainStatus.totalItems) * 100)
                : 0}
              %
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
            style={{
              width: `${
                primaryDomainStatus.totalItems > 0
                  ? (primaryDomainStatus.itemsCompleted / primaryDomainStatus.totalItems) * 100
                  : 0
              }%`,
            }}
          />
        </div>

        {/* Gate Progress */}
        <div className="grid grid-cols-4 gap-3">
          <GateProgressItem
            icon={<Award className="w-5 h-5" />}
            label="Mini-OSCE"
            completed={primaryDomainStatus.gateProgress.miniOSCEPassed}
          />
          <GateProgressItem
            icon={<Repeat className="w-5 h-5" />}
            label="Retention"
            completed={primaryDomainStatus.gateProgress.retentionCheckPassed}
          />
          <GateProgressItem
            icon={<TrendingUp className="w-5 h-5" />}
            label="SRS Stabilitet"
            completed={primaryDomainStatus.gateProgress.srsCardsStable}
          />
          <GateProgressItem
            icon={<Shield className="w-5 h-5" />}
            label="Komplikation"
            completed={primaryDomainStatus.gateProgress.complicationCasePassed}
          />
        </div>
      </div>

      {/* Daily Mix Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New Content (60%) */}
        <ActivityCard
          title="Nytt innehåll"
          subtitle={DOMAIN_LABELS[dailyMix.newContent.domain]}
          icon={<Target className="w-6 h-6" />}
          percentage={60}
          estimatedTime={dailyMix.newContent.estimatedTime}
          itemCount={dailyMix.newContent.items.length}
          color="blue"
          onStart={() =>
            dailyMix.newContent.items[0] && onStartActivity(dailyMix.newContent.items[0], 'new')
          }
        />

        {/* Interleaving (20%) */}
        <ActivityCard
          title="Interleaving"
          subtitle={DOMAIN_LABELS[dailyMix.interleavingContent.domain]}
          icon={<Repeat className="w-6 h-6" />}
          percentage={20}
          estimatedTime={dailyMix.interleavingContent.estimatedTime}
          itemCount={dailyMix.interleavingContent.items.length}
          color="purple"
          onStart={() =>
            dailyMix.interleavingContent.items[0] &&
            onStartActivity(dailyMix.interleavingContent.items[0], 'interleave')
          }
        />

        {/* SRS Reviews (20%) */}
        <ActivityCard
          title="Repetition (SRS)"
          subtitle={`${dailyMix.srsReviews.cards.length} kort att repetera`}
          icon={<Zap className="w-6 h-6" />}
          percentage={20}
          estimatedTime={dailyMix.srsReviews.estimatedTime}
          itemCount={dailyMix.srsReviews.cards.length}
          color="green"
          onStart={() =>
            dailyMix.srsReviews.cards[0] &&
            onStartActivity(dailyMix.srsReviews.cards[0].id, 'srs')
          }
          urgent={dailyMix.srsReviews.cards.some(
            (card) => card.dueDate < new Date()
          )}
        />
      </div>

      {/* Recovery Button */}
      {onRequestRecovery && !dailyMix.isRecoveryDay && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-orange-900 mb-2">Behöver du en lättare dag?</h3>
              <p className="text-sm text-orange-800">
                Om du har haft jour eller känner dig pressad kan du aktivera recovery-läge.
                Vi sänker svårigheten och ger mer stöd.
              </p>
            </div>
            <button
              onClick={onRequestRecovery}
              className="ml-4 px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap"
            >
              Aktivera Recovery
            </button>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total tid idag"
          value={`${dailyMix.totalEstimatedTime} min`}
          icon={<Clock className="w-5 h-5 text-blue-500" />}
        />
        <StatCard
          label="Band"
          value={`${currentBand} (${bandDef.label})`}
          icon={<Shield className="w-5 h-5 text-purple-500" />}
        />
        <StatCard
          label="Prestanda"
          value={`${Math.round(bandStatus.recentPerformance.correctRate * 100)}%`}
          icon={<TrendingUp className="w-5 h-5 text-green-500" />}
        />
        <StatCard
          label="Hint-användning"
          value={bandStatus.recentPerformance.hintUsage.toFixed(1)}
          icon={<Info className="w-5 h-5 text-orange-500" />}
        />
      </div>
    </div>
  );
}

// Helper Components

function GateProgressItem({
  icon,
  label,
  completed,
}: {
  icon: React.ReactNode;
  label: string;
  completed: boolean;
}) {
  return (
    <div
      className={`p-3 rounded-lg border-2 transition-all ${
        completed ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {completed ? (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        ) : (
          <div className={`${completed ? 'text-green-600' : 'text-gray-400'}`}>{icon}</div>
        )}
      </div>
      <div className={`text-xs font-medium ${completed ? 'text-green-900' : 'text-gray-600'}`}>
        {label}
      </div>
    </div>
  );
}

function ActivityCard({
  title,
  subtitle,
  icon,
  percentage,
  estimatedTime,
  itemCount,
  color,
  onStart,
  urgent = false,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  percentage: number;
  estimatedTime: number;
  itemCount: number;
  color: 'blue' | 'purple' | 'green';
  onStart: () => void;
  urgent?: boolean;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 bg-gradient-to-br ${colorClasses[color]} text-white rounded-lg`}>
          {icon}
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-800">{percentage}%</div>
          <div className="text-xs text-gray-500">av dagens plan</div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{subtitle}</p>

      {urgent && (
        <div className="mb-4 px-3 py-2 bg-red-100 border border-red-300 rounded-lg">
          <p className="text-xs font-medium text-red-800 flex items-center gap-1">
            <Flame className="w-4 h-4" />
            Försenade kort - repetera idag!
          </p>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{Math.round(estimatedTime)} min</span>
        </div>
        <div>
          {itemCount} {itemCount === 1 ? 'övning' : 'övningar'}
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={itemCount === 0}
        className={`mt-auto w-full bg-gradient-to-r ${colorClasses[color]} text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        Starta
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <div className="text-xl font-bold text-gray-800">{value}</div>
    </div>
  );
}
