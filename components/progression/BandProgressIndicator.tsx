/**
 * Band Progress Indicator Component
 * Shows current difficulty band and streak progress
 */

import type { DifficultyBand } from '@/types/progression'

interface BandProgressIndicatorProps {
  currentBand: DifficultyBand
  streak: number
}

export default function BandProgressIndicator({
  currentBand,
  streak,
}: BandProgressIndicatorProps) {
  return (
    <div className="band-progress-indicator">
      <div className="current-band">
        <span>Band {currentBand}</span>
      </div>
      <div className="streak-info">
        <span>Streak: {streak}</span>
      </div>
    </div>
  )
}
