import { OnboardingData, UserProfile, SevenDayPlan, DayPlan, PlanItem, Domain, BADGES } from '@/types/onboarding';
import { EducationLevel } from '@/types/education';
import { Rotation, OrthoPlacement, getRotationStatus } from '@/types/rotation';
import { autoAssignGoals } from './goal-assignment';
import { logger } from './logger';

export function initializeOnboarding(): OnboardingData {
  return {
    step: 1,
    domains: [],
    goals: [],
    consent: {
      analytics: false,
      regionAdapt: true,
    },
    channel: 'ingen',
    tieBreaker: {
      startMode: 'akut',
      preferMicrocases: true,
      dailyPush: false,
    },
    completed: false,
  };
}

export function createUserProfile(onboarding: OnboardingData): UserProfile {
  const profile: UserProfile = {
    id: generateId(),
    role: onboarding.level!,
    stYear: onboarding.stYear,
    goals: onboarding.goals.map(g => g === 'custom' && onboarding.customGoal ? onboarding.customGoal : g),
    domains: onboarding.domains,
    consent: onboarding.consent,
    channel: onboarding.channel,
    tieBreaker: onboarding.tieBreaker,
    gamification: {
      xp: 0,
      level: 1,
      badges: [],
      streak: 0,
    },
    createdAt: new Date(),
    onboardingCompletedAt: new Date(),

    // NEW: Specialty and rotation data
    primarySpecialty: onboarding.primarySpecialty,
    orthoPlacement: onboarding.orthoPlacement ? {
      ...onboarding.orthoPlacement,
      status: getRotationStatus(onboarding.orthoPlacement.startDate, onboarding.orthoPlacement.endDate),
      goals: [],
      progress: 0,
    } : undefined,

    // NEW: AI Adaptation
    aiAdaptationEnabled: onboarding.aiAdaptationEnabled !== false, // Default true
    learningStyle: onboarding.learningStyle || 'mixed',

    // NEW: Fortbildning mode
    fortbildningMode: onboarding.fortbildningMode,
  };

  // Convert rotations array to RotationTimeline (for ST-ortopedi)
  if (onboarding.rotations && onboarding.rotations.length > 0) {
    const rotations: Rotation[] = onboarding.rotations.map((rot, index) => {
      const startDate = rot.startDate ? new Date(rot.startDate) : new Date();
      const endDate = rot.endDate ? new Date(rot.endDate) : new Date();

      return {
        id: `rot-${index}-${Date.now()}`,
        domain: rot.domain,
        startDate,
        endDate,
        status: getRotationStatus(startDate, endDate),
        goals: [], // Will be auto-assigned below
        progress: 0,
        hospital: rot.hospital,
      };
    });

    profile.rotationTimeline = {
      rotations,
      currentRotationId: rotations.find(r => r.status === 'current')?.id,
    };
  }

  // Convert ortho placement (for ST-other specialties)
  if (onboarding.orthoPlacement && onboarding.placementStartDate && onboarding.placementEndDate) {
    const startDate = new Date(onboarding.placementStartDate);
    const endDate = new Date(onboarding.placementEndDate);

    profile.orthoPlacement = {
      startDate,
      endDate,
      focusDomain: onboarding.orthoPlacement.focusDomain,
      status: getRotationStatus(startDate, endDate),
      goals: [], // Will be auto-assigned below
      progress: 0,
      hospital: onboarding.orthoPlacement.hospital,
    };
  }

  // Set placement timing for student/AT
  if (onboarding.placementTiming) {
    profile.placementTiming = onboarding.placementTiming;
    profile.placementStartDate = onboarding.placementStartDate ? new Date(onboarding.placementStartDate) : undefined;
    profile.placementEndDate = onboarding.placementEndDate ? new Date(onboarding.placementEndDate) : undefined;
  }

  // AUTO-ASSIGN SOCIALSTYRELSEN GOALS based on profile
  const assignedGoals = autoAssignGoals(profile);

  // Assign goals to rotations if applicable
  if (profile.rotationTimeline) {
    profile.rotationTimeline.rotations = profile.rotationTimeline.rotations.map(rotation => ({
      ...rotation,
      goals: assignedGoals, // For now, assign all goals to each rotation
      // In future, could use assignGoalsForRotation() to be more specific
    }));
  }

  // Assign goals to ortho placement if applicable
  if (profile.orthoPlacement) {
    profile.orthoPlacement.goals = assignedGoals;
  }

  return profile;
}

export function generate7DayPlan(profile: UserProfile): SevenDayPlan {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  const days: DayPlan[] = [];

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + i);

    days.push({
      day: i + 1,
      date: dayDate,
      completed: false,
      items: generateDayItems(i + 1, profile),
    });
  }

  return {
    userId: profile.id,
    startDate,
    endDate,
    days,
    focus: profile.domains,
    level: profile.role,
  };
}

function generateDayItems(day: number, profile: UserProfile): PlanItem[] {
  const domain = profile.domains[0] || 'höft';
  const isAkut = profile.tieBreaker.startMode === 'akut';
  const preferCases = profile.tieBreaker.preferMicrocases;

  // Dag 1: Mikrofall + Pearl + Next-day check
  if (day === 1) {
    const items: PlanItem[] = [];

    if (preferCases) {
      items.push({
        id: `d1-microcase`,
        type: 'microcase',
        title: getDayOneMicrocase(domain, isAkut),
        description: 'Kort kliniskt scenario med direkta beslutspunkter',
        estimatedMinutes: 5,
        xpReward: 10,
        completed: false,
      });
    }

    items.push({
      id: `d1-beslutstraad`,
      type: 'beslutstraad',
      title: `Beslutsträd: Akut ${getDomainName(domain)}`,
      description: 'Steg-för-steg guide för akut handläggning',
      estimatedMinutes: 3,
      xpReward: 5,
      completed: false,
    });

    items.push({
      id: `d1-pearl`,
      type: 'pearl',
      title: 'Clinical Pearl',
      description: getPearlForDomain(domain),
      estimatedMinutes: 2,
      xpReward: 5,
      completed: false,
    });

    items.push({
      id: `d1-nextday`,
      type: 'nextday-check',
      title: 'Dagens reflektion',
      description: '3 snabba frågor för att justera din plan',
      estimatedMinutes: 1,
      xpReward: 5,
      completed: false,
    });

    return items;
  }

  // Dag 2: Röntgen + Quiz
  if (day === 2) {
    return [
      {
        id: `d2-rontgen`,
        type: 'rontgen',
        title: `Röntgenbedömning: ${getDomainName(domain)}`,
        description: 'Identifiera viktiga linjer och klassificering',
        estimatedMinutes: 5,
        xpReward: 10,
        completed: false,
      },
      {
        id: `d2-quiz`,
        type: 'quiz',
        title: 'Kunskapstest: Grundläggande bedömning',
        description: '5 frågor om bildtolkning',
        estimatedMinutes: 3,
        xpReward: 10,
        completed: false,
      },
    ];
  }

  // Dag 3: OP-principer + MCQ
  if (day === 3) {
    return [
      {
        id: `d3-microcase`,
        type: 'microcase',
        title: 'Operationsförberedelse',
        description: 'Vad behöver vara klart innan OP?',
        estimatedMinutes: 5,
        xpReward: 10,
        completed: false,
      },
      {
        id: `d3-quiz`,
        type: 'quiz',
        title: '3 MCQ: Operativa principer',
        description: 'Testa din förståelse',
        estimatedMinutes: 3,
        xpReward: 10,
        completed: false,
      },
    ];
  }

  // Dag 4: Komplikationer
  if (day === 4) {
    return [
      {
        id: `d4-pearl`,
        type: 'pearl',
        title: 'Alarmtecken & Komplikationer',
        description: 'Vad du MÅSTE känna igen',
        estimatedMinutes: 5,
        xpReward: 10,
        completed: false,
      },
      {
        id: `d4-beslutstraad`,
        type: 'beslutstraad',
        title: 'Handläggning vid komplikation',
        description: 'Steg-för-steg vid misstanke',
        estimatedMinutes: 5,
        xpReward: 10,
        completed: false,
      },
    ];
  }

  // Dag 5: Evidens
  if (day === 5) {
    return [
      {
        id: `d5-evidens`,
        type: 'evidens',
        title: 'Evidensruta: Aktuella riktlinjer',
        description: 'Svenska + internationella rekommendationer',
        estimatedMinutes: 7,
        xpReward: 15,
        completed: false,
      },
    ];
  }

  // Dag 6: Praktisk kedja
  if (day === 6) {
    return [
      {
        id: `d6-microcase`,
        type: 'microcase',
        title: 'Mini-OSCE: Komplett handläggning',
        description: '3-stegs scenario från akutmottagning till uppföljning',
        estimatedMinutes: 8,
        xpReward: 20,
        completed: false,
      },
    ];
  }

  // Dag 7: Repetition + utvärdering
  if (day === 7) {
    return [
      {
        id: `d7-quiz`,
        type: 'quiz',
        title: 'Veckorepetition',
        description: 'Sammanfattande kunskapstest',
        estimatedMinutes: 5,
        xpReward: 15,
        completed: false,
      },
      {
        id: `d7-pearl`,
        type: 'pearl',
        title: 'Självskattning & Nästa steg',
        description: 'Hur känner du dig nu? Planera vecka 2-3',
        estimatedMinutes: 3,
        xpReward: 10,
        completed: false,
      },
    ];
  }

  return [];
}

function getDayOneMicrocase(domain: Domain, isAkut: boolean): string {
  const cases: Record<Domain, string> = {
    'trauma': isAkut ? 'Multitrauma - ATLS & Prioritering' : 'Pelvis fraktur - Stabilisering',
    'axel-armbåge': isAkut ? 'Axelluxation - Handläggning' : 'Rotatorcuff - Konservativ behandling',
    'hand-handled': isAkut ? 'Colles fraktur - Reposition' : 'Karpaltunnelsyndrom - Bedömning',
    'rygg': isAkut ? 'Ryggmärgsskada - Akut handläggning' : 'Ländryggssmärta - Utredning',
    'höft': isAkut ? 'Proximal femurfraktur - Triage & Smärtlindring' : 'Elektiv THA - Preoperativ bedömning',
    'knä': isAkut ? 'ACL-skada - Diagnostik' : 'TKA - Indikationer',
    'fot-fotled': isAkut ? 'Fotledsdistorsion - Ottawa Rules' : 'Hälseneinflammation - Diagnostik',
    'sport': 'Idrottsskada - Akut bedömning & Return to play',
    'tumör': 'Bentumör - Initial utredning',
  };
  return cases[domain];
}

function getPearlForDomain(domain: Domain): string {
  const pearls: Record<Domain, string> = {
    'trauma': 'ATLS-principer alltid! Life before limb - stabilisera patient innan du fokuserar på extremiteter',
    'axel-armbåge': 'Dokumentera neurovaskulär status före och efter reposition - axillaris vid axelluxation!',
    'hand-handled': 'Kontrollera scaphoidfossa vid trauma även om initial röntgen är normal - gips vid misstanke',
    'rygg': 'Red flags: progressiv neurologisk deficit, kauda equina, trauma med frakturmisstanke - akut MR!',
    'höft': 'Alltid neurovaskulär status + adekvat smärtlindring INNAN röntgen vid höftfraktur',
    'knä': 'Ottawa Knee Rules + Lachman test är guldstandard för ACL-bedömning på akuten',
    'fot-fotled': 'Ottawa Ankle Rules minskar onödiga röntgen med 30-40% utan missade frakturer',
    'sport': 'Return to play kräver: smärtfrihet, full ROM, 90% styrka jämfört med friska sidan',
    'tumör': 'Nattsmärta + svullnad utan trauma = bentumör tills motsatsen bevisats - MR + utredning!',
  };
  return pearls[domain];
}

function getDomainName(domain: Domain): string {
  const names: Record<Domain, string> = {
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
  return names[domain];
}

function generateId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function calculateXP(itemType: string): number {
  const xpMap: Record<string, number> = {
    'microcase': 10,
    'quiz': 10,
    'pearl': 5,
    'beslutstraad': 5,
    'rontgen': 10,
    'evidens': 15,
    'nextday-check': 5,
  };
  return xpMap[itemType] || 5;
}

export function checkBadgeEarned(profile: UserProfile, action: string): string | null {
  // Enkel badge-logik
  if (action === 'complete-day-1' && !profile.gamification.badges.includes('first-call')) {
    return 'first-call';
  }

  if (action === 'complete-plan' && !profile.gamification.badges.includes('jour-klar')) {
    return 'jour-klar';
  }

  if (profile.gamification.streak >= 7 && !profile.gamification.badges.includes('week-streak')) {
    return 'week-streak';
  }

  return null;
}

export function updateStreak(profile: UserProfile): number {
  const lastActivity = profile.gamification.lastActivity;
  const now = new Date();

  if (!lastActivity) {
    return 1;
  }

  const daysDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) {
    // Samma dag
    return profile.gamification.streak;
  } else if (daysDiff === 1) {
    // Nästa dag - öka streak
    return profile.gamification.streak + 1;
  } else if (daysDiff <= 2) {
    // 1 miss tolereras per vecka
    return Math.max(1, profile.gamification.streak);
  } else {
    // Reset
    return 1;
  }
}

export function trackEvent(eventName: string, data?: any) {
  // Enkel event tracking - i produktion skulle detta skickas till analytics
  if (typeof window !== 'undefined') {
    logger.debug(`Analytics event: ${eventName}`, data);
    // localStorage för demo
    const events = JSON.parse(localStorage.getItem('ortokompanion_events') || '[]');
    events.push({
      event: eventName,
      data,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('ortokompanion_events', JSON.stringify(events.slice(-100))); // Keep last 100
  }
}
