'use client';

import { useState } from 'react';
import GoalProgressTracker from '@/components/learning/GoalProgressTracker';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type EducationLevel = 'student' | 'at' | 'st1' | 'st2' | 'st3' | 'st4' | 'st5';

export default function GoalsPage() {
  // In a real app, this would come from user's profile
  const [userLevel, setUserLevel] = useState<EducationLevel>('st1');
  const [showAllLevels, setShowAllLevels] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Tillbaka till Dashboard
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Mina Utbildningsmål</h1>
              <p className="text-gray-600 mt-1">Följ din progress mot Socialstyrelsens officiella mål</p>
            </div>

            {/* Level Selector */}
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Din nivå</label>
                <select
                  value={userLevel}
                  onChange={(e) => setUserLevel(e.target.value as EducationLevel)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="student">Läkarstudent</option>
                  <option value="at">AT-läkare</option>
                  <option value="st1">ST1 Ortopedi</option>
                  <option value="st2">ST2 Ortopedi</option>
                  <option value="st3">ST3 Ortopedi</option>
                  <option value="st4">ST4 Ortopedi</option>
                  <option value="st5">ST5 Ortopedi</option>
                </select>
              </div>

              {userLevel.startsWith('st') && (
                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    id="showAll"
                    checked={showAllLevels}
                    onChange={(e) => setShowAllLevels(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="showAll" className="text-sm text-gray-700">
                    Visa även tidigare års mål
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Goal Progress Tracker */}
      <GoalProgressTracker userLevel={userLevel} showAllLevels={showAllLevels} />

      {/* Info Box */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Om Socialstyrelsens mål</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              Socialstyrelsens utbildningsmål definierar de kompetenser som krävs för varje utbildningsnivå inom läkarprogrammet och specialistutbildningen.
            </p>
            <p>
              Genom att följa din progress mot dessa officiella mål kan du säkerställa att du utvecklar rätt kompetenser i rätt ordning.
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1">
              <li>Klicka på ett mål för att se detaljerade bedömningskriterier</li>
              <li>Markera kriterier som du har uppnått genom att klicka på dem</li>
              <li>Din progress sparas automatiskt och visas i Analytics</li>
              <li>Använd kompetensområdesfilter för att fokusera på specifika områden</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
