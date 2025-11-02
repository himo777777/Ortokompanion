'use client';

/**
 * RotationDashboard Component
 * Displays current rotation/placement progress with urgency indicators
 * For ST-läkare, Students, AT-läkare, and ST-other specialties
 */

import { UserProfile } from '@/types/onboarding';
import { Rotation, OrthoPlacement, getCurrentRotation, getDaysRemaining } from '@/types/rotation';
import {
  RotationActivityLog,
  calculateRotationProgress,
  predictRotationCompletion,
  RotationProgress
} from '@/lib/rotation-tracker';
import { SocialstyrelseMål, getAllMål } from '@/data/socialstyrelsen-goals';
import { DOMAIN_LABELS } from '@/types/onboarding';
import { Calendar, Clock, Target, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RotationDashboardProps {
  profile: UserProfile;
  activityLog?: RotationActivityLog[];
}

export default function RotationDashboard({ profile, activityLog = [] }: RotationDashboardProps) {
  // Determine what to display based on user type
  const isSTOrtho = profile.role.match(/^st[1-5]$/);
  const hasOrthoPlacement = profile.orthoPlacement;
  const hasRotationTimeline = profile.rotationTimeline;

  // ST-Ortopedi with rotations
  if (isSTOrtho && hasRotationTimeline && profile.rotationTimeline) {
    const currentRotation = getCurrentRotation(profile.rotationTimeline);

    if (!currentRotation) {
      return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600">Ingen aktiv rotation just nu</p>
        </div>
      );
    }

    return <RotationProgressCard rotation={currentRotation} activityLog={activityLog} />;
  }

  // Student/AT/ST-other with placement
  if (hasOrthoPlacement) {
    return <PlacementProgressCard placement={profile.orthoPlacement!} activityLog={activityLog} />;
  }

  // No rotation or placement
  return null;
}

/**
 * Rotation Progress Card for ST-Ortopedi
 */
function RotationProgressCard({
  rotation,
  activityLog
}: {
  rotation: Rotation;
  activityLog: RotationActivityLog[]
}) {
  const daysRemaining = getDaysRemaining(rotation);
  const progress = calculateRotationProgress(rotation, activityLog);
  const prediction = predictRotationCompletion(rotation, progress);

  // Urgency level based on days remaining
  const urgency = daysRemaining < 7 ? 'critical' : daysRemaining < 30 ? 'high' : daysRemaining < 60 ? 'medium' : 'low';

  const urgencyColors = {
    critical: 'border-red-500 bg-red-50',
    high: 'border-orange-500 bg-orange-50',
    medium: 'border-yellow-500 bg-yellow-50',
    low: 'border-green-500 bg-green-50',
  };

  const urgencyTextColors = {
    critical: 'text-red-700',
    high: 'text-orange-700',
    medium: 'text-yellow-700',
    low: 'text-green-700',
  };

  const allGoals = getAllMål();
  const rotationGoals = allGoals.filter(g => rotation.goals.includes(g.id));

  return (
    <div className={`rounded-lg border-2 p-6 ${urgencyColors[urgency]}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {DOMAIN_LABELS[rotation.domain]}-rotation
          </h3>
          {rotation.hospital && (
            <p className="text-sm text-gray-600 mt-1">{rotation.hospital}</p>
          )}
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${urgencyTextColors[urgency]} bg-white`}>
          {urgency === 'critical' && <AlertCircle className="w-4 h-4" />}
          <span className="font-semibold text-sm">
            {daysRemaining > 0 ? `${daysRemaining} dagar kvar` : 'Slutförd'}
          </span>
        </div>
      </div>

      {/* Date Range */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <Calendar className="w-4 h-4" />
        <span>
          {rotation.startDate.toLocaleDateString('sv-SE', { month: 'short', year: 'numeric' })} - {rotation.endDate.toLocaleDateString('sv-SE', { month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Mål klara"
          value={`${progress.goalsCompleted.length}/${progress.totalGoals}`}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Träffsäkerhet"
          value={`${Math.round(progress.accuracy)}%`}
          color={progress.accuracy >= 70 ? 'green' : 'orange'}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Frågor besvarade"
          value={progress.questionsAnswered.toString()}
          color="purple"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Dagligt mål"
          value={`${prediction.requiredDailyActivities}/dag`}
          color={prediction.willComplete ? 'green' : 'red'}
        />
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">Total framsteg</span>
          <span className={`font-semibold ${progress.onTrack ? 'text-green-600' : 'text-orange-600'}`}>
            {Math.round(progress.completionPercentage)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${progress.onTrack ? 'bg-green-500' : 'bg-orange-500'}`}
            style={{ width: `${Math.min(progress.completionPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Recommendation */}
      <div className={`rounded-lg p-4 ${urgency === 'critical' ? 'bg-red-100' : urgency === 'high' ? 'bg-orange-100' : 'bg-blue-50'}`}>
        <p className={`text-sm font-medium ${urgency === 'critical' ? 'text-red-900' : urgency === 'high' ? 'text-orange-900' : 'text-blue-900'}`}>
          {progress.recommendation}
        </p>
      </div>

      {/* Goals List (collapsed by default) */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
          Visa alla mål ({rotationGoals.length})
        </summary>
        <div className="mt-3 space-y-2">
          {rotationGoals.map(goal => {
            const isCompleted = progress.goalsCompleted.includes(goal.id);
            return (
              <div
                key={goal.id}
                className={`flex items-start gap-2 p-2 rounded ${isCompleted ? 'bg-green-50' : 'bg-gray-50'}`}
              >
                <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isCompleted ? 'text-green-600' : 'text-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isCompleted ? 'text-green-900' : 'text-gray-700'}`}>
                    {goal.title}
                  </p>
                  {goal.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{goal.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </details>
    </div>
  );
}

/**
 * Placement Progress Card for Student/AT/ST-other
 */
function PlacementProgressCard({
  placement,
  activityLog
}: {
  placement: OrthoPlacement;
  activityLog: RotationActivityLog[]
}) {
  // Calculate days remaining for placement
  const now = new Date();
  const end = new Date(placement.endDate);
  const diffTime = end.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Calculate progress (similar to rotation but for placement)
  const placementActivities = activityLog.filter(a =>
    a.timestamp >= placement.startDate && a.timestamp <= placement.endDate
  );

  const questionsAnswered = placementActivities.length;
  const correctAnswers = placementActivities.filter(a => a.correct).length;
  const accuracy = questionsAnswered > 0 ? (correctAnswers / questionsAnswered) * 100 : 0;

  const allGoals = getAllMål();
  const placementGoals = allGoals.filter(g => placement.goals.includes(g.id));

  // Goal completion: ≥3 correct answers per goal
  const goalsCompleted = placement.goals.filter(goalId => {
    const goalActivities = placementActivities.filter(a => a.goalIds?.includes(goalId));
    if (goalActivities.length < 3) return false;
    const goalCorrect = goalActivities.filter(a => a.correct).length;
    return (goalCorrect / goalActivities.length) >= 0.7;
  });

  const completionPercentage = (goalsCompleted.length / placement.goals.length) * 100;

  const urgency = daysRemaining < 14 ? 'critical' : daysRemaining < 30 ? 'high' : 'low';

  const urgencyColors = {
    critical: 'border-red-500 bg-red-50',
    high: 'border-orange-500 bg-orange-50',
    low: 'border-green-500 bg-green-50',
  };

  return (
    <div className={`rounded-lg border-2 p-6 ${urgencyColors[urgency]}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Ortopedi-placering</h3>
          {placement.focusDomain && (
            <p className="text-sm text-gray-600 mt-1">Fokus: {DOMAIN_LABELS[placement.focusDomain]}</p>
          )}
          {placement.hospital && (
            <p className="text-sm text-gray-500">{placement.hospital}</p>
          )}
        </div>
        <div className={`px-3 py-1 rounded-full ${urgency === 'critical' ? 'bg-red-100 text-red-700' : urgency === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
          <span className="font-semibold text-sm">{daysRemaining} dagar kvar</span>
        </div>
      </div>

      {/* Date Range */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <Calendar className="w-4 h-4" />
        <span>
          {placement.startDate.toLocaleDateString('sv-SE')} - {placement.endDate.toLocaleDateString('sv-SE')}
        </span>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Mål klara"
          value={`${goalsCompleted.length}/${placement.goals.length}`}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Träffsäkerhet"
          value={`${Math.round(accuracy)}%`}
          color={accuracy >= 70 ? 'green' : 'orange'}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Frågor"
          value={questionsAnswered.toString()}
          color="purple"
        />
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">Framsteg mot Socialstyrelsen-mål</span>
          <span className="font-semibold text-green-600">{Math.round(completionPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-green-500 transition-all"
            style={{ width: `${Math.min(completionPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Goals List */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
          Visa alla mål ({placementGoals.length})
        </summary>
        <div className="mt-3 space-y-2">
          {placementGoals.map(goal => {
            const isCompleted = goalsCompleted.includes(goal.id);
            return (
              <div
                key={goal.id}
                className={`flex items-start gap-2 p-2 rounded ${isCompleted ? 'bg-green-50' : 'bg-gray-50'}`}
              >
                <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isCompleted ? 'text-green-600' : 'text-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isCompleted ? 'text-green-900' : 'text-gray-700'}`}>
                    {goal.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </details>
    </div>
  );
}

/**
 * Reusable Stat Card
 */
function StatCard({
  icon,
  label,
  value,
  color
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    orange: 'bg-orange-50 text-orange-700',
    purple: 'bg-purple-50 text-purple-700',
    red: 'bg-red-50 text-red-700',
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className={`inline-flex p-2 rounded-lg mb-2 ${colorClasses[color]}`}>
        {icon}
      </div>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}
