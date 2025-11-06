'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIntegrated } from '@/context/IntegratedContext';
import {
  ALL_FOCUSED_GOALS,
  getGoalsByProgram,
  type SocialstyrelsensGoal,
} from '@/data/focused-socialstyrelsen-goals';
import { Target, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { IntegratedUserProfile } from '@/types/integrated';
import { getCurrentRotation } from '@/types/rotation';
import { Domain } from '@/types/onboarding';

type ProgramType = 'läkarexamen' | 'bt' | 'at' | 'st';

interface NextGoalFocusProps {
  userProgram?: ProgramType;
  userSpecialty?: string;
  profile?: IntegratedUserProfile;
}

export function NextGoalFocus({
  userProgram = 'bt',
  userSpecialty = 'ortopedi',
  profile: profileProp,
}: NextGoalFocusProps) {
  const { profile: contextProfile } = useIntegrated();
  const profile = profileProp || contextProfile;

  // Get completed goal IDs
  const completedGoalIds = useMemo(() => {
    if (!profile) return new Set<string>();
    return new Set(
      profile.socialstyrelseMålProgress
        .filter((mp) => mp.achieved)
        .map((mp) => mp.goalId)
    );
  }, [profile]);

  // Get weak competency areas
  const weakAreas = useMemo(() => {
    if (!profile) return [];

    // Analyze which competency areas user struggles with
    const areaPerformance: Record<string, { total: number; completed: number }> = {};

    profile.socialstyrelseMålProgress.forEach((mp) => {
      const goal = ALL_FOCUSED_GOALS.find((g) => g.id === mp.goalId);
      if (goal) {
        if (!areaPerformance[goal.competencyArea]) {
          areaPerformance[goal.competencyArea] = { total: 0, completed: 0 };
        }
        areaPerformance[goal.competencyArea].total++;
        if (mp.achieved) {
          areaPerformance[goal.competencyArea].completed++;
        }
      }
    });

    // Return areas with <50% completion
    return Object.entries(areaPerformance)
      .filter(([_, stats]) => stats.completed / stats.total < 0.5)
      .map(([area]) => area);
  }, [profile]);

  // Detect current rotation
  const currentRotation = useMemo(() => {
    if (!profile) return null;

    // For ST-ortopedi with rotation timeline
    if (profile.rotationTimeline) {
      return getCurrentRotation(profile.rotationTimeline);
    }

    // For other specialties with ortho placement
    // Convert OrthoPlacement to a rotation-like structure
    if (profile.orthoPlacement && profile.orthoPlacement.focusDomain) {
      const { focusDomain, startDate, endDate } = profile.orthoPlacement;
      return {
        id: 'ortho-placement',
        domain: focusDomain,
        startDate,
        endDate,
        goals: [],
      };
    }

    return null;
  }, [profile]);

  // Get next recommended goals
  const nextGoals = useMemo(() => {
    // Get all relevant goals for user's program
    const relevantGoals = getGoalsByProgram(userProgram).filter(
      (g) =>
        (g.specialty === userSpecialty || g.specialty === 'allmänmedicin') &&
        !completedGoalIds.has(g.id)
    );

    // Prioritize required goals
    const requiredGoals = relevantGoals.filter((g) => g.required);

    // Helper: Check if goal is relevant to current rotation
    const isRotationRelevant = (goal: SocialstyrelsensGoal): boolean => {
      if (!currentRotation) return false;

      // Map rotation domains to goal categories/competency areas
      const rotationMap: Record<Domain, string[]> = {
        'trauma': ['trauma', 'akutmedicin', 'ortopedi'],
        'höft': ['höftkirurgi', 'ortopedi'],
        'knä': ['knäkirurgi', 'ortopedi'],
        'fot-fotled': ['fot-fotled', 'ortopedi'],
        'hand-handled': ['handkirurgi', 'ortopedi'],
        'axel-armbåge': ['axel-armbåge', 'ortopedi'],
        'rygg': ['ryggkirurgi', 'ortopedi'],
        'sport': ['idrottsmedicin', 'ortopedi'],
        'tumör': ['tumörortopedi', 'onkologi', 'ortopedi'],
      };

      const relevantAreas = rotationMap[currentRotation.domain] || [];
      return (
        relevantAreas.some(area =>
          goal.competencyArea.toLowerCase().includes(area.toLowerCase()) ||
          goal.category.toLowerCase().includes(area.toLowerCase()) ||
          goal.title.toLowerCase().includes(area.toLowerCase())
        )
      );
    };

    // Score goals based on priority
    const scoredGoals = requiredGoals
      .map((goal) => {
        let priority = 10; // Base priority for required goals

        // HIGHEST PRIORITY: Current rotation (+20)
        if (isRotationRelevant(goal)) {
          priority += 20;
        }

        // Boost priority if in weak area (+5)
        if (weakAreas.includes(goal.competencyArea)) {
          priority += 5;
        }

        // Boost priority for goals user has started (+3)
        const progress = profile?.socialstyrelseMålProgress.find(
          (mp) => mp.goalId === goal.id
        );
        if (progress && progress.completedCriteria.length > 0) {
          priority += 3; // Finish what you started!
        }

        return { goal, priority, isRotationRelevant: isRotationRelevant(goal) };
      })
      .sort((a, b) => b.priority - a.priority);

    return scoredGoals.slice(0, 3).map((sg) => ({ goal: sg.goal, isRotationRelevant: sg.isRotationRelevant }));
  }, [userProgram, userSpecialty, completedGoalIds, weakAreas, profile, currentRotation]);

  // Get progress for next goal
  const nextGoalProgress = useMemo(() => {
    if (nextGoals.length === 0 || !profile) return null;

    const nextGoal = nextGoals[0].goal;
    const progress = profile.socialstyrelseMålProgress.find(
      (mp) => mp.goalId === nextGoal.id
    );

    if (!progress) {
      return {
        completedCriteria: 0,
        totalCriteria: nextGoal.assessmentCriteria.length,
        percentage: 0,
      };
    }

    return {
      completedCriteria: progress.completedCriteria.length,
      totalCriteria: progress.totalCriteria,
      percentage: (progress.completedCriteria.length / progress.totalCriteria) * 100,
    };
  }, [nextGoals, profile]);

  if (nextGoals.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-green-50 border border-green-200 rounded-xl p-6"
      >
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </motion.div>
          <div>
            <h3 className="font-bold text-green-900">Grattis!</h3>
            <p className="text-sm text-green-700">
              Du har slutfört alla obligatoriska mål för {userProgram.toUpperCase()}!
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const nextGoalData = nextGoals[0];
  const nextGoal = nextGoalData.goal;
  const estimatedTime = nextGoal.minimumCases || nextGoal.minimumProcedures || 10;

  // Helper to get domain name in Swedish
  const getDomainName = (domain: Domain): string => {
    const names: Record<Domain, string> = {
      'trauma': 'Traumaortopedi',
      'höft': 'Höftkirurgi',
      'knä': 'Knäkirurgi',
      'fot-fotled': 'Fot & Fotled',
      'hand-handled': 'Hand & Handled',
      'axel-armbåge': 'Axel & Armbåge',
      'rygg': 'Ryggkirurgi',
      'sport': 'Idrottsmedicin',
      'tumör': 'Tumörortopedi',
    };
    return names[domain] || domain;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-md"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-600 uppercase tracking-wide">
              Nästa mål att fokusera på
            </h3>
            <h2 className="text-xl font-bold text-gray-900 mt-1">
              {nextGoal.title}
            </h2>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {nextGoalData.isRotationRelevant && currentRotation && (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
              <span>🎯</span>
              <span>Nuvarande rotation: {getDomainName(currentRotation.domain)}</span>
            </span>
          )}
          {nextGoal.required && (
            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
              Obligatoriskt
            </span>
          )}
        </div>
      </div>

      <p className="text-gray-700 mb-4">{nextGoal.description}</p>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Kategori</span>
          </div>
          <p className="font-semibold text-gray-900 text-sm">{nextGoal.category}</p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
            <Target className="w-4 h-4" />
            <span>Kompetens</span>
          </div>
          <p className="font-semibold text-gray-900 text-sm capitalize">
            {nextGoal.competencyArea.replace('-', ' ')}
          </p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
            <Clock className="w-4 h-4" />
            <span>Uppskattat</span>
          </div>
          <p className="font-semibold text-gray-900 text-sm">
            {estimatedTime} {nextGoal.minimumCases ? 'fall' : 'procedurer'}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {nextGoalProgress && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Din progression</span>
            <span className="text-gray-600">
              {nextGoalProgress.completedCriteria} / {nextGoalProgress.totalCriteria}{' '}
              kriterier ({nextGoalProgress.percentage.toFixed(0)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${nextGoalProgress.percentage}%` }}
              transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
              className="bg-blue-600 h-3 rounded-full"
            />
          </div>
        </motion.div>
      )}

      {/* Assessment criteria preview */}
      <details className="mb-4">
        <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
          Bedömningskriterier ({nextGoal.assessmentCriteria.length})
        </summary>
        <ul className="mt-2 space-y-1">
          {nextGoal.assessmentCriteria.slice(0, 3).map((criterion, idx) => {
            const isCompleted = nextGoalProgress
              ? nextGoalProgress.completedCriteria > idx
              : false;
            return (
              <li
                key={idx}
                className="text-sm text-gray-600 flex items-start gap-2"
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full mt-0.5 flex-shrink-0" />
                )}
                <span className={isCompleted ? 'line-through' : ''}>
                  {criterion}
                </span>
              </li>
            );
          })}
          {nextGoal.assessmentCriteria.length > 3 && (
            <li className="text-sm text-gray-500 italic ml-6">
              +{nextGoal.assessmentCriteria.length - 3} fler kriterier...
            </li>
          )}
        </ul>
      </details>

      {/* Next goals preview */}
      {nextGoals.length > 1 && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-xs font-medium text-gray-600 mb-2">
            Nästa i kön:
          </p>
          <div className="space-y-2">
            {nextGoals.slice(1, 3).map((goalData, idx) => (
              <div key={goalData.goal.id} className="flex items-center gap-2 text-sm">
                <span className="w-5 h-5 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-semibold">
                  {idx + 2}
                </span>
                <span className="text-gray-700">{goalData.goal.title}</span>
                {goalData.isRotationRelevant && (
                  <span className="text-xs text-green-600">🎯</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
