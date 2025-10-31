'use client';

import { useState } from 'react';
import { GraduationCap, BookOpen, Target } from 'lucide-react';
import { ExamType, ExamQuestion } from '@/types/exam';
import ExamModuleViewer from './ExamModuleViewer';
import ExamSession from './ExamSession';
import { examInfo } from '@/data/exam-questions';

export default function ExamModulesHub() {
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);
  const [activeExamSession, setActiveExamSession] = useState<{
    questions: ExamQuestion[];
    examType: ExamType;
  } | null>(null);

  // Show exam session if active
  if (activeExamSession) {
    const info = examInfo[activeExamSession.examType];
    return (
      <ExamSession
        questions={activeExamSession.questions}
        examTitle={info.title}
        passingScore={info.passingScore}
        onComplete={(results) => {
          console.log('Exam completed:', results);
          setActiveExamSession(null);
          setSelectedExam(null);
        }}
        onExit={() => {
          setActiveExamSession(null);
        }}
      />
    );
  }

  if (selectedExam) {
    return (
      <div>
        <button
          onClick={() => setSelectedExam(null)}
          className="mb-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          ← Tillbaka till provöversikt
        </button>
        <ExamModuleViewer
          examType={selectedExam}
          onStartExam={(questions) => {
            setActiveExamSession({
              questions,
              examType: selectedExam
            });
          }}
        />
      </div>
    );
  }

  const examTypes: ExamType[] = ['specialist-ortopedi', 'at-tentamen', 'kunskapsprovet'];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-blue-600" />
          Provexamen & Tentamensmoduler
        </h1>
        <p className="text-gray-600">
          Välj ett provformat för att se tillgängliga frågor, statistik och starta provexamen
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {examTypes.map((examType) => {
          const info = examInfo[examType];
          return (
            <button
              key={examType}
              onClick={() => setSelectedExam(examType)}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  {examType === 'specialist-ortopedi' && <GraduationCap className="w-8 h-8 text-blue-600" />}
                  {examType === 'at-tentamen' && <Target className="w-8 h-8 text-green-600" />}
                  {examType === 'kunskapsprovet' && <BookOpen className="w-8 h-8 text-purple-600" />}
                </div>
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {info.title}
                </h2>
              </div>

              <p className="text-gray-600 mb-4">
                {info.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm">
                  <p className="text-gray-500">Godkänd nivå</p>
                  <p className="font-bold text-green-600">{info.passingScore}%</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-500">Rekommenderad tid</p>
                  <p className="font-bold text-blue-600">{info.recommendedTime} min</p>
                </div>
              </div>

              <div className="mt-4 text-center py-2 bg-blue-50 text-blue-700 rounded-lg font-medium group-hover:bg-blue-600 group-hover:text-white transition-colors">
                Visa provmodul →
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Om provmodulerna
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-semibold text-gray-900 mb-1">Verifierade källor</p>
            <p className="text-gray-700">Alla frågor baserade på Rikshöft, Riksknä, SVORF och peer-reviewed artiklar</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">Adaptiv svårighetsgrad</p>
            <p className="text-gray-700">Tre nivåer: Standard, Utmanande och Expert för optimal inlärning</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">Detaljerade förklaringar</p>
            <p className="text-gray-700">Varje fråga inkluderar lärandemål, klinisk relevans och vanliga misstag</p>
          </div>
        </div>
      </div>
    </div>
  );
}
