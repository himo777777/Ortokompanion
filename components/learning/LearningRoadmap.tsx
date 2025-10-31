'use client';

import { useState } from 'react';
import { LearningRoadmap, RoadmapStage, Topic } from '@/types/learning';
import { CheckCircle2, Circle, Lock, TrendingUp, Award } from 'lucide-react';

interface RoadmapProps {
  subspecialty: string;
}

export default function VisualRoadmap({ subspecialty }: RoadmapProps) {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Mock data - skulle komma från backend
  const roadmap: LearningRoadmap = {
    subspecialty: 'Höft',
    currentStage: 1,
    overallProgress: 35,
    stages: [
      {
        id: 'foundation',
        name: 'Foundation',
        level: 'foundation',
        unlocked: true,
        completed: true,
        topics: [
          {
            id: 'anatomy',
            name: 'Anatomi',
            progress: 100,
            status: 'completed',
            subtopics: [
              { id: 'bones', name: 'Ben & ledytor', completed: true },
              { id: 'ligaments', name: 'Ligament', completed: true },
              { id: 'muscles', name: 'Muskulatur', completed: true },
            ],
          },
          {
            id: 'examination',
            name: 'Klinisk Undersökning',
            progress: 100,
            status: 'completed',
            subtopics: [
              { id: 'inspection', name: 'Inspektion', completed: true },
              { id: 'palpation', name: 'Palpation', completed: true },
              { id: 'rom', name: 'Rörlighet', completed: true },
            ],
          },
        ],
      },
      {
        id: 'intermediate',
        name: 'Intermediate',
        level: 'intermediate',
        unlocked: true,
        completed: false,
        topics: [
          {
            id: 'fractures',
            name: 'Höftfrakturer',
            progress: 60,
            status: 'in-progress',
            subtopics: [
              { id: 'classification', name: 'Klassificering', completed: true },
              { id: 'treatment', name: 'Behandling', completed: true },
              { id: 'complications', name: 'Komplikationer', completed: false },
            ],
          },
          {
            id: 'arthritis',
            name: 'Artros & Artrit',
            progress: 40,
            status: 'in-progress',
            subtopics: [
              { id: 'diagnosis', name: 'Diagnostik', completed: true },
              { id: 'conservative', name: 'Konservativ behandling', completed: false },
              { id: 'surgical', name: 'Kirurgisk behandling', completed: false },
            ],
          },
          {
            id: 'pediatric',
            name: 'Barnhöft',
            progress: 0,
            status: 'available',
            subtopics: [
              { id: 'ddh', name: 'Höftluxation (DDH)', completed: false },
              { id: 'perthes', name: 'Perthes', completed: false },
              { id: 'scfe', name: 'SCFE', completed: false },
            ],
          },
        ],
      },
      {
        id: 'advanced',
        name: 'Advanced',
        level: 'advanced',
        unlocked: false,
        completed: false,
        topics: [
          {
            id: 'tha',
            name: 'Total Höftprotes',
            progress: 0,
            status: 'locked',
            subtopics: [
              { id: 'indications', name: 'Indikationer', completed: false },
              { id: 'techniques', name: 'Operationstekniker', completed: false },
              { id: 'outcomes', name: 'Resultat & Uppföljning', completed: false },
            ],
          },
          {
            id: 'revision',
            name: 'Revisionskirurgi',
            progress: 0,
            status: 'locked',
            subtopics: [
              { id: 'causes', name: 'Orsaker till revision', completed: false },
              { id: 'planning', name: 'Planering', completed: false },
              { id: 'techniques', name: 'Tekniker', completed: false },
            ],
          },
        ],
      },
      {
        id: 'mastery',
        name: 'Mastery',
        level: 'mastery',
        unlocked: false,
        completed: false,
        topics: [
          {
            id: 'complex',
            name: 'Komplexa Fall',
            progress: 0,
            status: 'locked',
            subtopics: [
              { id: 'bone-loss', name: 'Benförlust', completed: false },
              { id: 'infection', name: 'Infektion', completed: false },
              { id: 'custom', name: 'Custom Implantat', completed: false },
            ],
          },
          {
            id: 'research',
            name: 'Forskning & Innovation',
            progress: 0,
            status: 'locked',
            subtopics: [
              { id: 'evidence', name: 'Evidensbaserad medicin', completed: false },
              { id: 'trials', name: 'Kliniska studier', completed: false },
              { id: 'innovation', name: 'Nya tekniker', completed: false },
            ],
          },
        ],
      },
    ],
  };

  const getStageColor = (level: string) => {
    const colors = {
      foundation: 'from-green-400 to-green-600',
      intermediate: 'from-blue-400 to-blue-600',
      advanced: 'from-purple-400 to-purple-600',
      mastery: 'from-yellow-400 to-yellow-600',
    };
    return colors[level as keyof typeof colors] || 'from-gray-400 to-gray-600';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Din lärväg: {subspecialty}</h1>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Övergripande progress</span>
              <span className="text-sm font-bold text-blue-600">{roadmap.overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                style={{ width: `${roadmap.overallProgress}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-lg">
            <Award className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-800">Stage {roadmap.currentStage + 1}/4</span>
          </div>
        </div>
      </div>

      {/* Roadmap Stages */}
      <div className="space-y-8">
        {roadmap.stages.map((stage, stageIndex) => (
          <div key={stage.id} className="relative">
            {/* Stage Header */}
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-lg ${
                  stage.completed
                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                    : stage.unlocked
                    ? `bg-gradient-to-r ${getStageColor(stage.level)}`
                    : 'bg-gray-400'
                } text-white`}
              >
                {stage.completed ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : stage.unlocked ? (
                  <Circle className="w-6 h-6" />
                ) : (
                  <Lock className="w-6 h-6" />
                )}
                <div>
                  <h2 className="text-xl font-bold">{stage.name}</h2>
                  <p className="text-sm opacity-90 capitalize">{stage.level}</p>
                </div>
              </div>

              {!stage.unlocked && (
                <div className="px-4 py-2 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-600">
                    🔒 Slutför föregående stage för att låsa upp
                  </p>
                </div>
              )}
            </div>

            {/* Topics Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${!stage.unlocked && 'opacity-50'}`}>
              {stage.topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => stage.unlocked && setSelectedTopic(topic)}
                  disabled={!stage.unlocked || topic.status === 'locked'}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    topic.status === 'completed'
                      ? 'border-green-300 bg-green-50 hover:border-green-400'
                      : topic.status === 'in-progress'
                      ? 'border-blue-300 bg-blue-50 hover:border-blue-400'
                      : topic.status === 'available'
                      ? 'border-gray-300 bg-white hover:border-blue-300'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">{topic.name}</h3>
                    {topic.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : topic.status === 'in-progress' ? (
                      <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    ) : topic.status === 'locked' ? (
                      <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          topic.status === 'completed'
                            ? 'bg-green-500'
                            : topic.status === 'in-progress'
                            ? 'bg-blue-500'
                            : 'bg-gray-300'
                        }`}
                        style={{ width: `${topic.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Subtopics */}
                  <div className="space-y-1">
                    {topic.subtopics.map((subtopic) => (
                      <div key={subtopic.id} className="flex items-center gap-2 text-xs text-gray-600">
                        {subtopic.completed ? (
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                        ) : (
                          <Circle className="w-3 h-3 text-gray-300" />
                        )}
                        <span>{subtopic.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-xs font-medium text-gray-600">
                      {topic.progress}% slutfört
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Connector Line */}
            {stageIndex < roadmap.stages.length - 1 && (
              <div className="flex justify-center my-4">
                <div className="w-1 h-8 bg-gray-300 rounded" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Topic Detail Modal */}
      {selectedTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedTopic.name}</h2>
                <p className="text-gray-600">Progress: {selectedTopic.progress}%</p>
              </div>
              <button
                onClick={() => setSelectedTopic(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {selectedTopic.subtopics.map((subtopic) => (
                <div
                  key={subtopic.id}
                  className={`p-4 rounded-lg border-2 ${
                    subtopic.completed
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">{subtopic.name}</span>
                    {subtopic.completed && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedTopic(null)}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors"
            >
              {selectedTopic.status === 'in-progress'
                ? 'Fortsätt lära'
                : selectedTopic.status === 'completed'
                ? 'Repetera'
                : 'Starta lärande'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
