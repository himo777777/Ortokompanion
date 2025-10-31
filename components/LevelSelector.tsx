'use client';

import { EducationLevel, LevelInfo } from '@/types/education';
import { educationLevels } from '@/data/levels';
import { GraduationCap, Stethoscope, BookOpen } from 'lucide-react';

interface LevelSelectorProps {
  selectedLevel: EducationLevel | null;
  onSelectLevel: (level: EducationLevel) => void;
}

export default function LevelSelector({ selectedLevel, onSelectLevel }: LevelSelectorProps) {
  const getIcon = (level: LevelInfo) => {
    if (level.id === 'student') return <GraduationCap className="w-8 h-8" />;
    if (level.id === 'at') return <Stethoscope className="w-8 h-8" />;
    return <BookOpen className="w-8 h-8" />;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Välkommen till Ortokompanion
        </h1>
        <p className="text-xl text-gray-600">
          AI-drivet utbildningssystem för ortopedi
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
          Välj din utbildningsnivå
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {educationLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => onSelectLevel(level.id)}
              className={`
                p-6 rounded-xl border-2 transition-all duration-200
                ${selectedLevel === level.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }
              `}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`${level.color} text-white p-4 rounded-full mb-4`}>
                  {getIcon(level)}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {level.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {level.description}
                </p>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(level.difficulty)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${level.color}`}
                    />
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedLevel && (
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Fokusområden för {educationLevels.find(l => l.id === selectedLevel)?.name}
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {educationLevels.find(l => l.id === selectedLevel)?.focusAreas.map((area, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">✓</span>
                <span className="text-gray-700">{area}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
