export type EducationLevel =
  | 'student'
  | 'at'
  | 'st1'
  | 'st2'
  | 'st3'
  | 'st4'
  | 'st5'
  | 'specialist';

export interface LevelInfo {
  id: EducationLevel;
  name: string;
  description: string;
  color: string;
  focusAreas: string[];
  difficulty: number; // 1-8
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  minLevel: EducationLevel;
  category: 'anatomi' | 'diagnostik' | 'behandling' | 'kirurgi' | 'rehabilitering';
}

export interface CaseStudy {
  id: string;
  title: string;
  patient: {
    age: number;
    gender: string;
    complaint: string;
  };
  level: EducationLevel;
  domain?: string; // Added for SRS card creation
  scenario: string;
  questions: Question[];
  references?: string[]; // Reference IDs from data/references.ts
  relatedGoals?: string[]; // Socialstyrelsen goal IDs
}

export interface Question {
  id: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}
