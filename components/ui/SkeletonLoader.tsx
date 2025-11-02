'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { colors } from '@/lib/design-tokens';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

export function Skeleton({ width = '100%', height = '20px', borderRadius = '4px', className = '' }: SkeletonProps) {
  return (
    <motion.div
      className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundSize: '200% 100%',
      }}
      animate={{
        backgroundPosition: ['0% 0%', '100% 0%'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton width={40} height={40} borderRadius="50%" />
        <div className="flex-1">
          <Skeleton height={20} width="60%" className="mb-2" />
          <Skeleton height={16} width="40%" />
        </div>
      </div>
      <Skeleton height={16} className="mb-2" />
      <Skeleton height={16} className="mb-2" />
      <Skeleton height={16} width="80%" />
    </div>
  );
}

export function QuestionSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
      {/* Question header */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton width={120} height={24} />
        <Skeleton width={80} height={32} borderRadius={16} />
      </div>

      {/* Question text */}
      <Skeleton height={20} className="mb-3" />
      <Skeleton height={20} className="mb-3" />
      <Skeleton height={20} width="70%" className="mb-6" />

      {/* Answer options */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4">
            <Skeleton height={18} width={`${60 + Math.random() * 30}%`} />
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-6">
        <Skeleton width={120} height={40} borderRadius={8} />
        <Skeleton width={100} height={40} borderRadius={8} />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Header */}
      <div className="mb-8">
        <Skeleton width={200} height={32} className="mb-2" />
        <Skeleton width={300} height={20} />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
            <Skeleton width={80} height={16} className="mb-2" />
            <Skeleton width={60} height={32} />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Messages */}
      <div className="space-y-4 mb-6">
        {/* User message */}
        <div className="flex justify-end">
          <div className="bg-blue-50 rounded-xl p-4 max-w-md">
            <Skeleton height={16} className="mb-2" />
            <Skeleton height={16} width="80%" />
          </div>
        </div>

        {/* AI message */}
        <div className="flex justify-start">
          <div className="bg-white rounded-xl border border-gray-200 p-4 max-w-md">
            <Skeleton height={16} className="mb-2" />
            <Skeleton height={16} className="mb-2" />
            <Skeleton height={16} width="90%" />
          </div>
        </div>
      </div>

      {/* Input area */}
      <Skeleton height={60} borderRadius={12} />
    </div>
  );
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
          <Skeleton width={48} height={48} borderRadius="50%" />
          <div className="flex-1">
            <Skeleton height={18} width="70%" className="mb-2" />
            <Skeleton height={14} width="50%" />
          </div>
          <Skeleton width={80} height={32} borderRadius={8} />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Table header */}
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} height={20} width="80%" />
          ))}
        </div>
      </div>

      {/* Table rows */}
      <div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="border-b border-gray-100 p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} height={16} width={`${60 + Math.random() * 30}%`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <Skeleton width={150} height={24} className="mb-6" />
      <div className="flex items-end justify-between h-64 gap-2">
        {Array.from({ length: 7 }).map((_, i) => {
          const height = 40 + Math.random() * 60;
          return <Skeleton key={i} height={`${height}%`} className="flex-1" />;
        })}
      </div>
      <div className="flex justify-between mt-4">
        {['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'].map((day, i) => (
          <Skeleton key={i} width={30} height={12} />
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
      <div className="flex items-center gap-6 mb-8">
        <Skeleton width={120} height={120} borderRadius="50%" />
        <div className="flex-1">
          <Skeleton width={200} height={28} className="mb-3" />
          <Skeleton width={300} height={20} className="mb-2" />
          <Skeleton width={250} height={16} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
            <Skeleton width={80} height={32} className="mx-auto mb-2" />
            <Skeleton width={60} height={16} className="mx-auto" />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <Skeleton height={20} />
        <Skeleton height={20} />
        <Skeleton height={20} width="80%" />
      </div>
    </div>
  );
}
