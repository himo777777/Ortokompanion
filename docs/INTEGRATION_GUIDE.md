# OrtoKompanion System Integration Guide

**Version:** 1.0
**Datum:** 2025-10-31
**Status:** Complete Blueprint

---

## Översikt

Denna guide beskriver hur man integrerar **System A (v2.0 Features)** med **System B (ST-Progression & SRS)** för att skapa en enhetlig lärande-plattform.

### System A (Redan Implementerat)
- ✅ Daily Learning Session (READ/QUIZ/REVIEW/SUMMARY)
- ✅ Visual Roadmap (Foundation → Mastery)
- ✅ Analytics Dashboard (XP, streaks, accuracy)
- ✅ Leaderboard
- ✅ Gamification (XP, badges, freeze tokens)
- ✅ Socialstyrelsen Integration

### System B (Nytt Implementerat)
- ✅ Band A-E Difficulty System
- ✅ SRS (Spaced Repetition)
- ✅ Domain Progression with Gates
- ✅ Mini-OSCE Assessments
- ✅ 60/20/20 Daily Mix
- ✅ Auto-Tuning

---

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Profile (Enhanced)                   │
│  - Education Level                                           │
│  - Primary Domain + 9 Domain Statuses                       │
│  - Band Status (A-E)                                        │
│  - SRS Cards Collection                                      │
│  - Gamification (XP, badges, streaks)                       │
│  - Socialstyrelsen Progress                                 │
└─────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                    Daily Mix Generator                       │
│  60% New (Band-appropriate)                                 │
│  20% Interleaving (Neighbor domain)                         │
│  20% SRS Reviews (Due cards)                                │
└─────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│              Enhanced Daily Learning Session                 │
│  READ:   New content from daily mix                         │
│  QUIZ:   SRS cards + Band difficulty                        │
│  REVIEW: SRS scheduling algorithm                           │
│  SUMMARY: XP + Band + SRS metrics                           │
└─────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                   Unified Dashboard                          │
│  - Today's Plan (Daily Mix visualization)                   │
│  - Band Status + Progression                                │
│  - Domain Gates (Mini-OSCE + Retention)                     │
│  - Analytics (Combined metrics)                             │
│  - Roadmap (Connected to gates)                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Enhanced User Profile

### Current UserProfile
```typescript
// types/onboarding.ts
interface UserProfile {
  id: string;
  role: EducationLevel;
  stYear?: number;
  goals: string[];
  domains: Domain[];
  gamification: {
    xp: number;
    level: number;
    badges: string[];
    streak: number;
    lastActivity?: Date;
  };
  // ...
}
```

### Enhanced UserProfile (Integrated)
```typescript
// types/integrated.ts
interface IntegratedUserProfile extends UserProfile {
  // Progression System
  progression: {
    primaryDomain: Domain;
    bandStatus: UserBandStatus;
    domainStatuses: Record<Domain, DomainStatus>;
    srs: {
      cards: SRSCard[];
      dueToday: string[];
      overdueCards: string[];
      leechCards: string[];
    };
    history: {
      bandAdjustments: BandAdjustment[];
      osceResults: OSCEResult[];
      retentionChecks: RetentionCheck[];
    };
  };

  // Existing gamification + Socialstyrelsen
  gamification: {
    xp: number;
    level: number;
    badges: string[];
    streak: number;
    lastActivity?: Date;
    freezeTokens: number; // Add this
  };

  socialstyrelseMålProgress: MålProgress[];
}
```

---

## Phase 2: Daily Mix Integration

### Step 1: Initialize on Onboarding Complete

```typescript
// In app/page.tsx or context
const handleOnboardingComplete = (
  newProfile: UserProfile,
  newPlan: SevenDayPlan
) => {
  // 1. Create band status
  const bandStatus = createInitialBandStatus(newProfile.role);

  // 2. Create domain statuses
  const primaryDomain = newProfile.domains[0]; // First selected domain
  const domainStatuses = createInitialDomainStatuses(
    primaryDomain,
    allDomains
  );

  // 3. Create enhanced profile
  const enhancedProfile: IntegratedUserProfile = {
    ...newProfile,
    progression: {
      primaryDomain,
      bandStatus,
      domainStatuses,
      srs: {
        cards: [],
        dueToday: [],
        overdueCards: [],
        leechCards: [],
      },
      history: {
        bandAdjustments: [],
        osceResults: [],
        retentionChecks: [],
      },
    },
    socialstyrelseMålProgress: [],
  };

  // 4. Generate first daily mix
  const dailyMix = generateDailyMix({
    primaryDomain,
    targetBand: getDayOneBand(bandStatus.currentBand), // Day 1 easier!
    srsCards: [],
    availableNewContent: loadContentForDomain(primaryDomain),
    completedDomains: [],
    isRecoveryDay: false,
    targetMinutes: 8,
  });

  setProfile(enhancedProfile);
  setDailyMix(dailyMix);
  setShowOnboarding(false);
};
```

### Step 2: Daily Refresh

```typescript
// Check每天 if new daily mix needed
useEffect(() => {
  if (!profile || !profile.progression) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastMix = dailyMix?.date
    ? new Date(dailyMix.date)
    : null;

  if (!lastMix || lastMix < today) {
    // Generate new daily mix
    const newMix = generateDailyMix({
      primaryDomain: profile.progression.primaryDomain,
      targetBand: profile.progression.bandStatus.currentBand,
      srsCards: profile.progression.srs.cards,
      availableNewContent: loadAvailableContent(),
      completedDomains: getCompletedDomains(
        profile.progression.domainStatuses
      ),
      isRecoveryDay: profile.preferences?.recoveryMode || false,
      targetMinutes: profile.preferences?.targetMinutesPerDay || 8,
    });

    setDailyMix(newMix);
    saveToLocalStorage('daily-mix', newMix);
  }
}, [profile]);
```

---

## Phase 3: Enhanced Daily Session Integration

### Replace DailySession with EnhancedDailySession

```typescript
// In main dashboard
import EnhancedDailySession from '@/components/learning/EnhancedDailySession';

<EnhancedDailySession
  dailyMix={dailyMix}
  progressionState={profile.progression}
  onComplete={handleSessionComplete}
/>
```

### Handle Session Completion

```typescript
const handleSessionComplete = (results: {
  summary: SessionSummary;
  srsUpdates: SRSCard[];
  performance: {
    correctRate: number;
    hintUsage: number;
    timeEfficiency: number;
  };
}) => {
  // 1. Update gamification (XP, streak, badges)
  const newXP = profile.gamification.xp + results.summary.xpEarned;
  const newLevel = Math.floor(newXP / 100) + 1;
  const newStreak = profile.gamification.streak + 1;

  // 2. Update SRS cards
  const updatedCards = profile.progression.srs.cards.map((card) => {
    const update = results.srsUpdates.find((u) => u.id === card.id);
    return update || card;
  });

  // 3. Update performance metrics
  const updatedBandStatus = {
    ...profile.progression.bandStatus,
    recentPerformance: updatePerformanceMetrics(
      profile.progression.bandStatus.recentPerformance,
      results.performance
    ),
    streakAtBand: profile.progression.bandStatus.streakAtBand + 1,
  };

  // 4. Check band adjustment
  const adjustment = calculateBandAdjustment(
    updatedBandStatus,
    getRecentDays(profile, 3)
  );

  if (adjustment) {
    updatedBandStatus = applyBandAdjustment(updatedBandStatus, adjustment);
    profile.progression.history.bandAdjustments.push(adjustment);

    // Show notification
    showBandAdjustmentNotification(adjustment);
  }

  // 5. Update Socialstyrelsen progress
  // Link completed activities to goals
  const relatedGoals = getRelatedGoals(dailyMix);
  updateSocialstyrelseMålProgress(profile, relatedGoals);

  // 6. Save everything
  const updatedProfile = {
    ...profile,
    gamification: {
      ...profile.gamification,
      xp: newXP,
      level: newLevel,
      streak: newStreak,
      lastActivity: new Date(),
    },
    progression: {
      ...profile.progression,
      bandStatus: updatedBandStatus,
      srs: {
        ...profile.progression.srs,
        cards: updatedCards,
      },
    },
  };

  setProfile(updatedProfile);
  saveToLocalStorage('ortokompanion_profile', updatedProfile);

  // 7. Track event
  trackEvent('session_complete', {
    userId: profile.id,
    xpEarned: results.summary.xpEarned,
    band: updatedBandStatus.currentBand,
    accuracy: results.summary.accuracy,
  });
};
```

---

## Phase 4: Unified Dashboard

### Dashboard Tabs (Updated)

```typescript
type Tab =
  | 'today'      // Today's plan (Daily Mix)
  | 'progress'   // Progression & Gates
  | 'analytics'  // Combined analytics
  | 'roadmap'    // Visual roadmap
  | 'goals'      // Socialstyrelsen mål
  | 'chat'       // AI tutor
  | 'community'; // Cases & leaderboard

const tabs = [
  { id: 'today', label: 'Dagens Plan', icon: CalendarDays },
  { id: 'progress', label: 'Progression', icon: TrendingUp },
  { id: 'analytics', label: 'Analytics', icon: BarChart },
  { id: 'roadmap', label: 'Roadmap', icon: Map },
  { id: 'goals', label: 'Mål', icon: Target },
  { id: 'chat', label: 'AI-Handledare', icon: MessageSquare },
  { id: 'community', label: 'Community', icon: Users },
];
```

### Today Tab (Primary View)

```typescript
{activeTab === 'today' && (
  <div className="space-y-6">
    {/* Header with Band & Domain */}
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Dagens Plan</h2>
          <p className="text-blue-100">
            Band {profile.progression.bandStatus.currentBand} •
            {DOMAIN_LABELS[profile.progression.primaryDomain]}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{profile.gamification.xp} XP</div>
          <div className="text-blue-100">Level {profile.gamification.level}</div>
        </div>
      </div>
    </div>

    {/* Daily Mix Cards */}
    <div className="grid grid-cols-3 gap-4">
      <ActivityCard
        title="Nytt Innehåll"
        percentage={60}
        items={dailyMix.newContent.items}
        color="blue"
        onStart={() => startSession('new')}
      />
      <ActivityCard
        title="Interleaving"
        percentage={20}
        items={dailyMix.interleavingContent.items}
        color="purple"
        onStart={() => startSession('interleave')}
      />
      <ActivityCard
        title="SRS Repetition"
        percentage={20}
        items={dailyMix.srsReviews.cards}
        color="green"
        onStart={() => startSession('srs')}
      />
    </div>

    {/* Start Session Button */}
    <button
      onClick={() => setActiveTab('session')}
      className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
    >
      🚀 Starta Dagens Session (10 min)
    </button>

    {/* Quick Stats */}
    <div className="grid grid-cols-4 gap-4">
      <StatCard icon="🔥" label="Streak" value={`${profile.gamification.streak} dagar`} />
      <StatCard icon="🎯" label="Band" value={profile.progression.bandStatus.currentBand} />
      <StatCard icon="📊" label="Accuracy" value={`${Math.round(profile.progression.bandStatus.recentPerformance.correctRate * 100)}%`} />
      <StatCard icon="⭐" label="XP Today" value="+45" />
    </div>
  </div>
)}
```

### Progress Tab

```typescript
{activeTab === 'progress' && (
  <div className="space-y-6">
    {/* Band Progression */}
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">Svårighetsgrad</h3>
      <BandProgressVisualization bandStatus={profile.progression.bandStatus} />
    </div>

    {/* Domain Gates */}
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">Domänprogress</h3>
      {Object.entries(profile.progression.domainStatuses).map(([domain, status]) => (
        <DomainCard
          key={domain}
          domain={domain}
          status={status}
          onStartOSCE={() => startMiniOSCE(domain)}
        />
      ))}
    </div>
  </div>
)}
```

### Analytics Tab (Combined)

```typescript
{activeTab === 'analytics' && (
  <div className="space-y-6">
    {/* Gamification Stats */}
    <div className="grid grid-cols-4 gap-4">
      <MetricCard label="Total XP" value={profile.gamification.xp} />
      <MetricCard label="Level" value={profile.gamification.level} />
      <MetricCard label="Badges" value={profile.gamification.badges.length} />
      <MetricCard label="Streak" value={profile.gamification.streak} />
    </div>

    {/* SRS Stats */}
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">Spaced Repetition</h3>
      <div className="grid grid-cols-3 gap-4">
        <SRSMetricCard
          label="Cards Due Today"
          value={profile.progression.srs.dueToday.length}
        />
        <SRSMetricCard
          label="Average Stability"
          value={`${Math.round(getAverageStability(profile.progression.srs.cards) * 100)}%`}
        />
        <SRSMetricCard
          label="Leech Cards"
          value={profile.progression.srs.leechCards.length}
        />
      </div>
    </div>

    {/* Band History */}
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">Band History</h3>
      <BandHistoryChart history={profile.progression.history.bandAdjustments} />
    </div>

    {/* Socialstyrelsen Progress */}
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">Socialstyrelsen Mål</h3>
      <SocialstyrelseMålChart progress={profile.socialstyrelseMålProgress} />
    </div>
  </div>
)}
```

---

## Phase 5: Roadmap Integration

### Connect Roadmap to Domain Gates

```typescript
// components/learning/IntegratedRoadmap.tsx
import { LearningRoadmap } from '@/types/learning';
import { DomainStatus } from '@/types/progression';

interface IntegratedRoadmapProps {
  domainStatuses: Record<Domain, DomainStatus>;
  onDomainClick: (domain: Domain) => void;
}

export default function IntegratedRoadmap({
  domainStatuses,
  onDomainClick,
}: IntegratedRoadmapProps) {
  return (
    <div className="space-y-8">
      {Object.entries(domainStatuses).map(([domain, status]) => (
        <DomainRoadmapCard
          key={domain}
          domain={domain}
          status={status}
          stages={[
            {
              id: 'foundation',
              name: 'Foundation',
              level: 'foundation',
              progress: calculateStageProgress(status, 'foundation'),
              unlocked: true,
            },
            {
              id: 'intermediate',
              name: 'Intermediate',
              level: 'intermediate',
              progress: calculateStageProgress(status, 'intermediate'),
              unlocked: status.gateProgress.complicationCasePassed,
            },
            {
              id: 'advanced',
              name: 'Advanced',
              level: 'advanced',
              progress: calculateStageProgress(status, 'advanced'),
              unlocked: status.gateProgress.miniOSCEPassed,
            },
            {
              id: 'mastery',
              name: 'Mastery',
              level: 'mastery',
              progress: calculateStageProgress(status, 'mastery'),
              unlocked: status.status === 'completed',
            },
          ]}
          onClick={() => onDomainClick(domain)}
        />
      ))}
    </div>
  );
}
```

---

## Phase 6: Content Mapping

### Map Existing Content to New System

```typescript
// utils/content-mapper.ts

interface MappedContent {
  id: string;
  type: 'microcase' | 'quiz' | 'pearl';
  domain: Domain;
  band: DifficultyBand;
  competencies: SubCompetency[];
  relatedGoals: string[];
  srsCard?: SRSCard;
}

export function mapContentToSRS(
  planItems: PlanItem[],
  userLevel: EducationLevel
): MappedContent[] {
  return planItems.map((item) => {
    // Determine band based on user level and item difficulty
    const band = determineContentBand(item, userLevel);

    // Extract competencies
    const competencies = extractCompetencies(item);

    // Link to Socialstyrelsen goals
    const relatedGoals = item.relatedGoals || [];

    // Create SRS card if applicable
    const srsCard = createSRSCard({
      id: `srs-${item.id}`,
      domain: item.domain || 'trauma',
      type: item.type,
      contentId: item.id,
      difficulty: getDifficultyScore(band),
      relatedGoals,
      competencies,
    });

    return {
      id: item.id,
      type: item.type,
      domain: item.domain || 'trauma',
      band,
      competencies,
      relatedGoals,
      srsCard,
    };
  });
}

function determineContentBand(
  item: PlanItem,
  userLevel: EducationLevel
): DifficultyBand {
  // Logic to determine band based on item complexity and user level
  const baseband = getStartingBand(userLevel);

  // Adjust based on item type
  if (item.type === 'pearl') return baseband;
  if (item.type === 'quiz') return baseband;
  if (item.type === 'microcase') {
    // Microcases can be harder
    return getHarderBand(baseband);
  }

  return baseband;
}

function extractCompetencies(item: PlanItem): SubCompetency[] {
  // Extract from item description/content
  const competencies: SubCompetency[] = [];

  if (item.type === 'quiz') competencies.push('diagnostik');
  if (item.type === 'microcase') competencies.push('akuta-flöden');
  if (item.description.includes('röntgen')) competencies.push('bildtolkning');
  if (item.description.includes('dokumentation')) competencies.push('dokumentation');

  return competencies.length > 0 ? competencies : ['diagnostik'];
}
```

---

## Phase 7: State Management

### Centralized State with Context

```typescript
// context/IntegratedContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface IntegratedContextType {
  profile: IntegratedUserProfile | null;
  dailyMix: DailyMix | null;
  updateProfile: (updates: Partial<IntegratedUserProfile>) => void;
  refreshDailyMix: () => void;
  completeSession: (results: SessionResults) => void;
  completeMiniOSCE: (result: OSCEResult) => void;
  requestRecovery: () => void;
}

const IntegratedContext = createContext<IntegratedContextType | undefined>(undefined);

export function IntegratedProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<IntegratedUserProfile | null>(null);
  const [dailyMix, setDailyMix] = useState<DailyMix | null>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ortokompanion_integrated_profile');
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (profile) {
      localStorage.setItem('ortokompanion_integrated_profile', JSON.stringify(profile));
    }
  }, [profile]);

  const updateProfile = (updates: Partial<IntegratedUserProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const refreshDailyMix = () => {
    if (!profile) return;

    const newMix = generateDailyMix({
      primaryDomain: profile.progression.primaryDomain,
      targetBand: profile.progression.bandStatus.currentBand,
      srsCards: profile.progression.srs.cards,
      availableNewContent: loadAvailableContent(),
      completedDomains: getCompletedDomains(profile.progression.domainStatuses),
      isRecoveryDay: profile.preferences?.recoveryMode || false,
      targetMinutes: profile.preferences?.targetMinutesPerDay || 8,
    });

    setDailyMix(newMix);
  };

  const completeSession = (results: SessionResults) => {
    // Implementation from Phase 3
    // ...
  };

  const completeMiniOSCE = (result: OSCEResult) => {
    if (!profile) return;

    // Update domain gate progress
    const domain = result.osceId.split('-')[0] as Domain;
    const domainStatus = profile.progression.domainStatuses[domain];

    if (result.passed) {
      domainStatus.gateProgress.miniOSCEPassed = true;
      domainStatus.gateProgress.miniOSCEScore = result.percentage;
      domainStatus.gateProgress.miniOSCEDate = new Date();

      // Check if domain complete
      if (isGateRequirementMet(domainStatus, profile.progression.srs.cards)) {
        domainStatus.status = 'completed';
        domainStatus.completedAt = new Date();
      }
    }

    profile.progression.history.osceResults.push(result);
    setProfile({ ...profile });
  };

  const requestRecovery = () => {
    if (!profile) return;

    // Activate recovery mode
    updateProfile({
      preferences: {
        ...profile.preferences,
        recoveryMode: true,
      },
    });

    // Regenerate daily mix with recovery settings
    refreshDailyMix();
  };

  return (
    <IntegratedContext.Provider
      value={{
        profile,
        dailyMix,
        updateProfile,
        refreshDailyMix,
        completeSession,
        completeMiniOSCE,
        requestRecovery,
      }}
    >
      {children}
    </IntegratedContext.Provider>
  );
}

export function useIntegrated() {
  const context = useContext(IntegratedContext);
  if (!context) {
    throw new Error('useIntegrated must be used within IntegratedProvider');
  }
  return context;
}
```

---

## Phase 8: Migration

### Migrate Existing Users

```typescript
// utils/migration.ts

export function migrateUserProfileToIntegrated(
  oldProfile: UserProfile,
  oldPlan: SevenDayPlan
): IntegratedUserProfile {
  // 1. Create band status based on current level
  const bandStatus = createInitialBandStatus(oldProfile.role);

  // 2. Infer primary domain from selected domains
  const primaryDomain = oldProfile.domains[0] || 'trauma';

  // 3. Create domain statuses
  const domainStatuses = createInitialDomainStatuses(primaryDomain, allDomains);

  // 4. Convert existing plan items to SRS cards
  const srsCards: SRSCard[] = [];
  oldPlan.days.forEach((day) => {
    day.items.forEach((item) => {
      if (item.completed) {
        // Create SRS card from completed item
        const card = createSRSCard({
          id: `srs-${item.id}`,
          domain: primaryDomain,
          type: item.type,
          contentId: item.id,
          difficulty: 0.5,
          relatedGoals: [],
          competencies: ['diagnostik'],
        });
        srsCards.push(card);
      }
    });
  });

  // 5. Migrate Socialstyrelsen progress if exists
  const socialstyrelseMålProgress: MålProgress[] = []; // Load from localStorage if exists

  // 6. Build integrated profile
  const integratedProfile: IntegratedUserProfile = {
    ...oldProfile,
    gamification: {
      ...oldProfile.gamification,
      freezeTokens: 0, // Add freeze tokens
    },
    progression: {
      primaryDomain,
      bandStatus,
      domainStatuses,
      srs: {
        cards: srsCards,
        dueToday: [],
        overdueCards: [],
        leechCards: [],
      },
      history: {
        bandAdjustments: [],
        osceResults: [],
        retentionChecks: [],
      },
    },
    socialstyrelseMålProgress,
  };

  return integratedProfile;
}
```

---

## Implementation Checklist

### Phase 1: Foundation ✅
- [x] Enhanced type definitions
- [x] SRS algorithm
- [x] Band system
- [x] Domain progression logic
- [x] Mini-OSCE data

### Phase 2: Core Integration (TODO)
- [ ] Enhanced UserProfile type
- [ ] Daily Mix generator integration
- [ ] EnhancedDailySession component
- [ ] Session completion handler
- [ ] SRS card updates

### Phase 3: UI Integration (TODO)
- [ ] Unified dashboard tabs
- [ ] Today view with daily mix
- [ ] Progress view with gates
- [ ] Analytics view (combined)
- [ ] Integrated roadmap

### Phase 4: Data & State (TODO)
- [ ] Content mapping utilities
- [ ] IntegratedContext provider
- [ ] localStorage schema update
- [ ] Migration script

### Phase 5: Testing & Polish (TODO)
- [ ] Unit tests for SRS
- [ ] Integration tests
- [ ] User migration testing
- [ ] Performance optimization
- [ ] Documentation

---

## Example: Complete User Journey

### Day 1
```
1. User completes onboarding → Creates integrated profile
2. System generates Day 1 mix (Band B, easier than ST1 default C)
3. User starts session:
   - READ: Ottawa Ankle Rules (Band B level)
   - QUIZ: 3 questions with hints available
   - REVIEW: 0 SRS cards (first day)
   - SUMMARY: +35 XP, Streak 1, Band B
4. System creates 3 SRS cards from session
5. User sees progress: 0% domain completion, 1/4 gates
```

### Day 2-3
```
1. System generates new mix (still Band B, building confidence)
2. User starts session:
   - READ: New höft content
   - QUIZ: 3 new questions
   - REVIEW: 2 SRS cards from Day 1
   - SUMMARY: +38 XP, Streak 2
3. SRS cards updated with new intervals
4. After Day 3: Band promotion check → Move to Band C!
```

### Week 2
```
1. User on Band C now, more challenging content
2. 10+ items completed in höft domain
3. Complication case (Band D) passed ✓
4. System shows: "Ready for Mini-OSCE!"
5. User takes Höft Mini-OSCE → 82% Pass! ✅
6. Gate 1/4 complete
```

### Week 3
```
1. SRS: 15 cards, avg stability 0.72
2. System: "Retention check scheduled in 7 days"
3. User continues with interleaving (Knä content)
4. Retention check → Pass! ✅
5. Gate 2/4 complete
```

### Week 4
```
1. All 4 gates complete! 🎉
2. Domain höft: COMPLETED
3. System suggests next: Knä (neighbor) or Rygg
4. User chooses Knä
5. New daily mix: 60% Knä, 20% Höft (recall), 20% SRS
6. Band stays at C for new domain
```

---

## Performance Considerations

### Optimizations

1. **Lazy Loading:**
   ```typescript
   // Load SRS cards on demand
   const srsCards = useMemo(() =>
     loadSRSCards(profile.progression.srs.cardIds),
     [profile.progression.srs.cardIds]
   );
   ```

2. **Debounced Saves:**
   ```typescript
   const debouncedSave = useDebounce((profile) => {
     localStorage.setItem('profile', JSON.stringify(profile));
   }, 1000);
   ```

3. **Background Processing:**
   ```typescript
   // Calculate daily mix in background
   useEffect(() => {
     const worker = new Worker('/workers/daily-mix-generator.js');
     worker.postMessage({ profile, date: new Date() });
     worker.onmessage = (e) => setDailyMix(e.data);
   }, [profile]);
   ```

---

## Conclusion

This integration guide provides a complete blueprint for merging both systems into a unified, powerful learning platform that combines:

- ✅ Evidence-based spaced repetition
- ✅ Adaptive difficulty progression
- ✅ Gamification & motivation
- ✅ Official Socialstyrelsen goals
- ✅ Comprehensive analytics
- ✅ Domain mastery tracking

**Next Steps:**
1. Implement Phase 2 (Core Integration)
2. Test with pilot users
3. Iterate based on feedback
4. Scale to full deployment

**Estimated Implementation Time:** 2-3 weeks for full integration

---

**Version:** 1.0
**Status:** Complete Blueprint
**Maintained by:** OrtoKompanion Team
