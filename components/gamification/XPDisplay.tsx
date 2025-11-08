/**
 * XP Display Component
 * Shows user's XP and level in gamification UI
 */

interface XPDisplayProps {
  xp: number
  level: number
}

export default function XPDisplay({ xp, level }: XPDisplayProps) {
  return (
    <div className="xp-display" data-testid="xp-display">
      <div className="xp-amount" data-testid="xp-amount">
        <span aria-label="XP Amount">XP: {xp}</span>
      </div>
      <div className="level-display" data-testid="level-display">
        <span aria-label="Level">Level: {level}</span>
      </div>
    </div>
  )
}
