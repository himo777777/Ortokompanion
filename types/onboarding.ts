import { EducationLevel } from './education';

export type Domain = 'trauma' | 'axel-armbåge' | 'hand-handled' | 'rygg' | 'höft' | 'knä' | 'fot-fotled' | 'sport' | 'tumör';

export type Goal = 'trygg-jour' | 'förbereda-op' | 'förbättra-röntgen' | 'custom';

export type StartMode = 'akut' | 'operation';

export type NotificationChannel = 'push' | 'email' | 'ingen';

export interface OnboardingData {
  step: number;
  level?: EducationLevel;
  stYear?: number; // För ST1-ST5
  domains: Domain[];
  goals: Goal[];
  customGoal?: string;
  consent: {
    analytics: boolean;
    regionAdapt: boolean;
  };
  channel: NotificationChannel;
  tieBreaker: {
    startMode: StartMode;
    preferMicrocases: boolean;
    dailyPush: boolean;
  };
  completed: boolean;
}

export interface UserProfile {
  id: string;
  role: EducationLevel;
  stYear?: number;
  goals: string[];
  domains: Domain[];
  consent: {
    analytics: boolean;
    regionAdapt: boolean;
  };
  channel: NotificationChannel;
  tieBreaker: {
    startMode: StartMode;
    preferMicrocases: boolean;
    dailyPush: boolean;
  };
  gamification: {
    xp: number;
    level: number;
    badges: string[];
    streak: number;
    lastActivity?: Date;
  };
  createdAt: Date;
  onboardingCompletedAt?: Date;
}

export interface DayPlan {
  day: number;
  date: Date;
  completed: boolean;
  items: PlanItem[];
}

export interface PlanItem {
  id: string;
  type: 'microcase' | 'quiz' | 'pearl' | 'beslutstraad' | 'rontgen' | 'evidens' | 'nextday-check';
  title: string;
  description: string;
  estimatedMinutes: number;
  xpReward: number;
  completed: boolean;
  content?: any; // Specifikt innehåll för varje typ
  relatedGoals?: string[]; // Socialstyrelsen mål-IDs som denna aktivitet kopplar till
}

export interface SevenDayPlan {
  userId: string;
  startDate: Date;
  endDate: Date;
  days: DayPlan[];
  focus: Domain[];
  level: EducationLevel;
}

export interface NextDayCheck {
  date: Date;
  questions: {
    usefulInPractice: boolean | null;
    levelFeedback: 'lägre' | 'lagom' | 'högre' | null;
    keepSamePlan: boolean | null;
  };
  completed: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpRequired?: number;
  condition?: string;
}

export const BADGES: Badge[] = [
  {
    id: 'first-call',
    name: 'First Call',
    description: 'Slutfört din första jour-övning',
    icon: '📞',
  },
  {
    id: 'rontgen-razor',
    name: 'RöntgenRazor',
    description: 'Identifierat 10 frakturer korrekt',
    icon: '🔍',
  },
  {
    id: 'checklist-champion',
    name: 'Checklist Champion',
    description: 'Använt beslutsträd 5 gånger',
    icon: '✅',
  },
  {
    id: 'evidence-explorer',
    name: 'Evidence Explorer',
    description: 'Läst 3 evidensrutor',
    icon: '📚',
  },
  {
    id: 'jour-klar',
    name: 'Jourklar',
    description: 'Slutfört 7-dagarsplan',
    icon: '🏆',
  },
  {
    id: 'week-streak',
    name: '7-dagars Streak',
    description: 'Aktiv 7 dagar i rad',
    icon: '🔥',
  },
];

export const GOAL_LABELS: Record<Goal, string> = {
  'trygg-jour': 'Bli trygg på jour',
  'förbereda-op': 'Förbereda OP-rotation',
  'förbättra-röntgen': 'Förbättra röntgenblick',
  'custom': 'Annat mål',
};

export const DOMAIN_LABELS: Record<Domain, string> = {
  'trauma': 'Trauma',
  'axel-armbåge': 'Axel & Armbåge',
  'hand-handled': 'Hand & Handled',
  'rygg': 'Rygg',
  'höft': 'Höft',
  'knä': 'Knä',
  'fot-fotled': 'Fot & Fotled',
  'sport': 'Sportmedicin',
  'tumör': 'Tumörortopedi',
};
