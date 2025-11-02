'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { colors } from '@/lib/design-tokens';
import { Domain } from '@/types/onboarding';

interface PerformanceTrend {
  date: string;
  accuracy: number;
  questionsAnswered: number;
  xpEarned: number;
}

interface DomainMastery {
  domain: string;
  mastery: number; // 0-100
  questionsCompleted: number;
}

interface StudyTime {
  day: string;
  hour: number;
  sessionsCompleted: number;
  averageAccuracy: number;
}

interface PerformanceChartsProps {
  weeklyTrend?: PerformanceTrend[];
  domainMastery?: DomainMastery[];
  studyPattern?: StudyTime[];
  xpProgress?: {
    current: number;
    target: number;
    milestones: { level: number; xp: number }[];
  };
}

export default function PerformanceCharts({
  weeklyTrend = [],
  domainMastery = [],
  studyPattern = [],
  xpProgress,
}: PerformanceChartsProps) {
  // Generate mock data if not provided
  const mockWeeklyTrend: PerformanceTrend[] = useMemo(() => {
    if (weeklyTrend.length > 0) return weeklyTrend;
    const days = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];
    return days.map((day, i) => ({
      date: day,
      accuracy: 65 + Math.random() * 20,
      questionsAnswered: 5 + Math.floor(Math.random() * 15),
      xpEarned: 20 + Math.floor(Math.random() * 50),
    }));
  }, [weeklyTrend]);

  const mockDomainMastery: DomainMastery[] = useMemo(() => {
    if (domainMastery.length > 0) return domainMastery;
    const domains = ['Trauma', 'Höft', 'Knä', 'Fot', 'Hand', 'Axel'];
    return domains.map((domain) => ({
      domain,
      mastery: 40 + Math.random() * 50,
      questionsCompleted: 10 + Math.floor(Math.random() * 30),
    }));
  }, [domainMastery]);

  return (
    <div className="space-y-8">
      {/* Performance Trend */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>
          Prestationstrend (senaste veckan)
        </h3>
        <div className="bg-white p-6 rounded-xl border" style={{ borderColor: colors.border.light }}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockWeeklyTrend}>
              <defs>
                <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.primary[500]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors.primary[500]} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorXP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.success[500]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors.success[500]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.gray[200]} />
              <XAxis
                dataKey="date"
                stroke={colors.text.secondary}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke={colors.text.secondary}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.background.primary,
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="accuracy"
                stroke={colors.primary[600]}
                fillOpacity={1}
                fill="url(#colorAccuracy)"
                name="Träffsäkerhet (%)"
              />
              <Area
                type="monotone"
                dataKey="xpEarned"
                stroke={colors.success[600]}
                fillOpacity={1}
                fill="url(#colorXP)"
                name="XP tjänat"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Domain Mastery Radar */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>
          Domänbehärskning
        </h3>
        <div className="bg-white p-6 rounded-xl border" style={{ borderColor: colors.border.light }}>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={mockDomainMastery}>
              <PolarGrid stroke={colors.gray[300]} />
              <PolarAngleAxis
                dataKey="domain"
                stroke={colors.text.secondary}
                style={{ fontSize: '12px' }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                stroke={colors.text.tertiary}
                style={{ fontSize: '10px' }}
              />
              <Radar
                name="Behärskning"
                dataKey="mastery"
                stroke={colors.primary[600]}
                fill={colors.primary[500]}
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.background.primary,
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>

          {/* Domain Details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {mockDomainMastery.map((domain) => (
              <div key={domain.domain} className="text-center">
                <div
                  className="text-2xl font-bold mb-1"
                  style={{
                    color: domain.mastery >= 70
                      ? colors.success[600]
                      : domain.mastery >= 50
                      ? colors.warning[600]
                      : colors.error[600],
                  }}
                >
                  {Math.round(domain.mastery)}%
                </div>
                <div className="text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  {domain.domain}
                </div>
                <div className="text-xs" style={{ color: colors.text.tertiary }}>
                  {domain.questionsCompleted} frågor
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* XP Progress */}
      {xpProgress && (
        <div>
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>
            XP Progression
          </h3>
          <div className="bg-white p-6 rounded-xl border" style={{ borderColor: colors.border.light }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold" style={{ color: colors.primary[600] }}>
                  {xpProgress.current} XP
                </div>
                <div className="text-sm" style={{ color: colors.text.secondary }}>
                  av {xpProgress.target} XP till nästa nivå
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: colors.success[600] }}>
                  {Math.round((xpProgress.current / xpProgress.target) * 100)}%
                </div>
                <div className="text-xs" style={{ color: colors.text.tertiary }}>
                  Framsteg
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                style={{
                  width: `${(xpProgress.current / xpProgress.target) * 100}%`,
                  background: `linear-gradient(90deg, ${colors.primary[500]} 0%, ${colors.success[500]} 100%)`,
                }}
              />
              {/* Milestones */}
              {xpProgress.milestones.map((milestone, i) => {
                const position = (milestone.xp / xpProgress.target) * 100;
                return (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 w-0.5 bg-white"
                    style={{ left: `${position}%` }}
                    title={`Level ${milestone.level}`}
                  />
                );
              })}
            </div>

            {/* Milestones Labels */}
            <div className="flex justify-between mt-2">
              {xpProgress.milestones.slice(0, 5).map((milestone, i) => (
                <div key={i} className="text-xs text-center" style={{ color: colors.text.tertiary }}>
                  <div className="font-medium">L{milestone.level}</div>
                  <div>{milestone.xp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Questions Activity */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>
          Aktivitet per dag
        </h3>
        <div className="bg-white p-6 rounded-xl border" style={{ borderColor: colors.border.light }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockWeeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.gray[200]} />
              <XAxis
                dataKey="date"
                stroke={colors.text.secondary}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke={colors.text.secondary}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.background.primary,
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar
                dataKey="questionsAnswered"
                fill={colors.primary[500]}
                radius={[8, 8, 0, 0]}
                name="Frågor besvarade"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
