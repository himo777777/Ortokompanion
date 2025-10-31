'use client';

import { useState } from 'react';
import { CaseStudy, EducationLevel } from '@/types/education';
import { caseStudies } from '@/data/caseStudies';
import { FileText, User, Clock, CheckCircle, XCircle } from 'lucide-react';

interface CaseStudyViewerProps {
  level: EducationLevel;
}

export default function CaseStudyViewer({ level }: CaseStudyViewerProps) {
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const relevantCases = caseStudies.filter(c => c.level === level);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const resetCase = () => {
    setAnswers({});
    setShowResults(false);
  };

  if (!selectedCase) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Kliniska Fallstudier
        </h2>
        <div className="grid gap-4">
          {relevantCases.length === 0 ? (
            <div className="p-6 bg-gray-100 rounded-lg text-center">
              <p className="text-gray-600">Inga fallstudier tillgängliga för denna nivå ännu.</p>
            </div>
          ) : (
            relevantCases.map(caseStudy => (
              <button
                key={caseStudy.id}
                onClick={() => setSelectedCase(caseStudy)}
                className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all text-left shadow-sm hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {caseStudy.title}
                    </h3>
                    <div className="flex gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {caseStudy.patient.gender}, {caseStudy.patient.age} år
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {caseStudy.questions.length} frågor
                      </span>
                    </div>
                    <p className="text-gray-700">{caseStudy.patient.complaint}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <button
        onClick={() => {
          setSelectedCase(null);
          resetCase();
        }}
        className="mb-4 text-blue-600 hover:text-blue-700 font-medium"
      >
        ← Tillbaka till fallstudier
      </button>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-500 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">{selectedCase.title}</h2>
          <div className="flex gap-4 text-sm opacity-90">
            <span>
              {selectedCase.patient.gender}, {selectedCase.patient.age} år
            </span>
            <span>•</span>
            <span>{selectedCase.patient.complaint}</span>
          </div>
        </div>

        {/* Scenario */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Scenario</h3>
          <p className="text-gray-700 leading-relaxed">{selectedCase.scenario}</p>
        </div>

        {/* Questions */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Frågor</h3>
          <div className="space-y-6">
            {selectedCase.questions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <p className="font-medium text-gray-800 mb-3">
                  {index + 1}. {question.question}
                </p>

                {question.options ? (
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <label
                        key={option}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          answers[question.id] === option
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${
                          showResults && question.correctAnswer === option
                            ? 'border-green-500 bg-green-50'
                            : ''
                        } ${
                          showResults &&
                          answers[question.id] === option &&
                          option !== question.correctAnswer
                            ? 'border-red-500 bg-red-50'
                            : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) => handleAnswer(question.id, e.target.value)}
                          disabled={showResults}
                          className="w-4 h-4"
                        />
                        <span className="flex-1">{option}</span>
                        {showResults && question.correctAnswer === option && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        {showResults &&
                          answers[question.id] === option &&
                          option !== question.correctAnswer && (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                    disabled={showResults}
                    placeholder="Skriv ditt svar här..."
                    className="w-full p-3 border-2 border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                )}

                {showResults && (
                  <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="text-sm font-medium text-gray-700 mb-1">Förklaring:</p>
                    <p className="text-sm text-gray-600">{question.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {!showResults ? (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== selectedCase.questions.length}
              className="mt-6 w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Skicka svar
            </button>
          ) : (
            <button
              onClick={resetCase}
              className="mt-6 w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Gör om testet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
