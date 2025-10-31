'use client';

import { useState } from 'react';
import { X, CheckCircle, ArrowRight, Clock, Target } from 'lucide-react';

interface ActivityViewerProps {
  activityId: string;
  activityType: 'new' | 'interleave' | 'srs';
  domain: string;
  onComplete: () => void;
  onClose: () => void;
}

export default function ActivityViewer({
  activityId,
  activityType,
  domain,
  onComplete,
  onClose,
}: ActivityViewerProps) {
  const [isCompleted, setIsCompleted] = useState(false);

  const getActivityTitle = () => {
    switch (activityType) {
      case 'new':
        return 'Nytt Innehåll';
      case 'interleave':
        return 'Interleaving';
      case 'srs':
        return 'Repetition (SRS)';
    }
  };

  const getActivityDescription = () => {
    switch (activityType) {
      case 'new':
        return 'Lär dig nytt innehåll inom ' + domain;
      case 'interleave':
        return 'Repetera tidigare innehåll från ' + domain;
      case 'srs':
        return 'SRS-kort att repetera';
    }
  };

  const handleComplete = () => {
    setIsCompleted(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  if (isCompleted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bra jobbat!</h2>
          <p className="text-gray-600">Aktiviteten är slutförd</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">{getActivityTitle()}</h2>
            </div>
            <p className="text-gray-600">{getActivityDescription()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Activity Content Placeholder */}
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Aktivitets-ID: {activityId}
            </h3>
            <p className="text-gray-700 mb-4">
              Detta är en placeholder för aktivitetsinnehåll. I en fullständig implementation skulle här finnas:
            </p>
            <ul className="space-y-2 text-gray-700">
              {activityType === 'new' && (
                <>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    Lärmaterial för nytt innehåll inom {domain}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    Interaktiva övningar och exempel
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    Kunskapskontroll med frågor
                  </li>
                </>
              )}
              {activityType === 'interleave' && (
                <>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    Blandade repetitionsfrågor från {domain}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    Jämförelser mellan liknande koncept
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    Praktiska cases för att befästa kunskap
                  </li>
                </>
              )}
              {activityType === 'srs' && (
                <>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Flashcards baserat på spaced repetition
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Svårighetsanpassad repetition
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Progressionsspårning per kort
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Mock Progress */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Simulerad progress</span>
              <span className="text-sm text-gray-600">
                <Clock className="w-4 h-4 inline mr-1" />
                ~6 min
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-0 transition-all duration-1000"
                   style={{ width: '0%' }}
              />
            </div>
          </div>

          {/* Information Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              <strong>ℹ️ Utvecklingsinformation:</strong> Detta är en placeholder-vy för aktiviteter.
              Den verkliga implementationen skulle ladda faktiskt innehåll baserat på contentId,
              visa interaktiva övningar, och spara användarens progress och resultat.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Avbryt
          </button>
          <button
            onClick={handleComplete}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium flex items-center gap-2"
          >
            Markera som slutförd
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
