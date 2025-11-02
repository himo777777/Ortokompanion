import { EducationLevel, MedicalSpecialty } from './education';
import { RotationTimeline, OrthoPlacement } from './rotation';

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

  // ===== NEW ONBOARDING FIELDS =====

  /**
   * Primary medical specialty (ortopedi, allmänmedicin, akutsjukvård)
   */
  primarySpecialty?: MedicalSpecialty;

  /**
   * For ST-ortopedi: Rotation timeline data (will be converted to RotationTimeline)
   */
  rotations?: Array<{
    domain: Domain;
    startDate: Date;
    endDate: Date;
    hospital?: string;
  }>;

  /**
   * For ST-allmänmedicin / ST-akutsjukvård: Single ortho placement
   */
  orthoPlacement?: {
    startDate: Date;
    endDate: Date;
    focusDomain?: Domain;
    hospital?: string;
  };

  /**
   * For students/AT: Placement timing
   */
  placementTiming?: 'current' | 'soon' | 'later' | 'none';

  /**
   * For students/AT: Optional placement dates
   */
  placementStartDate?: Date;
  placementEndDate?: Date;

  /**
   * AI adaptation preferences
   */
  aiAdaptationEnabled?: boolean;
  learningStyle?: 'visual' | 'analytical' | 'clinical' | 'mixed';

  /**
   * For specialists: Fortbildning mode
   */
  fortbildningMode?: boolean;
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
    freezeTokens?: number; // Existing field
  };
  createdAt: Date;
  onboardingCompletedAt?: Date;

  // ===== NEW ROTATION/PLACEMENT FIELDS =====

  /**
   * Primary medical specialty
   * - ortopedi: For ST1-ST5 ortho residents
   * - allmänmedicin: For ST-allmänmedicin with ortho placement
   * - akutsjukvård: For ST-akutsjukvård with ortho placement
   */
  primarySpecialty?: MedicalSpecialty;

  /**
   * For ST-ortopedi (ST1-ST5): Complete rotation timeline with dates
   */
  rotationTimeline?: RotationTimeline;

  /**
   * For ST-allmänmedicin / ST-akutsjukvård: Single ortho placement period
   */
  orthoPlacement?: OrthoPlacement;

  /**
   * For students/AT: When is their ortho placement/rotation?
   */
  placementTiming?: 'current' | 'soon' | 'later' | 'none';

  /**
   * For students/AT: Optional placement dates
   */
  placementStartDate?: Date;
  placementEndDate?: Date;

  /**
   * Whether this user has an ortho placement (for non-ortho specialties)
   */
  hasOrthoPlacement?: boolean;

  // ===== AI ADAPTATION FIELDS =====

  /**
   * Enable AI-powered content adaptation
   * - Personalized hints
   * - Adaptive explanations
   * - Smart recommendations
   */
  aiAdaptationEnabled: boolean;

  /**
   * User's preferred learning style for AI adaptation
   */
  learningStyle?: 'visual' | 'analytical' | 'clinical' | 'mixed';

  /**
   * Track topics/domains user struggles with for AI personalization
   */
  weaknessAreas?: string[];

  /**
   * For specialists: Fortbildning/CME mode enabled
   */
  fortbildningMode?: boolean;
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
