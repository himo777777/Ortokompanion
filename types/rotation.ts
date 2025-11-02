/**
 * Rotation Management Types
 *
 * Types for managing ST-läkare rotations and placements
 * Supports rotation timelines with dates, goals, and progress tracking
 */

import { Domain } from './onboarding';

/**
 * Rotation status based on current date
 */
export type RotationStatus = 'completed' | 'current' | 'upcoming';

/**
 * A single rotation period for ST-ortopedi
 */
export interface Rotation {
  /** Unique identifier for this rotation */
  id: string;

  /** The orthopaedic domain/subspecialty for this rotation */
  domain: Domain;

  /** Start date of rotation */
  startDate: Date;

  /** End date of rotation */
  endDate: Date;

  /** Current status (auto-calculated from dates) */
  status: RotationStatus;

  /** Socialstyrelsen goal IDs assigned to this rotation */
  goals: string[];

  /** Progress percentage (0-100) based on completed goals/activities */
  progress: number;

  /** Optional hospital/clinic name */
  hospital?: string;

  /** Optional supervisor name */
  supervisor?: string;

  /** Notes about this rotation */
  notes?: string;
}

/**
 * Complete rotation timeline for a user
 */
export interface RotationTimeline {
  /** All rotations (past, current, future) */
  rotations: Rotation[];

  /** Reference to current rotation (null if no current rotation) */
  currentRotationId?: string;
}

/**
 * Placement for non-ortho ST (allmänmedicin, akutsjukvård)
 * Simpler than full rotation - just a single ortho placement period
 */
export interface OrthoPlacement {
  /** Start date of ortho placement */
  startDate: Date;

  /** End date of ortho placement */
  endDate: Date;

  /** Optional focus domain during placement */
  focusDomain?: Domain;

  /** Status */
  status: RotationStatus;

  /** Goals for this placement */
  goals: string[];

  /** Progress */
  progress: number;

  /** Hospital/clinic */
  hospital?: string;
}

/**
 * Helper function to determine rotation status based on dates
 */
export function getRotationStatus(startDate: Date, endDate: Date): RotationStatus {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    return 'upcoming';
  } else if (now > end) {
    return 'completed';
  } else {
    return 'current';
  }
}

/**
 * Helper function to get current rotation from timeline
 */
export function getCurrentRotation(timeline: RotationTimeline): Rotation | null {
  if (timeline.currentRotationId) {
    return timeline.rotations.find(r => r.id === timeline.currentRotationId) || null;
  }

  // Fallback: find rotation where current date is within range
  const now = new Date();
  return timeline.rotations.find(r => {
    const start = new Date(r.startDate);
    const end = new Date(r.endDate);
    return now >= start && now <= end;
  }) || null;
}

/**
 * Helper function to calculate days remaining in rotation
 */
export function getDaysRemaining(rotation: Rotation | OrthoPlacement): number {
  const now = new Date();
  const end = new Date(rotation.endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Helper function to calculate total duration of rotation in days
 */
export function getRotationDuration(rotation: Rotation): number {
  const start = new Date(rotation.startDate);
  const end = new Date(rotation.endDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Helper function to format rotation date range
 */
export function formatRotationDateRange(startDate: Date, endDate: Date, locale: string = 'sv-SE'): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startMonth = start.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
  const endMonth = end.toLocaleDateString(locale, { month: 'short', year: 'numeric' });

  if (startMonth === endMonth) {
    return startMonth;
  }

  return `${startMonth} - ${endMonth}`;
}
