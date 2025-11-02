import { colors, borderRadius, transitions } from '@/lib/design-tokens';

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({
  width = '100%',
  height = '1rem',
  className = '',
  variant = 'rectangular'
}: SkeletonProps) {
  const variantStyles = {
    text: { borderRadius: borderRadius.base },
    circular: { borderRadius: borderRadius.full },
    rectangular: { borderRadius: borderRadius.lg },
  };

  return (
    <div
      className={`animate-pulse ${className}`}
      style={{
        width,
        height,
        background: `linear-gradient(90deg, ${colors.gray[200]} 25%, ${colors.gray[100]} 50%, ${colors.gray[200]} 75%)`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s infinite',
        ...variantStyles[variant],
      }}
    />
  );
}

// Specific skeleton components for common use cases
export function SkeletonCard() {
  return (
    <div
      className="p-6 rounded-xl border"
      style={{
        borderColor: colors.border.light,
        background: colors.background.primary,
      }}
    >
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" width="48px" height="48px" />
        <div className="flex-1">
          <Skeleton height="20px" width="60%" className="mb-2" />
          <Skeleton height="16px" width="40%" />
        </div>
      </div>
      <Skeleton height="100px" className="mb-4" />
      <div className="space-y-2">
        <Skeleton height="16px" />
        <Skeleton height="16px" width="90%" />
        <Skeleton height="16px" width="80%" />
      </div>
    </div>
  );
}

export function SkeletonQuestion() {
  return (
    <div
      className="p-6 rounded-xl border"
      style={{
        borderColor: colors.border.light,
        background: colors.background.primary,
      }}
    >
      {/* Tags */}
      <div className="flex gap-2 mb-4">
        <Skeleton height="24px" width="80px" />
        <Skeleton height="24px" width="60px" />
      </div>

      {/* Question text */}
      <Skeleton height="24px" className="mb-2" />
      <Skeleton height="24px" width="80%" className="mb-6" />

      {/* Answer options */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height="56px" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border" style={{ borderColor: colors.border.light }}>
          <Skeleton variant="circular" width="40px" height="40px" />
          <div className="flex-1">
            <Skeleton height="18px" width="70%" className="mb-2" />
            <Skeleton height="14px" width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonActivity() {
  return (
    <div
      className="p-6 rounded-xl border"
      style={{
        borderColor: colors.border.light,
        background: colors.background.primary,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width="48px" height="48px" />
          <div>
            <Skeleton height="20px" width="120px" className="mb-2" />
            <Skeleton height="16px" width="80px" />
          </div>
        </div>
        <Skeleton height="36px" width="100px" />
      </div>

      <div className="mb-4">
        <Skeleton height="16px" className="mb-2" />
        <Skeleton height="16px" width="90%" />
      </div>

      <div className="flex items-center gap-4">
        <Skeleton height="12px" width="60px" />
        <Skeleton height="12px" width="80px" />
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-4 rounded-lg border text-center"
          style={{ borderColor: colors.border.light }}
        >
          <Skeleton variant="circular" width="48px" height="48px" className="mx-auto mb-3" />
          <Skeleton height="14px" width="60%" className="mx-auto mb-2" />
          <Skeleton height="24px" width="40%" className="mx-auto" />
        </div>
      ))}
    </div>
  );
}
