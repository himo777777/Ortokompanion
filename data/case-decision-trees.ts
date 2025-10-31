/**
 * Interactive Decision Tree Case Studies
 * Branching clinical scenarios with multiple pathways
 * Teaches decision-making through consequences
 */

import { EducationLevel } from '@/types/education';
import { Domain } from '@/types/onboarding';

/**
 * Decision Node - A single decision point in the case
 */
export interface DecisionNode {
  id: string;
  nodeType: 'scenario' | 'decision' | 'outcome';

  // Content
  title: string;
  scenario: string; // What's happening now
  clinicalFindings?: string[]; // Vital signs, exam findings
  imagingFindings?: string[]; // X-ray, CT findings
  labResults?: string[]; // Relevant lab values

  // Decision (if nodeType === 'decision')
  decision?: string; // What must the user decide?
  options?: DecisionOption[];

  // Outcome (if nodeType === 'outcome')
  outcome?: {
    type: 'success' | 'suboptimal' | 'failure' | 'catastrophic';
    title: string;
    description: string;
    learningPoints: string[];
    whatWentRight?: string[];
    whatWentWrong?: string[];
  };

  // Metadata
  timeElapsed?: string; // "2 hours later", "Day 3 post-op"
  isTerminal: boolean; // Is this an end node?
}

/**
 * Decision Option - A choice the user can make
 */
export interface DecisionOption {
  id: string;
  text: string; // Option text
  shortLabel?: string; // For buttons (e.g., "ORIF", "Konservativ")

  // Navigation
  nextNodeId: string | null; // Next node or null if terminal

  // Feedback
  consequence: string; // Immediate consequence
  clinicalReasoning: string; // Why is this right/wrong?
  isOptimal: boolean; // Is this the best choice?
  isAcceptable: boolean; // Is this acceptable?

  // Scoring
  clinicalAccuracyPoints: number; // 0-100
  safetyPoints: number; // 0-100 (patient safety)
  efficiencyPoints: number; // 0-100 (resource use)

  // XP reward
  xpReward: number;
}

/**
 * Complete Decision Tree Case
 */
export interface ClinicalDecisionCase {
  id: string;
  title: string;
  level: EducationLevel;
  domain: Domain;

  // Metadata
  estimatedTime: number; // minutes
  difficulty: 'basic' | 'intermediate' | 'advanced' | 'expert';
  maxDecisions: number; // Maximum possible decision points
  optimalPathLength: number; // Fewest decisions to best outcome

  // Content
  introduction: string;
  startNodeId: string;
  nodes: Record<string, DecisionNode>; // Node ID -> Node

  // Learning objectives
  relatedGoals?: string[]; // Socialstyrelsen goal IDs
  competencies: string[];
  tags: string[];
  references?: string[];

  // Scoring rubric
  scoring: {
    maxClinicalAccuracy: number;
    maxSafety: number;
    maxEfficiency: number;
    passingThreshold: number; // % needed to pass
  };
}

/**
 * User's path through a decision tree
 */
export interface DecisionPath {
  caseId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;

  // Path taken
  nodesVisited: string[];
  decisionsMade: Array<{
    nodeId: string;
    optionId: string;
    timestamp: Date;
    timeSpent: number; // seconds
  }>;

  // Final outcome
  outcomeNodeId?: string;
  outcomeType?: 'success' | 'suboptimal' | 'failure' | 'catastrophic';

  // Scoring
  scores: {
    clinicalAccuracy: number;
    safety: number;
    efficiency: number;
    total: number;
    percentage: number;
  };

  // Performance
  totalTimeSpent: number; // seconds
  decisionsCount: number;
  optimalDecisions: number;
  suboptimalDecisions: number;
  passed: boolean;
  xpEarned: number;
}

/**
 * Example Decision Tree Case: Ankle Fracture
 * Student level - Basic ORIF vs Conservative decision
 */
export const ANKLE_FRACTURE_CASE: ClinicalDecisionCase = {
  id: 'dt-ankle-001',
  title: 'Ankel fraktur - Behandlingsbeslut',
  level: 'st1',
  domain: 'trauma',
  estimatedTime: 8,
  difficulty: 'intermediate',
  maxDecisions: 4,
  optimalPathLength: 3,
  introduction: 'En 35-årig kvinna kommer till akuten efter vridtrauma mot vänster fotled vid löpning.',
  startNodeId: 'node-001',
  relatedGoals: ['st1-01', 'st1-04'],
  competencies: ['diagnostik', 'akuta-flöden', 'operativa-principer'],
  tags: ['fotledsfraktur', 'Weber', 'ORIF', 'konservativ'],
  references: ['rockwood-9ed', 'atls-sverige-2022'],

  scoring: {
    maxClinicalAccuracy: 300,
    maxSafety: 200,
    maxEfficiency: 100,
    passingThreshold: 70,
  },

  nodes: {
    'node-001': {
      id: 'node-001',
      nodeType: 'scenario',
      title: 'Initial bedömning',
      scenario: 'Patient rapporterar smärta och svullnad efter vridtrauma. Kan inte belasta foten.',
      clinicalFindings: [
        'Svullnad lateralt över fotled',
        'Ömhet över laterala malleolen',
        'Perifer cirkulation intakt',
        'Sensorik intakt'
      ],
      isTerminal: false,
      decision: 'Vad är ditt nästa steg?',
      options: [
        {
          id: 'opt-001-a',
          text: 'Beställ röntgen enligt Ottawa Ankle Rules',
          shortLabel: 'Röntgen',
          nextNodeId: 'node-002',
          consequence: 'Du beställer röntgen av fotled i 2 plan.',
          clinicalReasoning: 'Korrekt! Ottawa Ankle Rules indikerar röntgen vid ömhet över malleol och oförmåga att belasta.',
          isOptimal: true,
          isAcceptable: true,
          clinicalAccuracyPoints: 100,
          safetyPoints: 100,
          efficiencyPoints: 100,
          xpReward: 20,
        },
        {
          id: 'opt-001-b',
          text: 'Gipsa direkt utan röntgen',
          shortLabel: 'Gipsa',
          nextNodeId: 'node-fail-001',
          consequence: 'Du gipsar foten utan bilddiagnostik.',
          clinicalReasoning: 'Felaktigt! Du måste röntga för att bedöma frakturtyp och dislokation före behandling.',
          isOptimal: false,
          isAcceptable: false,
          clinicalAccuracyPoints: 20,
          safetyPoints: 30,
          efficiencyPoints: 50,
          xpReward: 5,
        },
        {
          id: 'opt-001-c',
          text: 'Hemgång med NSAID och råd',
          shortLabel: 'Hemgång',
          nextNodeId: 'node-fail-002',
          consequence: 'Du skickar hem patienten med smärtstillande.',
          clinicalReasoning: 'Felaktigt! Ottawa Ankle Rules indikerar röntgen. Du missar potentiell fraktur.',
          isOptimal: false,
          isAcceptable: false,
          clinicalAccuracyPoints: 10,
          safetyPoints: 20,
          efficiencyPoints: 80,
          xpReward: 0,
        },
      ],
    },

    'node-002': {
      id: 'node-002',
      nodeType: 'decision',
      title: 'Röntgenfynd',
      scenario: 'Röntgenbilderna visar en Weber B-fraktur med 3mm dislokation av fibula.',
      imagingFindings: [
        'Weber B-fraktur (fraktur på nivå med syndesmosen)',
        '3mm lateral dislokation',
        'Talus centered i mortisen',
        'Ingen medial malleolfraktur'
      ],
      timeElapsed: '1 timme senare',
      isTerminal: false,
      decision: 'Hur vill du behandla denna fraktur?',
      options: [
        {
          id: 'opt-002-a',
          text: 'ORIF - Öppen reposition och intern fixation',
          shortLabel: 'ORIF',
          nextNodeId: 'node-003-orif',
          consequence: 'Du planerar för operation med plateosteosyntesteknik.',
          clinicalReasoning: 'Korrekt! Weber B med >2mm dislokation bör opereras för anatomisk reposition.',
          isOptimal: true,
          isAcceptable: true,
          clinicalAccuracyPoints: 100,
          safetyPoints: 100,
          efficiencyPoints: 80,
          xpReward: 30,
        },
        {
          id: 'opt-002-b',
          text: 'Konservativ behandling med underbensgips',
          shortLabel: 'Gips',
          nextNodeId: 'node-003-gips',
          consequence: 'Du anlägger ett cirkulärt underbensgips.',
          clinicalReasoning: 'Suboptimalt. Med 3mm dislokation finns risk för artros. Många kirurger hade opererat.',
          isOptimal: false,
          isAcceptable: true,
          clinicalAccuracyPoints: 60,
          safetyPoints: 70,
          efficiencyPoints: 100,
          xpReward: 15,
        },
        {
          id: 'opt-002-c',
          text: 'MRT för att bedöma ligamentskada',
          shortLabel: 'MRT',
          nextNodeId: 'node-suboptimal-001',
          consequence: 'Du beställer MRT av fotleden.',
          clinicalReasoning: 'Överdiagnostik. MRT behövs inte för behandlingsbeslut vid tydlig Weber B-fraktur.',
          isOptimal: false,
          isAcceptable: false,
          clinicalAccuracyPoints: 40,
          safetyPoints: 90,
          efficiencyPoints: 20,
          xpReward: 5,
        },
      ],
    },

    'node-003-orif': {
      id: 'node-003-orif',
      nodeType: 'decision',
      title: 'Postoperativ kontroll',
      scenario: 'Operation genomförd med platta och skruvar. God reposition enligt postop rtg.',
      timeElapsed: 'Dag 1 postoperativt',
      clinicalFindings: [
        'Sår väl tilläkt',
        'Perifer cirkulation god',
        'Motorik intakt',
        'VAS smärta 4/10'
      ],
      imagingFindings: [
        'Anatomisk reposition',
        'Platta + 6 kortikala skruvar',
        'Tibiofibulart clear space normalt'
      ],
      isTerminal: false,
      decision: 'Postoperativ plan?',
      options: [
        {
          id: 'opt-003-a',
          text: 'Ortos + ingen belastning i 6 veckor, därefter progressiv belastning',
          shortLabel: 'Standard rehab',
          nextNodeId: 'node-success-001',
          consequence: 'Du ordinerar ortos och standardiserat rehab-program.',
          clinicalReasoning: 'Optimalt! Standard postoperativ behandling för stabil ORIF.',
          isOptimal: true,
          isAcceptable: true,
          clinicalAccuracyPoints: 100,
          safetyPoints: 100,
          efficiencyPoints: 100,
          xpReward: 30,
        },
        {
          id: 'opt-003-b',
          text: 'Gips i 8 veckor + ingen belastning',
          shortLabel: 'Gips 8v',
          nextNodeId: 'node-suboptimal-002',
          consequence: 'Du anlägger gips för 8 veckor.',
          clinicalReasoning: 'För restriktivt. Vid stabil ORIF räcker ortos. Gips ger ökad styvhet.',
          isOptimal: false,
          isAcceptable: true,
          clinicalAccuracyPoints: 70,
          safetyPoints: 100,
          efficiencyPoints: 50,
          xpReward: 15,
        },
        {
          id: 'opt-003-c',
          text: 'Full belastning direkt',
          shortLabel: 'Direkt belastning',
          nextNodeId: 'node-fail-003',
          consequence: 'Du tillåter omedelbar full belastning.',
          clinicalReasoning: 'Farligt! Risk för loss osteosyntes och displacement.',
          isOptimal: false,
          isAcceptable: false,
          clinicalAccuracyPoints: 30,
          safetyPoints: 20,
          efficiencyPoints: 100,
          xpReward: 0,
        },
      ],
    },

    'node-003-gips': {
      id: 'node-003-gips',
      nodeType: 'outcome',
      title: 'Konservativ behandling - Suboptimalt resultat',
      scenario: 'Patient följs med gips i 6 veckor. Kontroll-rtg vecka 6 visar läkt fraktur men kvarstående 3mm steglöshet.',
      timeElapsed: '6 veckor senare',
      isTerminal: true,
      outcome: {
        type: 'suboptimal',
        title: 'Läkning med felställning',
        description: 'Frakturen läkt men anatomin inte återställd. Patient riskerar posttraumatisk artros.',
        learningPoints: [
          'Weber B med >2mm dislokation bör vanligen opereras',
          'Konservativ behandling kan accepteras om patient tackar nej till op',
          'Anatomisk reposition ger bäst långtidsprognos',
          'Följsamhet till kontroller är avgörande vid konservativ behandling',
        ],
        whatWentRight: [
          'Frakturen läkte',
          'Inga komplikationer',
        ],
        whatWentWrong: [
          'Anatomisk reposition inte uppnådd',
          'Ökad risk för artros på sikt',
        ],
      },
    },

    'node-success-001': {
      id: 'node-success-001',
      nodeType: 'outcome',
      title: 'Excellent outcome - Optimal behandling',
      scenario: 'Vid 12 veckors kontroll: Frakturen läkt i god ställning. Patient smärtfri och har återgått till full aktivitet.',
      timeElapsed: '12 veckor senare',
      isTerminal: true,
      outcome: {
        type: 'success',
        title: 'Optimal behandling och läkning',
        description: 'Korrekt diagnostik, behandlingsval och postoperativ handläggning. Patient återställd.',
        learningPoints: [
          'Ottawa Ankle Rules vägleder röntgenindikation',
          'Weber B med >2mm dislokation → ORIF',
          'Stabil ORIF tillåter tidig mobilisering med ortos',
          'Standardiserat rehab-program ger bäst resultat',
        ],
        whatWentRight: [
          'Korrekt initial bedömning med Ottawa Rules',
          'Adekvat behandlingsval (ORIF)',
          'Anatomisk reposition',
          'Balanserad postoperativ rehab',
        ],
      },
    },

    'node-fail-001': {
      id: 'node-fail-001',
      nodeType: 'outcome',
      title: 'Failure - Gipsning utan diagnostik',
      scenario: 'Vid kontroll dag 7 upptäcker du på kontroll-rtg en Weber C-fraktur med 8mm dislokation och syndesmosskada.',
      isTerminal: true,
      outcome: {
        type: 'failure',
        title: 'Missad allvarlig fraktur',
        description: 'Genom att gipsa utan röntgen missade du en operationsindikation. Patient måste nu opereras i subakut fas.',
        learningPoints: [
          'Röntga ALLTID före gipsning',
          'Ottawa Ankle Rules har hög sensitivitet',
          'Primär fördröjd behandling försvårar kirurgi',
          'Dokumentera alltid primärbedömning',
        ],
        whatWentWrong: [
          'Utebliven primär diagnostik',
          'Missad operationsindikation',
          'Onödig behandlingsfördröjning',
          'Försämrad prognos',
        ],
      },
    },

    'node-fail-002': {
      id: 'node-fail-002',
      nodeType: 'outcome',
      title: 'Catastrophic - Missad fraktur',
      scenario: 'Patient återkommer vecka 2 med svår smärta. Rtg visar nu Weber B-fraktur med sekundär displacement till 8mm.',
      isTerminal: true,
      outcome: {
        type: 'catastrophic',
        title: 'Allvarlig vårdskada',
        description: 'Missad fraktur som displacement sekundärt. Komplicerad reoperation behövs. Patient kommer anmäla till IVO.',
        learningPoints: [
          'ALDRIG skicka hem traumapatient utan adekvat diagnostik',
          'Ottawa Ankle Rules finns av en anledning',
          'Vid minsta tvivel → röntgen',
          'Dokumentation avgörande vid vårdskador',
        ],
        whatWentWrong: [
          'Missad fraktur initialt',
          'Sekundär displacement',
          'Kraftigt försämrad prognos',
          'Vårdskada med juridiska konsekvenser',
          'Förtroendeskada patient-läkare',
        ],
      },
    },

    'node-suboptimal-001': {
      id: 'node-suboptimal-001',
      nodeType: 'outcome',
      title: 'Suboptimal - Överdiagnostik',
      scenario: 'MRT visar ingen betydande ligamentskada. Vecka senare opereras frakturen enligt plan.',
      isTerminal: true,
      outcome: {
        type: 'suboptimal',
        title: 'Onödig utredning',
        description: 'MRT gav ingen ny information som påverkade behandling. Fördröjd kirurgi och ökad kostnad.',
        learningPoints: [
          'MRT behövs sällan akut vid tydlig fraktur',
          'Diagnostik ska påverka behandling',
          'Kostnadseffektivitet är viktigt',
          'Behandlingsfördröjning kan försämra resultat',
        ],
        whatWentRight: [
          'Frakturen opererades till slut',
        ],
        whatWentWrong: [
          'Onödig MRT',
          'Fördröjd kirurgi',
          'Ökad kostnad för vården',
        ],
      },
    },

    'node-suboptimal-002': {
      id: 'node-suboptimal-002',
      nodeType: 'outcome',
      title: 'Suboptimal - För restriktiv rehab',
      scenario: 'Frakturen läker väl men patient utvecklar betydande fotledsstyvhet som kräver extra fysioterapi.',
      timeElapsed: '8 veckor senare',
      isTerminal: true,
      outcome: {
        type: 'suboptimal',
        title: 'God läkning men styvhet',
        description: 'Gips i 8 veckor efter stabil ORIF gav onödig styvhet. Längre rehabperiod.',
        learningPoints: [
          'Stabil ORIF tillåter tidig mobilisering',
          'Ortos bättre än gips postoperativt vid stabil fixation',
          'Immobilisering ger styvhet och muskelatrofi',
          'Balansera mellan skydd och mobilisering',
        ],
        whatWentRight: [
          'Frakturen läkte',
          'Inget displacement',
        ],
        whatWentWrong: [
          'Betydande styvhet',
          'Förlängd rehabperiod',
          'Ökad kostnad för fysioterapi',
        ],
      },
    },

    'node-fail-003': {
      id: 'node-fail-003',
      nodeType: 'outcome',
      title: 'Failure - Loss av osteosyntes',
      scenario: 'Vecka 2: Patient belastade för tidigt. Rtg visar loss skruvar och displacement.',
      isTerminal: true,
      outcome: {
        type: 'failure',
        title: 'Tekniskt misslyckande',
        description: 'För tidig belastning ledde till loss osteosyntes. Reoperation nödvändig.',
        learningPoints: [
          'Standardiserade postop-protokoll finns av en anledning',
          'Biologisk läkning tar 6 veckor',
          'För tidig belastning = risk för loss fixation',
          'Patientinformation avgörande',
        ],
        whatWentWrong: [
          'För liberal postoperativ plan',
          'Loss av osteosyntes',
          'Reoperation krävs',
          'Fördubblad konvalescens',
        ],
      },
    },
  },
};

/**
 * Additional decision tree cases - To be implemented
 */
export const DECISION_TREE_CASES: ClinicalDecisionCase[] = [
  ANKLE_FRACTURE_CASE,
  // More cases to be added...
];
