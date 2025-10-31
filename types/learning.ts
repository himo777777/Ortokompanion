// Daily Learning Session types

export interface LearningSession {
  id: string;
  date: Date;
  completed: boolean;
  timeSpent: number; // in seconds
  phases: {
    read: ReadPhase;
    quiz: QuizPhase;
    review: ReviewPhase;
  };
  summary: SessionSummary;
}

export interface ReadPhase {
  completed: boolean;
  content: ClinicalPearl | CaseVignette;
  timeSpent: number;
}

export interface ClinicalPearl {
  type: 'pearl';
  title: string;
  content: string;
  keyPoints: string[];
  estimatedMinutes: number;
  relatedGoals?: string[]; // Socialstyrelsen mål-IDs
}

export interface CaseVignette {
  type: 'vignette';
  title: string;
  patient: {
    age: number;
    gender: string;
    presentation: string;
  };
  scenario: string;
  learningPoints: string[];
  estimatedMinutes: number;
  relatedGoals?: string[]; // Socialstyrelsen mål-IDs
}

export interface QuizPhase {
  completed: boolean;
  questions: AdaptiveQuestion[];
  score: number; // 0-100
  timeSpent: number;
}

export interface AdaptiveQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  userAnswer?: number;
  correct?: boolean;
  relatedGoals?: string[]; // Socialstyrelsen mål-IDs
}

export interface ReviewPhase {
  completed: boolean;
  flashcards: Flashcard[];
  masteredCount: number;
  timeSpent: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  mastered: boolean;
  lastReviewed?: Date;
  nextReview?: Date;
  relatedGoals?: string[]; // Socialstyrelsen mål-IDs
}

export interface SessionSummary {
  xpEarned: number;
  streakDay: number;
  keyInsight: string;
  accuracy: number;
  timeSpent: number;
  perfectDay: boolean;
}

// Roadmap & Progress Tracking

export interface LearningRoadmap {
  subspecialty: string;
  stages: RoadmapStage[];
  currentStage: number;
  overallProgress: number; // 0-100
}

export interface RoadmapStage {
  id: string;
  name: string;
  level: 'foundation' | 'intermediate' | 'advanced' | 'mastery';
  topics: Topic[];
  unlocked: boolean;
  completed: boolean;
}

export interface Topic {
  id: string;
  name: string;
  subtopics: Subtopic[];
  progress: number; // 0-100
  status: 'locked' | 'available' | 'in-progress' | 'completed';
}

export interface Subtopic {
  id: string;
  name: string;
  completed: boolean;
}

// Analytics

export interface UserAnalytics {
  userId: string;
  weeklyStats: WeeklyStats;
  accuracy: AccuracyStats;
  streakInfo: StreakInfo;
  topicMastery: TopicMastery[];
  goalProgress?: SocialstyrelseMålProgress; // Progress mot Socialstyrelsen mål
}

// Progress mot Socialstyrelsen mål
export interface SocialstyrelseMålProgress {
  totalGoals: number;
  achievedGoals: number;
  percentage: number;
  byCompetencyArea: Record<string, { total: number; achieved: number }>;
  recentActivity: Array<{
    goalId: string;
    goalTitle: string;
    timestamp: Date;
    activityType: string;
  }>;
}

export interface WeeklyStats {
  sessionsCompleted: number;
  totalSessions: number; // Usually 7
  xpEarned: number;
  averageAccuracy: number;
  totalTimeSpent: number;
}

export interface AccuracyStats {
  overall: number;
  byDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  bySubspecialty: Record<string, number>;
  trend: 'improving' | 'stable' | 'declining';
}

export interface StreakInfo {
  current: number;
  longest: number;
  freezeTokens: number;
  lastActivity: Date;
}

export interface TopicMastery {
  topic: string;
  mastery: number; // 0-100
  questionsAnswered: number;
  accuracy: number;
}

// Leaderboard

export interface LeaderboardEntry {
  userId: string;
  username: string;
  level: number;
  xp: number;
  streak: number;
  subspecialty?: string;
  rank: number;
}

export interface Leaderboard {
  type: 'global' | 'subspecialty' | 'peers';
  period: 'daily' | 'weekly' | 'monthly' | 'alltime';
  entries: LeaderboardEntry[];
  userRank?: number;
}

// Community

export interface CasePost {
  id: string;
  authorId: string;
  authorName: string;
  authorLevel: number;
  createdAt: Date;
  title: string;
  presentation: string;
  question: string;
  subspecialty: string;
  tags: string[];
  imageUrl?: string;
  anonymous: boolean;
  helpful: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorLevel: number;
  createdAt: Date;
  content: string;
  helpful: number;
  markedHelpful: boolean;
}

// Placement Quiz

export interface PlacementQuiz {
  questions: PlacementQuestion[];
  completed: boolean;
  result?: PlacementResult;
}

export interface PlacementQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface PlacementResult {
  score: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  recommendedDifficulty: 'easy' | 'medium' | 'hard';
  strengths: string[];
  areasToImprove: string[];
}
