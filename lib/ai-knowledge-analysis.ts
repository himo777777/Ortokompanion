/**
 * AI-Driven Knowledge Gap Analysis System
 *
 * Analyzes user performance to identify knowledge gaps and provide
 * personalized learning recommendations
 */

import { MCQQuestion } from '@/data/questions';
import { ClinicalPearl } from '@/data/clinical-pearls';
import { Domain } from '@/types/onboarding';
import { EducationLevel } from '@/types/education';
import { DifficultyBand } from '@/types/progression';

// =============================================================================
// TYPES
// =============================================================================

export interface UserPerformanceData {
  userId: string;
  questionAttempts: QuestionAttempt[];
  caseAttempts: CaseAttempt[];
  osceAttempts: OsceAttempt[];
  studyTime: StudyTimeData[];
}

export interface QuestionAttempt {
  questionId: string;
  domain: Domain;
  band: DifficultyBand;
  level: EducationLevel;
  correct: boolean;
  timeSpent: number; // seconds
  timestamp: Date;
  confidenceRating?: 1 | 2 | 3 | 4 | 5; // User's confidence before answer
}

export interface CaseAttempt {
  caseId: string;
  score: number;
  maxScore: number;
  timeSpent: number;
  timestamp: Date;
}

export interface OsceAttempt {
  osceId: string;
  domain: Domain;
  score: number;
  passed: boolean;
  timestamp: Date;
}

export interface StudyTimeData {
  domain: Domain;
  minutesSpent: number;
  date: Date;
}

export interface KnowledgeGap {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  domain: Domain;
  band?: DifficultyBand;
  topic: string;
  description: string;
  evidencePoints: string[];
  recommendations: Recommendation[];
  priority: number; // 1-100
}

export interface Recommendation {
  type: 'question' | 'case' | 'pearl' | 'osce' | 'article' | 'video' | 'protocol' | 'study-group';
  title: string;
  description: string;
  resourceId?: string;
  externalUrl?: string;
  estimatedTime: number; // minutes
  priority: number;
}

export interface LearningPath {
  userId: string;
  generatedAt: Date;
  currentLevel: EducationLevel;
  targetLevel: EducationLevel;
  knowledgeGaps: KnowledgeGap[];
  dailyRecommendations: Recommendation[];
  weeklyGoals: WeeklyGoal[];
  estimatedCompletionWeeks: number;
}

export interface WeeklyGoal {
  week: number;
  focus: string;
  domains: Domain[];
  targetQuestions: number;
  targetCases: number;
  milestones: string[];
}

// =============================================================================
// KNOWLEDGE GAP DETECTION ENGINE
// =============================================================================

export class KnowledgeGapAnalyzer {

  /**
   * Analyze user performance and identify knowledge gaps
   */
  static analyzePerformance(data: UserPerformanceData): KnowledgeGap[] {
    const gaps: KnowledgeGap[] = [];

    // 1. Analyze question performance by domain and band
    const domainPerformance = this.analyzeDomainPerformance(data.questionAttempts);

    for (const [domain, stats] of Object.entries(domainPerformance)) {
      // Critical gap: <50% correct on multiple attempts
      if (stats.totalAttempts >= 5 && stats.correctRate < 0.5) {
        gaps.push({
          id: `gap-${domain}-critical`,
          severity: 'critical',
          domain: domain as Domain,
          topic: `${domain} - Grundläggande kunskap`,
          description: `Endast ${(stats.correctRate * 100).toFixed(0)}% rätt på ${stats.totalAttempts} frågor. Kritisk kunskapslucka.`,
          evidencePoints: [
            `Svarsfrekvens: ${(stats.correctRate * 100).toFixed(0)}%`,
            `Antal försök: ${stats.totalAttempts}`,
            `Genomsnittlig tid: ${stats.avgTimeSpent}s (${stats.avgTimeSpent > 120 ? 'långsam' : 'normal'})`
          ],
          recommendations: this.generateRecommendations(domain as Domain, 'critical', stats),
          priority: 95
        });
      }

      // High gap: <70% correct
      else if (stats.totalAttempts >= 3 && stats.correctRate < 0.7) {
        gaps.push({
          id: `gap-${domain}-high`,
          severity: 'high',
          domain: domain as Domain,
          topic: `${domain} - Förbättringsområde`,
          description: `${(stats.correctRate * 100).toFixed(0)}% rätt. Behöver mer träning.`,
          evidencePoints: [
            `Svarsfrekvens: ${(stats.correctRate * 100).toFixed(0)}%`,
            `Antal försök: ${stats.totalAttempts}`
          ],
          recommendations: this.generateRecommendations(domain as Domain, 'high', stats),
          priority: 75
        });
      }
    }

    // 2. Analyze band-specific weaknesses
    const bandPerformance = this.analyzeBandPerformance(data.questionAttempts);

    for (const [band, stats] of Object.entries(bandPerformance)) {
      if (stats.totalAttempts >= 5 && stats.correctRate < 0.6) {
        gaps.push({
          id: `gap-band-${band}`,
          severity: 'high',
          domain: this.getMostProblematicDomain(data.questionAttempts, band as DifficultyBand),
          band: band as DifficultyBand,
          topic: `Band ${band} - Svårighetsgrad`,
          description: `Svårigheter med Band ${band} frågor (${(stats.correctRate * 100).toFixed(0)}% rätt).`,
          evidencePoints: [
            `Band ${band} svarsfrekvens: ${(stats.correctRate * 100).toFixed(0)}%`,
            `Jämfört med genomsnitt: ${((stats.correctRate - this.getOverallCorrectRate(data.questionAttempts)) * 100).toFixed(0)}%`
          ],
          recommendations: this.generateBandRecommendations(band as DifficultyBand),
          priority: 70
        });
      }
    }

    // 3. Identify confidence-accuracy mismatch (Dunning-Kruger detection)
    const confidenceMismatch = this.analyzeConfidenceMismatch(data.questionAttempts);

    if (confidenceMismatch.overconfident) {
      gaps.push({
        id: 'gap-overconfidence',
        severity: 'medium',
        domain: confidenceMismatch.domain,
        topic: 'Överskattad kompetens',
        description: 'Hög självsäkerhet men låg träffsäkerhet. Risk för kliniska misstag.',
        evidencePoints: [
          `Genomsnittlig självskattad säkerhet: ${confidenceMismatch.avgConfidence}/5`,
          `Faktisk träffsäkerhet: ${(confidenceMismatch.actualCorrectRate * 100).toFixed(0)}%`,
          'Detta mönster indikerar behov av mer djupgående förståelse'
        ],
        recommendations: [
          {
            type: 'case',
            title: 'Komplexa fallstudier',
            description: 'Träna på svåra kliniska fall för att förbättra självinsikt',
            estimatedTime: 30,
            priority: 80
          }
        ],
        priority: 65
      });
    }

    // 4. Identify neglected domains (low study time)
    const neglectedDomains = this.identifyNeglectedDomains(data.studyTime);

    for (const domain of neglectedDomains) {
      gaps.push({
        id: `gap-neglected-${domain}`,
        severity: 'medium',
        domain,
        topic: `${domain} - Försummad`,
        description: 'Mycket lite studietid spenderad på detta område.',
        evidencePoints: [
          `Studietid senaste månaden: < 30 minuter`,
          'Rekommendation: Balansera din utbildning mellan alla subspecialiteter'
        ],
        recommendations: this.generateIntroRecommendations(domain),
        priority: 50
      });
    }

    // 5. OSCE failures
    const failedOsces = data.osceAttempts.filter(a => !a.passed);

    for (const osce of failedOsces) {
      gaps.push({
        id: `gap-osce-${osce.osceId}`,
        severity: 'high',
        domain: osce.domain,
        topic: `${osce.domain} - Klinisk bedömning`,
        description: `Underkänd Mini-OSCE. Kliniska färdigheter behöver förbättras.`,
        evidencePoints: [
          `OSCE-poäng: ${osce.score} (<80% gräns)`,
          'Fokusera på systematisk undersökning och akut handläggning'
        ],
        recommendations: this.generateOsceRecommendations(osce.domain),
        priority: 85
      });
    }

    // Sort by priority
    return gaps.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Generate personalized learning path
   */
  static generateLearningPath(
    userId: string,
    currentLevel: EducationLevel,
    data: UserPerformanceData
  ): LearningPath {
    const gaps = this.analyzePerformance(data);
    const targetLevel = this.getNextLevel(currentLevel);

    return {
      userId,
      generatedAt: new Date(),
      currentLevel,
      targetLevel,
      knowledgeGaps: gaps,
      dailyRecommendations: this.generateDailyRecommendations(gaps, data),
      weeklyGoals: this.generateWeeklyGoals(gaps, currentLevel),
      estimatedCompletionWeeks: this.estimateCompletionTime(gaps, currentLevel)
    };
  }

  // =============================================================================
  // RECOMMENDATION GENERATORS
  // =============================================================================

  private static generateRecommendations(
    domain: Domain,
    severity: 'critical' | 'high' | 'medium' | 'low',
    stats: any
  ): Recommendation[] {
    const recs: Recommendation[] = [];

    // 1. Targeted questions
    recs.push({
      type: 'question',
      title: `${domain} - Träningsfrågor`,
      description: `20 fokuserade frågor på ${domain} för att stärka grunderna`,
      resourceId: `questions-${domain}-targeted`,
      estimatedTime: 30,
      priority: 90
    });

    // 2. Clinical pearls
    recs.push({
      type: 'pearl',
      title: `${domain} - Kliniska pärlor`,
      description: 'Viktiga kliniska tips och misstag att undvika',
      resourceId: `pearls-${domain}`,
      estimatedTime: 10,
      priority: 85
    });

    // 3. Ortoportal article
    recs.push({
      type: 'article',
      title: `${domain} - Översiktsartikel`,
      description: 'Läs evidensbaserad artikel från Ortoportal',
      externalUrl: `https://ortoportal.se/articles/${domain}`,
      estimatedTime: 20,
      priority: 80
    });

    // 4. Video demonstration
    recs.push({
      type: 'video',
      title: `${domain} - Videodemonstration`,
      description: 'Se kirurgiska tekniker och klinisk undersökning',
      externalUrl: `https://ortoportal.se/videos/${domain}`,
      estimatedTime: 15,
      priority: 75
    });

    // 5. Protocol/beslutsstöd
    if (severity === 'critical') {
      recs.push({
        type: 'protocol',
        title: `${domain} - Akutprotokoll`,
        description: 'Studera akuta handläggningsprotokoll',
        externalUrl: `https://ortoportal.se/protocols/${domain}`,
        estimatedTime: 15,
        priority: 95
      });
    }

    // 6. Study group
    recs.push({
      type: 'study-group',
      title: `${domain} - Studiegrupp`,
      description: 'Gå med i studiegrupp för att diskutera svåra fall',
      externalUrl: `https://ortoportal.se/groups/${domain}`,
      estimatedTime: 60,
      priority: 70
    });

    return recs;
  }

  private static generateBandRecommendations(band: DifficultyBand): Recommendation[] {
    const bandDescriptions = {
      'A': 'grundläggande faktakunskap',
      'B': 'orientering och förståelse',
      'C': 'tillämpning i kliniken',
      'D': 'analys och differentialdiagnostik',
      'E': 'syntes och avancerad bedömning'
    };

    return [
      {
        type: 'question',
        title: `Band ${band} - Fokuserade frågor`,
        description: `Träna ${bandDescriptions[band]} med riktade frågor`,
        estimatedTime: 25,
        priority: 85
      },
      {
        type: 'case',
        title: `Band ${band} - Fallstudier`,
        description: `Komplexa case för att träna ${bandDescriptions[band]}`,
        estimatedTime: 40,
        priority: 80
      }
    ];
  }

  private static generateOsceRecommendations(domain: Domain): Recommendation[] {
    return [
      {
        type: 'osce',
        title: `${domain} - Mini-OSCE repetition`,
        description: 'Repetera Mini-OSCE med fokus på systematisk bedömning',
        resourceId: `osce-${domain}`,
        estimatedTime: 20,
        priority: 90
      },
      {
        type: 'video',
        title: `${domain} - Klinisk undersökning`,
        description: 'Video som visar korrekt undersökningsteknik steg-för-steg',
        externalUrl: `https://ortoportal.se/videos/${domain}-examination`,
        estimatedTime: 15,
        priority: 85
      },
      {
        type: 'protocol',
        title: `${domain} - Handläggningsprotokoll`,
        description: 'Studera akuta bedömnings- och handläggningsprotokoll',
        externalUrl: `https://ortoportal.se/protocols/${domain}`,
        estimatedTime: 20,
        priority: 80
      }
    ];
  }

  private static generateIntroRecommendations(domain: Domain): Recommendation[] {
    return [
      {
        type: 'article',
        title: `${domain} - Introduktion`,
        description: 'Börja med en översiktsartikel för att bygga grundförståelse',
        externalUrl: `https://ortoportal.se/intro/${domain}`,
        estimatedTime: 20,
        priority: 70
      },
      {
        type: 'pearl',
        title: `${domain} - Grundläggande pearls`,
        description: 'Lär dig de viktigaste kliniska pärlorna inom området',
        resourceId: `pearls-${domain}-basic`,
        estimatedTime: 10,
        priority: 65
      },
      {
        type: 'question',
        title: `${domain} - Enkla frågor`,
        description: 'Starta med Band A-B frågor för att bygga självförtroende',
        resourceId: `questions-${domain}-basic`,
        estimatedTime: 15,
        priority: 60
      }
    ];
  }

  private static generateDailyRecommendations(
    gaps: KnowledgeGap[],
    data: UserPerformanceData
  ): Recommendation[] {
    const daily: Recommendation[] = [];

    // 1. Address highest priority gap
    if (gaps.length > 0) {
      const topGap = gaps[0];
      daily.push(...topGap.recommendations.slice(0, 2));
    }

    // 2. Add variety
    daily.push({
      type: 'pearl',
      title: 'Dagens kliniska pärla',
      description: 'En viktig klinisk insikt från valfritt område',
      estimatedTime: 5,
      priority: 50
    });

    // 3. Review weak areas
    if (gaps.length > 1) {
      const secondGap = gaps[1];
      daily.push(secondGap.recommendations[0]);
    }

    return daily.slice(0, 5); // Max 5 recommendations per day
  }

  private static generateWeeklyGoals(
    gaps: KnowledgeGap[],
    level: EducationLevel
  ): WeeklyGoal[] {
    const weeks: WeeklyGoal[] = [];
    const topGaps = gaps.slice(0, 4); // Focus on top 4 gaps

    topGaps.forEach((gap, index) => {
      weeks.push({
        week: index + 1,
        focus: gap.topic,
        domains: [gap.domain],
        targetQuestions: 20,
        targetCases: 3,
        milestones: [
          `Uppnå >70% träffsäkerhet på ${gap.domain} frågor`,
          `Genomför Mini-OSCE för ${gap.domain}`,
          `Läs minst 2 artiklar från Ortoportal`
        ]
      });
    });

    return weeks;
  }

  // =============================================================================
  // ANALYSIS HELPERS
  // =============================================================================

  private static analyzeDomainPerformance(attempts: QuestionAttempt[]): Record<string, any> {
    const domainStats: Record<string, any> = {};

    attempts.forEach(attempt => {
      if (!domainStats[attempt.domain]) {
        domainStats[attempt.domain] = {
          totalAttempts: 0,
          correct: 0,
          totalTime: 0
        };
      }

      domainStats[attempt.domain].totalAttempts++;
      if (attempt.correct) domainStats[attempt.domain].correct++;
      domainStats[attempt.domain].totalTime += attempt.timeSpent;
    });

    // Calculate rates
    for (const domain in domainStats) {
      const stats = domainStats[domain];
      stats.correctRate = stats.correct / stats.totalAttempts;
      stats.avgTimeSpent = Math.round(stats.totalTime / stats.totalAttempts);
    }

    return domainStats;
  }

  private static analyzeBandPerformance(attempts: QuestionAttempt[]): Record<string, any> {
    const bandStats: Record<string, any> = {};

    attempts.forEach(attempt => {
      if (!bandStats[attempt.band]) {
        bandStats[attempt.band] = {
          totalAttempts: 0,
          correct: 0
        };
      }

      bandStats[attempt.band].totalAttempts++;
      if (attempt.correct) bandStats[attempt.band].correct++;
    });

    // Calculate rates
    for (const band in bandStats) {
      const stats = bandStats[band];
      stats.correctRate = stats.correct / stats.totalAttempts;
    }

    return bandStats;
  }

  private static analyzeConfidenceMismatch(attempts: QuestionAttempt[]): any {
    const withConfidence = attempts.filter(a => a.confidenceRating !== undefined);

    if (withConfidence.length < 10) {
      return { overconfident: false };
    }

    const avgConfidence = withConfidence.reduce((sum, a) => sum + (a.confidenceRating || 0), 0) / withConfidence.length;
    const correctRate = withConfidence.filter(a => a.correct).length / withConfidence.length;

    // Overconfident if high confidence (>3.5) but low accuracy (<0.6)
    const overconfident = avgConfidence > 3.5 && correctRate < 0.6;

    return {
      overconfident,
      avgConfidence,
      actualCorrectRate: correctRate,
      domain: this.getMostFrequentDomain(withConfidence)
    };
  }

  private static identifyNeglectedDomains(studyTime: StudyTimeData[]): Domain[] {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentStudy = studyTime.filter(s => s.date >= last30Days);
    const domainTime: Record<string, number> = {};

    recentStudy.forEach(s => {
      domainTime[s.domain] = (domainTime[s.domain] || 0) + s.minutesSpent;
    });

    // Domains with <30 minutes in last 30 days
    const allDomains: Domain[] = ['trauma', 'höft', 'fot-fotled', 'hand-handled', 'knä', 'axel-armbåge', 'rygg', 'sport', 'tumör'];

    return allDomains.filter(d => (domainTime[d] || 0) < 30);
  }

  private static getMostProblematicDomain(attempts: QuestionAttempt[], band: DifficultyBand): Domain {
    const bandAttempts = attempts.filter(a => a.band === band);
    const domainCorrectRate: Record<string, number> = {};

    bandAttempts.forEach(a => {
      if (!domainCorrectRate[a.domain]) {
        domainCorrectRate[a.domain] = 0;
      }
      if (a.correct) domainCorrectRate[a.domain]++;
    });

    // Find domain with lowest correct rate
    let minDomain: Domain = 'trauma';
    let minRate = 1;

    for (const domain in domainCorrectRate) {
      const rate = domainCorrectRate[domain] / bandAttempts.filter(a => a.domain === domain).length;
      if (rate < minRate) {
        minRate = rate;
        minDomain = domain as Domain;
      }
    }

    return minDomain;
  }

  private static getMostFrequentDomain(attempts: QuestionAttempt[]): Domain {
    const counts: Record<string, number> = {};

    attempts.forEach(a => {
      counts[a.domain] = (counts[a.domain] || 0) + 1;
    });

    let maxDomain: Domain = 'trauma';
    let maxCount = 0;

    for (const domain in counts) {
      if (counts[domain] > maxCount) {
        maxCount = counts[domain];
        maxDomain = domain as Domain;
      }
    }

    return maxDomain;
  }

  private static getOverallCorrectRate(attempts: QuestionAttempt[]): number {
    if (attempts.length === 0) return 0;
    return attempts.filter(a => a.correct).length / attempts.length;
  }

  private static getNextLevel(current: EducationLevel): EducationLevel {
    const levels: EducationLevel[] = ['student', 'at', 'st1', 'st2', 'st3', 'st4', 'st5', 'specialist-ortopedi'];
    const currentIndex = levels.indexOf(current);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : current;
  }

  private static estimateCompletionTime(gaps: KnowledgeGap[], level: EducationLevel): number {
    // Estimate based on number and severity of gaps
    const criticalGaps = gaps.filter(g => g.severity === 'critical').length;
    const highGaps = gaps.filter(g => g.severity === 'high').length;

    // Critical gaps need ~3 weeks each, high gaps ~2 weeks
    const weeks = (criticalGaps * 3) + (highGaps * 2) + Math.ceil(gaps.length / 2);

    return Math.min(weeks, 52); // Cap at 1 year
  }
}

// =============================================================================
// SMART RECOMMENDATIONS ENGINE
// =============================================================================

export class SmartRecommendationEngine {

  /**
   * Get contextual recommendations based on user action
   */
  static getContextualRecommendations(
    context: {
      action: 'answered_question' | 'completed_case' | 'failed_osce' | 'studying_domain';
      questionId?: string;
      domain?: Domain;
      correct?: boolean;
      score?: number;
    }
  ): Recommendation[] {
    const recs: Recommendation[] = [];

    if (context.action === 'answered_question' && !context.correct) {
      // Wrong answer - provide immediate help
      recs.push({
        type: 'pearl',
        title: 'Relaterad klinisk pärla',
        description: 'Lär dig det viktiga konceptet från denna fråga',
        estimatedTime: 5,
        priority: 95
      });

      recs.push({
        type: 'article',
        title: 'Fördjupning',
        description: 'Läs mer om detta ämne på Ortoportal',
        externalUrl: `https://ortoportal.se/articles/${context.domain}`,
        estimatedTime: 15,
        priority: 90
      });
    }

    if (context.action === 'failed_osce') {
      recs.push({
        type: 'video',
        title: 'OSCE-teknik video',
        description: 'Se hur expert utför denna kliniska bedömning',
        externalUrl: `https://ortoportal.se/videos/${context.domain}-osce`,
        estimatedTime: 10,
        priority: 100
      });

      recs.push({
        type: 'protocol',
        title: 'Akutprotokoll',
        description: 'Studera handläggningsprotokoll för denna situation',
        externalUrl: `https://ortoportal.se/protocols/${context.domain}`,
        estimatedTime: 15,
        priority: 95
      });
    }

    if (context.action === 'studying_domain') {
      recs.push({
        type: 'study-group',
        title: `${context.domain} Studiegrupp`,
        description: 'Diskutera svåra fall med andra ST-läkare',
        externalUrl: `https://ortoportal.se/groups/${context.domain}`,
        estimatedTime: 60,
        priority: 70
      });
    }

    return recs;
  }

  /**
   * Generate "Next Best Action" recommendation
   */
  static getNextBestAction(
    learningPath: LearningPath,
    currentTime: Date
  ): Recommendation {
    // Get highest priority gap
    const topGap = learningPath.knowledgeGaps[0];

    if (!topGap) {
      // No gaps - continue with general study
      return {
        type: 'question',
        title: 'Fortsätt träna',
        description: 'Du gör det bra! Fortsätt med fler frågor för att underhålla din kunskap',
        estimatedTime: 20,
        priority: 50
      };
    }

    // Return top recommendation from top gap
    return topGap.recommendations[0];
  }
}
