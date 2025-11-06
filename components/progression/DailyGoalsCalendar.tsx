'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Target, TrendingUp, Flame, CheckCircle2, Award } from 'lucide-react';
import { IntegratedUserProfile } from '@/types/integrated';

interface DayActivity {
  date: Date;
  questionsAnswered: number;
  correctAnswers: number;
  xpEarned: number;
  activitiesCompleted: number;
  goalsProgressed: string[];
  status: 'completed' | 'partial' | 'none';
}

interface DailyGoalsCalendarProps {
  profile: IntegratedUserProfile;
}

export default function DailyGoalsCalendar({ profile }: DailyGoalsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayActivity | null>(null);

  // Swedish month and day names
  const monthNames = [
    'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
    'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
  ];
  const dayNames = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

  // Calculate activity data from profile history
  const activityMap = useMemo(() => {
    const map = new Map<string, DayActivity>();

    // Process session history
    profile.progression.history.sessionHistory.forEach(session => {
      const dateKey = new Date(session.timestamp).toDateString();

      if (!map.has(dateKey)) {
        map.set(dateKey, {
          date: new Date(session.timestamp),
          questionsAnswered: 0,
          correctAnswers: 0,
          xpEarned: 0,
          activitiesCompleted: 0,
          goalsProgressed: [],
          status: 'none'
        });
      }

      const activity = map.get(dateKey)!;
      activity.questionsAnswered += session.questionsAnswered || 0;
      activity.correctAnswers += session.correctAnswers || 0;
      activity.xpEarned += session.xpGained || 0;
      activity.activitiesCompleted += 1;

      // Determine status
      const accuracy = activity.correctAnswers / activity.questionsAnswered;
      if (activity.questionsAnswered >= 10 && accuracy >= 0.7) {
        activity.status = 'completed';
      } else if (activity.questionsAnswered > 0) {
        activity.status = 'partial';
      }
    });

    return map;
  }, [profile]);

  // Calculate current streak
  const currentStreak = useMemo(() => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toDateString();
      const activity = activityMap.get(dateKey);

      if (activity && activity.status === 'completed') {
        streak++;
      } else if (i > 0) {
        // Allow today to not be completed yet
        break;
      }
    }

    return streak;
  }, [activityMap]);

  // Get days in current month
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get day of week (0 = Sunday, adjust to Monday = 0)
    let startDay = firstDay.getDay() - 1;
    if (startDay === -1) startDay = 6; // Sunday becomes 6

    const days: (DayActivity | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add days of month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateKey = date.toDateString();
      const activity = activityMap.get(dateKey) || {
        date,
        questionsAnswered: 0,
        correctAnswers: 0,
        xpEarned: 0,
        activitiesCompleted: 0,
        goalsProgressed: [],
        status: 'none' as const
      };
      days.push(activity);
    }

    return days;
  };

  const days = getDaysInMonth();

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getDayColor = (activity: DayActivity | null) => {
    if (!activity) return 'bg-gray-50';

    switch (activity.status) {
      case 'completed':
        return 'bg-green-100 border-green-300';
      case 'partial':
        return 'bg-yellow-100 border-yellow-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getDayIndicator = (activity: DayActivity | null) => {
    if (!activity || activity.status === 'none') return null;

    switch (activity.status) {
      case 'completed':
        return <CheckCircle2 className="w-3 h-3 text-green-600" />;
      case 'partial':
        return <div className="w-2 h-2 rounded-full bg-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Dagliga Mål</h2>
            <p className="text-sm text-gray-600">Håll din streak levande!</p>
          </div>
        </div>

        {/* Streak indicator */}
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg border border-orange-200">
          <Flame className="w-5 h-5 text-orange-500" />
          <div>
            <p className="text-xs text-orange-600 font-medium">Nuvarande streak</p>
            <p className="text-2xl font-bold text-orange-700">{currentStreak}</p>
          </div>
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h3 className="text-lg font-semibold text-gray-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="mb-4">
        {/* Day names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((activity, index) => (
            <motion.button
              key={index}
              onClick={() => activity && setSelectedDay(activity)}
              disabled={!activity}
              className={`
                aspect-square rounded-lg border-2 p-2 relative
                transition-all duration-200
                ${activity ? 'cursor-pointer hover:scale-105 hover:shadow-md' : 'cursor-default'}
                ${getDayColor(activity)}
                ${isToday(activity?.date || null) ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                ${selectedDay?.date.toDateString() === activity?.date.toDateString() ? 'ring-2 ring-purple-500' : ''}
              `}
              whileHover={activity ? { scale: 1.05 } : {}}
              whileTap={activity ? { scale: 0.95 } : {}}
            >
              {activity && (
                <>
                  <div className="text-sm font-semibold text-gray-800">
                    {activity.date.getDate()}
                  </div>
                  <div className="absolute bottom-1 right-1">
                    {getDayIndicator(activity)}
                  </div>
                  {activity.activitiesCompleted > 0 && (
                    <div className="absolute top-1 right-1 text-xs font-bold text-blue-600">
                      {activity.activitiesCompleted}
                    </div>
                  )}
                </>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 py-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-300"></div>
          <span className="text-xs text-gray-600">Mål uppnådda</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-300"></div>
          <span className="text-xs text-gray-600">Delvis genomfört</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white border-2 border-gray-200"></div>
          <span className="text-xs text-gray-600">Ingen aktivitet</span>
        </div>
      </div>

      {/* Selected day details */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 pt-4 mt-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedDay.date.toLocaleDateString('sv-SE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Stäng
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-blue-700 font-medium">Frågor</span>
                </div>
                <p className="text-2xl font-bold text-blue-800">
                  {selectedDay.questionsAnswered}
                </p>
                <p className="text-xs text-blue-600">
                  {selectedDay.correctAnswers} rätt
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">Noggrannhet</span>
                </div>
                <p className="text-2xl font-bold text-green-800">
                  {selectedDay.questionsAnswered > 0
                    ? Math.round((selectedDay.correctAnswers / selectedDay.questionsAnswered) * 100)
                    : 0}%
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span className="text-xs text-purple-700 font-medium">XP Tjänat</span>
                </div>
                <p className="text-2xl font-bold text-purple-800">
                  {selectedDay.xpEarned}
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-orange-600" />
                  <span className="text-xs text-orange-700 font-medium">Aktiviteter</span>
                </div>
                <p className="text-2xl font-bold text-orange-800">
                  {selectedDay.activitiesCompleted}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
