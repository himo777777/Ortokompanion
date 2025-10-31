'use client';

import { useState } from 'react';
import { SevenDayPlan, PlanItem, DayPlan } from '@/types/onboarding';
import {
  CheckCircle2, Circle, Clock, Award, Flame, TrendingUp,
  FileText, HelpCircle, Lightbulb, GitBranch, Image, BookOpen
} from 'lucide-react';

interface DayPlanViewProps {
  plan: SevenDayPlan;
  profile: any;
  onCompleteItem: (dayIndex: number, itemId: string) => void;
  onUpdateProfile: (updates: any) => void;
}

export default function DayPlanView({ plan, profile, onCompleteItem, onUpdateProfile }: DayPlanViewProps) {
  const [selectedDay, setSelectedDay] = useState(0);
  const currentDay = plan.days[selectedDay];

  const getItemIcon = (type: string) => {
    const icons: Record<string, any> = {
      'microcase': FileText,
      'quiz': HelpCircle,
      'pearl': Lightbulb,
      'beslutstraad': GitBranch,
      'rontgen': Image,
      'evidens': BookOpen,
      'nextday-check': TrendingUp,
    };
    const Icon = icons[type] || Circle;
    return <Icon className="w-5 h-5" />;
  };

  const getTotalXP = () => {
    return plan.days.reduce((total, day) => {
      return total + day.items.reduce((sum, item) => item.completed ? item.xpReward : 0, 0);
    }, 0);
  };

  const getCompletedDays = () => {
    return plan.days.filter(day => day.completed).length;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total XP</p>
              <p className="text-2xl font-bold text-gray-800">{getTotalXP()}</p>
            </div>
            <Award className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Slutförda dagar</p>
              <p className="text-2xl font-bold text-gray-800">{getCompletedDays()}/7</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Streak</p>
              <p className="text-2xl font-bold text-gray-800">{profile?.gamification?.streak || 0}</p>
            </div>
            <Flame className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Nivå</p>
              <p className="text-2xl font-bold text-gray-800">{profile?.gamification?.level || 1}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Day Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">7-dagars plan</h2>
            <div className="space-y-2">
              {plan.days.map((day, index) => {
                const completedItems = day.items.filter(i => i.completed).length;
                const totalItems = day.items.length;
                const progress = (completedItems / totalItems) * 100;

                return (
                  <button
                    key={day.day}
                    onClick={() => setSelectedDay(index)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      selectedDay === index
                        ? 'border-blue-500 bg-blue-50'
                        : day.completed
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800">Dag {day.day}</span>
                      {day.completed && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          day.completed ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {completedItems}/{totalItems} uppgifter
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Badges */}
            {profile?.gamification?.badges && profile.gamification.badges.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Dina badges</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.gamification.badges.map((badgeId: string) => (
                    <div
                      key={badgeId}
                      className="px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-full text-sm"
                      title={badgeId}
                    >
                      🏅 {badgeId}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Day Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold mb-2">Dag {currentDay.day}</h2>
              <p className="text-blue-100">
                {currentDay.date.toLocaleDateString('sv-SE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {currentDay.items.map((item) => (
                <PlanItemCard
                  key={item.id}
                  item={item}
                  onComplete={() => onCompleteItem(selectedDay, item.id)}
                  getItemIcon={getItemIcon}
                />
              ))}

              {currentDay.items.every(i => i.completed) && !currentDay.completed && (
                <div className="mt-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                    <div>
                      <h3 className="font-semibold text-green-800">Grattis! Dag {currentDay.day} klar!</h3>
                      <p className="text-sm text-green-700">
                        Du har tjänat {currentDay.items.reduce((sum, i) => sum + i.xpReward, 0)} XP
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanItemCard({ item, onComplete, getItemIcon }: any) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`border-2 rounded-lg transition-all ${
        item.completed
          ? 'border-green-300 bg-green-50'
          : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <button
            onClick={onComplete}
            className={`flex-shrink-0 mt-1 ${
              item.completed ? 'text-green-500' : 'text-gray-400 hover:text-blue-500'
            }`}
            disabled={item.completed}
          >
            {item.completed ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <Circle className="w-6 h-6" />
            )}
          </button>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className={`font-semibold text-gray-800 ${item.completed ? 'line-through' : ''}`}>
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {item.estimatedMinutes} min
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-yellow-500" />
                  {item.xpReward} XP
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                {getItemIcon(item.type)}
                <span className="capitalize">{item.type}</span>
              </div>

              {!item.completed && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  {expanded ? 'Dölj' : 'Starta'}
                </button>
              )}
            </div>

            {expanded && !item.completed && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <ItemContent item={item} onComplete={onComplete} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemContent({ item, onComplete }: any) {
  // Detta är en placeholder - i produktion skulle detta vara riktig interaktivt innehåll
  return (
    <div>
      <h4 className="font-semibold text-gray-800 mb-3">{item.title}</h4>

      {item.type === 'microcase' && (
        <div className="space-y-3">
          <p className="text-gray-700">
            <strong>Scenario:</strong> Här skulle det finnas ett detaljerat kliniskt case med
            patientinformation, symtom och frågeställningar.
          </p>
          <div className="bg-white p-3 rounded border border-gray-200">
            <p className="text-sm text-gray-600">
              💡 Tips: Tänk igenom ABCDE, neurovaskulär status och initial handläggning
            </p>
          </div>
        </div>
      )}

      {item.type === 'quiz' && (
        <div className="space-y-3">
          <p className="text-gray-700">Här skulle det finnas quiz-frågor med alternativ.</p>
        </div>
      )}

      {item.type === 'pearl' && (
        <div className="space-y-3">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-gray-800">{item.description}</p>
          </div>
        </div>
      )}

      {item.type === 'nextday-check' && (
        <NextDayCheckForm onComplete={onComplete} />
      )}

      <button
        onClick={onComplete}
        className="mt-4 w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
      >
        Markera som klar
      </button>
    </div>
  );
}

function NextDayCheckForm({ onComplete }: any) {
  const [answers, setAnswers] = useState({
    useful: null as boolean | null,
    level: null as string | null,
    keepPlan: null as boolean | null,
  });

  const canSubmit = answers.useful !== null && answers.level !== null && answers.keepPlan !== null;

  const handleSubmit = () => {
    if (canSubmit) {
      // Spara svar
      const checks = JSON.parse(localStorage.getItem('ortokompanion_nextday_checks') || '[]');
      checks.push({
        date: new Date().toISOString(),
        ...answers,
      });
      localStorage.setItem('ortokompanion_nextday_checks', JSON.stringify(checks));
      onComplete();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="font-medium text-gray-800 mb-2">
          1. Fick du nytta av gårdagens innehåll under jour/mottagning?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setAnswers({ ...answers, useful: true })}
            className={`flex-1 py-2 px-4 rounded border-2 ${
              answers.useful === true
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300'
            }`}
          >
            Ja
          </button>
          <button
            onClick={() => setAnswers({ ...answers, useful: false })}
            className={`flex-1 py-2 px-4 rounded border-2 ${
              answers.useful === false
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-red-300'
            }`}
          >
            Nej
          </button>
        </div>
      </div>

      <div>
        <p className="font-medium text-gray-800 mb-2">2. Var nivån lagom?</p>
        <div className="flex gap-2">
          {['lägre', 'lagom', 'högre'].map((level) => (
            <button
              key={level}
              onClick={() => setAnswers({ ...answers, level })}
              className={`flex-1 py-2 px-4 rounded border-2 ${
                answers.level === level
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="font-medium text-gray-800 mb-2">
          3. Vill du hålla samma plan för imorgon?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setAnswers({ ...answers, keepPlan: true })}
            className={`flex-1 py-2 px-4 rounded border-2 ${
              answers.keepPlan === true
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300'
            }`}
          >
            Ja
          </button>
          <button
            onClick={() => setAnswers({ ...answers, keepPlan: false })}
            className={`flex-1 py-2 px-4 rounded border-2 ${
              answers.keepPlan === false
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-orange-300'
            }`}
          >
            Nej, justera
          </button>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium mt-4"
      >
        Skicka feedback
      </button>
    </div>
  );
}
