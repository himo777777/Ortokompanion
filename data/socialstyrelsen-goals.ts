/**
 * Socialstyrelsens utbildningsmål för läkare
 * Baserat på faktiska krav från Socialstyrelsen för:
 * - Läkarprogrammet
 * - AT (Allmäntjänstgöring)
 * - ST i Ortopedi (Specialistutbildning år 1-5)
 */

export interface SocialstyrelseMål {
  id: string;
  category: string;
  title: string;
  description: string;
  level: 'student' | 'at' | 'st1' | 'st2' | 'st3' | 'st4' | 'st5';
  competencyArea: 'medicinsk-kunskap' | 'klinisk-färdighet' | 'kommunikation' | 'professionalism' | 'samverkan' | 'utveckling';
  required: boolean;
  assessmentCriteria: string[];
}

export interface MålProgress {
  målId: string;
  achieved: boolean;
  progress: number; // 0-100
  evidenceCount: number;
  lastUpdated: Date;
}

// LÄKARPROGRAMMET - Grundläggande mål för läkarstudenter
export const LÄKARPROGRAMMET_MÅL: SocialstyrelseMål[] = [
  {
    id: 'lp-01',
    category: 'Medicinsk vetenskap',
    title: 'Grundläggande anatomi och fysiologi',
    description: 'Förstå kroppens normala uppbyggnad och funktion med fokus på rörelseapparaten',
    level: 'student',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Kan beskriva skelettets anatomi',
      'Förstår ledernas uppbyggnad och funktion',
      'Känner till muskulaturens anatomi och funktion',
      'Kan förklara frakturläkning',
    ],
  },
  {
    id: 'lp-02',
    category: 'Klinisk undersökning',
    title: 'Inspektion, palpation, rörlighet',
    description: 'Utföra grundläggande ortopedisk klinisk undersökning',
    level: 'student',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Kan utföra systematisk inspektion',
      'Behärskar palpationsteknik',
      'Kan bedöma ledrörlighet',
      'Dokumenterar fynd korrekt',
    ],
  },
  {
    id: 'lp-03',
    category: 'Akut handläggning',
    title: 'ABCDE och primär bedömning',
    description: 'Prioritera och bedöma akut sjuka patienter enligt ABCDE',
    level: 'student',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Kan utföra ABCDE-bedömning',
      'Prioriterar livsviktiga funktioner',
      'Känner igen tecken på chock',
      'Kan larma adekvat hjälp',
    ],
  },
  {
    id: 'lp-04',
    category: 'Bilddiagnostik',
    title: 'Grundläggande röntgentolkning',
    description: 'Identifiera normala anatomiska strukturer och uppenbara frakturer på röntgen',
    level: 'student',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Känner igen normal anatomi på röntgen',
      'Kan identifiera uppenbara frakturer',
      'Förstår olika projektioner',
      'Beställer rätt undersökning',
    ],
  },
  {
    id: 'lp-05',
    category: 'Kommunikation',
    title: 'Patientkommunikation och samtycke',
    description: 'Kommunicera med patient och närstående på ett professionellt sätt',
    level: 'student',
    competencyArea: 'kommunikation',
    required: true,
    assessmentCriteria: [
      'Inhämtar informerat samtycke',
      'Förklarar på ett begripligt sätt',
      'Visar empati och lyhördhet',
      'Dokumenterar patientsamtal',
    ],
  },
];

// AT-MÅL - Allmäntjänstgöring
export const AT_MÅL: SocialstyrelseMål[] = [
  {
    id: 'at-01',
    category: 'Traumahandläggning',
    title: 'Handlägga vanliga frakturer',
    description: 'Självständigt handlägga och behandla vanliga extremitetsfrakturer',
    level: 'at',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Kan handlägga Colles fraktur',
      'Kan handlägga fotledsfraktur',
      'Kan anlägga gips korrekt',
      'Bedömer indikation för kirurgi',
      'Kontrollerar neurovaskulär status',
    ],
  },
  {
    id: 'at-02',
    category: 'Akut ortopedi',
    title: 'Jour och akutmottagning',
    description: 'Självständigt handlägga ortopediska akutfall under handledning',
    level: 'at',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Triagerar patienter korrekt',
      'Utesluter livshotande tillstånd',
      'Ger adekvat smärtlindring',
      'Konsulterar handledare vid behov',
      'Följer lokala rutiner',
    ],
  },
  {
    id: 'at-03',
    category: 'Beslutsstöd',
    title: 'Tillämpa kliniska beslutsstöd',
    description: 'Använda validerade beslutsstöd som Ottawa Rules',
    level: 'at',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Kan tillämpa Ottawa Ankle Rules',
      'Kan tillämpa Ottawa Knee Rules',
      'Förstår beslutsstödens begränsningar',
      'Minskar onödiga undersökningar',
    ],
  },
  {
    id: 'at-04',
    category: 'Dokumentation',
    title: 'Korrekt journalföring',
    description: 'Dokumentera enligt gällande krav och rutiner',
    level: 'at',
    competencyArea: 'professionalism',
    required: true,
    assessmentCriteria: [
      'Dokumenterar strukturerat (SOAIP)',
      'Inkluderar alla väsentliga fynd',
      'Skriver förståeligt och tydligt',
      'Signerar och tidsstämplar',
    ],
  },
  {
    id: 'at-05',
    category: 'Samverkan',
    title: 'Teamarbete i akutsituationer',
    description: 'Arbeta effektivt i multiprofessionella team',
    level: 'at',
    competencyArea: 'samverkan',
    required: true,
    assessmentCriteria: [
      'Kommunicerar tydligt med teamet',
      'Respekterar andras kompetens',
      'Ber om hjälp vid behov',
      'Bidrar till patientsäkerhet',
    ],
  },
];

// ST ORTOPEDI - Specialistutbildning
export const ST_ORTOPEDI_MÅL: Record<'st1' | 'st2' | 'st3' | 'st4' | 'st5', SocialstyrelseMål[]> = {
  // ST1 - Första året
  st1: [
    {
      id: 'st1-01',
      category: 'Traumaortopedi',
      title: 'Handlägga höftfrakturer',
      description: 'Självständigt handlägga patienter med proximal femurfraktur',
      level: 'st1',
      competencyArea: 'klinisk-färdighet',
      required: true,
      assessmentCriteria: [
        'Klassificerar frakturer (Garden, AO)',
        'Väljer korrekt behandlingsmetod',
        'Kan operera enkla höftfrakturer',
        'Hanterar postoperativa komplikationer',
        'Optimerar patienten preoperativt',
      ],
    },
    {
      id: 'st1-02',
      category: 'Kirurgiska grundfärdigheter',
      title: 'Grundläggande operationsteknik',
      description: 'Behärska grundläggande ortopediska operationstekniker',
      level: 'st1',
      competencyArea: 'klinisk-färdighet',
      required: true,
      assessmentCriteria: [
        'Sterilteknik och klädsel',
        'Kirurgisk hygien och antibiotika',
        'Mjukdelshantering',
        'Grundläggande suturtekniker',
        'Hemostas och sårvård',
      ],
    },
    {
      id: 'st1-03',
      category: 'Frakturbehandling',
      title: 'Interna fixationsmetoder',
      description: 'Förstå och tillämpa olika frakturbehandlingsmetoder',
      level: 'st1',
      competencyArea: 'medicinsk-kunskap',
      required: true,
      assessmentCriteria: [
        'Känner till AO-principerna',
        'Kan välja mellan platta, spik, skruv',
        'Förstår biomekanska principer',
        'Känner till komplikationer',
      ],
    },
    {
      id: 'st1-04',
      category: 'Akut handläggning',
      title: 'Öppna frakturer',
      description: 'Handlägga öppna frakturer enligt gällande rutiner',
      level: 'st1',
      competencyArea: 'klinisk-färdighet',
      required: true,
      assessmentCriteria: [
        'Klassificerar enligt Gustilo-Anderson',
        'Ger korrekt antibiotikaprofylax',
        'Utför adekvat debridering',
        'Samarbetar med plastikkirurg vid behov',
      ],
    },
  ],

  // ST2 - Andra året
  st2: [
    {
      id: 'st2-01',
      category: 'Elektivortopedi',
      title: 'Artroskirurgi - grundläggande',
      description: 'Förstå principerna för ledersättningskirurgi',
      level: 'st2',
      competencyArea: 'medicinsk-kunskap',
      required: true,
      assessmentCriteria: [
        'Känner till indikationer för THA/TKA',
        'Förstår implantatdesign',
        'Känner till olika fixationsmetoder',
        'Kan bedöma kontraindikationer',
      ],
    },
    {
      id: 'st2-02',
      category: 'Handkirurgi',
      title: 'Vanliga handskador',
      description: 'Handlägga och operera vanliga handskador',
      level: 'st2',
      competencyArea: 'klinisk-färdighet',
      required: true,
      assessmentCriteria: [
        'Kan operera karpaltunnelsyndrom',
        'Hanterar flexorsenrupturer',
        'Handlägger Dupuytrens kontraktur',
        'Utför nervblockader i hand/arm',
      ],
    },
    {
      id: 'st2-03',
      category: 'Barnortopedi',
      title: 'Vanliga barnortopediska tillstånd',
      description: 'Diagnostisera och behandla vanliga barnortopediska problem',
      level: 'st2',
      competencyArea: 'medicinsk-kunskap',
      required: true,
      assessmentCriteria: [
        'Känner igen DDH (höftluxation)',
        'Handlägger suprakondylära frakturer',
        'Bedömer skelettmognad',
        'Förstår tillväxtrubbningar',
      ],
    },
    {
      id: 'st2-04',
      category: 'Bilddiagnostik',
      title: 'Avancerad bildtolkning',
      description: 'Tolka CT, MR och specialröntgen',
      level: 'st2',
      competencyArea: 'medicinsk-kunskap',
      required: true,
      assessmentCriteria: [
        'Tolkar CT av frakturer',
        'Bedömer MR av mjukdelar',
        'Förstår artroskopiindikat',
        'Beställer adekvat bilddiagnostik',
      ],
    },
  ],

  // ST3 - Tredje året
  st3: [
    {
      id: 'st3-01',
      category: 'Ledersättning',
      title: 'Total höftprotes (THA)',
      description: 'Självständigt utföra primär total höftledsplastik',
      level: 'st3',
      competencyArea: 'klinisk-färdighet',
      required: true,
      assessmentCriteria: [
        'Väljer korrekt tillvägagångssätt',
        'Kan operera via lateral approach',
        'Optimerar implantatpositionering',
        'Hanterar intraoperativa komplikationer',
        'Postoperativ uppföljning',
      ],
    },
    {
      id: 'st3-02',
      category: 'Sportortopedi',
      title: 'Knäartroskopi och ACL',
      description: 'Utföra diagnostisk och terapeutisk knäartroskopi',
      level: 'st3',
      competencyArea: 'klinisk-färdighet',
      required: true,
      assessmentCriteria: [
        'Diagnostisk artroskopi',
        'Meniskkirurgi (resektion/sutur)',
        'ACL-rekonstruktion',
        'Hanterar artroskopiinstrument',
      ],
    },
    {
      id: 'st3-03',
      category: 'Ryggkirurgi',
      title: 'Grundläggande ryggkirurgi',
      description: 'Förstå indikationer och tekniker för spinalkirurgi',
      level: 'st3',
      competencyArea: 'medicinsk-kunskap',
      required: true,
      assessmentCriteria: [
        'Känner till indikationer för diskektomi',
        'Förstår spinal stenos',
        'Känner igen kauda equina',
        'Bedömer neurologiska symtom',
      ],
    },
    {
      id: 'st3-04',
      category: 'Komplikationshantering',
      title: 'Perioperativa komplikationer',
      description: 'Identifiera och hantera vanliga perioperativa komplikationer',
      level: 'st3',
      competencyArea: 'klinisk-färdighet',
      required: true,
      assessmentCriteria: [
        'Känner igen kompartmentsyndrom',
        'Hanterar djup ventrombos',
        'Behandlar infektion',
        'Förebygger komplikationer',
      ],
    },
  ],

  // ST4 - Fjärde året
  st4: [
    {
      id: 'st4-01',
      category: 'Avancerad artroplastik',
      title: 'Total knäprotes (TKA)',
      description: 'Självständigt utföra primär total knäledsplastik',
      level: 'st4',
      competencyArea: 'klinisk-färdighet',
      required: true,
      assessmentCriteria: [
        'Utför TKA självständigt',
        'Optimerar alignment',
        'Balanserar mjukdelar',
        'Väljer rätt implantat',
      ],
    },
    {
      id: 'st4-02',
      category: 'Revisionskirurgi',
      title: 'Grundläggande revisionsartroplastik',
      description: 'Förstå principer för revisionskirurgi',
      level: 'st4',
      competencyArea: 'medicinsk-kunskap',
      required: true,
      assessmentCriteria: [
        'Känner till orsaker till revision',
        'Kan planera revisionskirurgi',
        'Förstår benförlusthantering',
        'Känner till revisionsimplantat',
      ],
    },
    {
      id: 'st4-03',
      category: 'Tumörortopedi',
      title: 'Bentumörer - diagnostik',
      description: 'Utreda och handlägga misstänkta bentumörer',
      level: 'st4',
      competencyArea: 'medicinsk-kunskap',
      required: true,
      assessmentCriteria: [
        'Känner igen misstänkta tumörer',
        'Utför korrekt biopsi',
        'Remitterar till sarkomcentrum',
        'Förstår staging',
      ],
    },
    {
      id: 'st4-04',
      category: 'Forskning',
      title: 'Vetenskapligt arbete',
      description: 'Delta i forskningsprojekt och kvalitetsarbete',
      level: 'st4',
      competencyArea: 'utveckling',
      required: true,
      assessmentCriteria: [
        'Kan läsa vetenskapliga artiklar kritiskt',
        'Deltar i kvalitetsregister',
        'Bidrar till forskningsprojekt',
        'Presenterar på konferens',
      ],
    },
  ],

  // ST5 - Femte året
  st5: [
    {
      id: 'st5-01',
      category: 'Subspecialisering',
      title: 'Avancerad subspecialistkunskap',
      description: 'Fördjupad kompetens inom valt subspecialområde',
      level: 'st5',
      competencyArea: 'medicinsk-kunskap',
      required: true,
      assessmentCriteria: [
        'Expertis inom valt område',
        'Kan handleda yngre kollegor',
        'Håller föreläsningar',
        'Bidrar till kunskapsutveckling',
      ],
    },
    {
      id: 'st5-02',
      category: 'Komplexa revisioner',
      title: 'Avancerad revisionskirurgi',
      description: 'Handlägga komplexa revisionsfall',
      level: 'st5',
      competencyArea: 'klinisk-färdighet',
      required: true,
      assessmentCriteria: [
        'Hanterar massiv benförlust',
        'Använder augments och custom',
        'Behandlar periprotesisk infektion',
        'Multiopererade patienter',
      ],
    },
    {
      id: 'st5-03',
      category: 'Ledarskap',
      title: 'Kliniskt ledarskap',
      description: 'Ta ansvar för klinikens verksamhet och utveckling',
      level: 'st5',
      competencyArea: 'professionalism',
      required: true,
      assessmentCriteria: [
        'Leder traumateam',
        'Bidrar till verksamhetsutveckling',
        'Mentorerar yngre läkare',
        'Säkerställer patientsäkerhet',
      ],
    },
    {
      id: 'st5-04',
      category: 'Evidensbaserad medicin',
      title: 'Implementera ny kunskap',
      description: 'Tillämpa och implementera aktuell forskning',
      level: 'st5',
      competencyArea: 'utveckling',
      required: true,
      assessmentCriteria: [
        'Följer aktuell forskning',
        'Implementerar nya metoder',
        'Utvärderar resultat systematiskt',
        'Bidrar till riktlinjeutveckling',
      ],
    },
  ],
};

// Utility functions
export function getMålForLevel(level: 'student' | 'at' | 'st1' | 'st2' | 'st3' | 'st4' | 'st5'): SocialstyrelseMål[] {
  if (level === 'student') return LÄKARPROGRAMMET_MÅL;
  if (level === 'at') return AT_MÅL;
  return ST_ORTOPEDI_MÅL[level] || [];
}

export function getAllMålForLevel(level: 'student' | 'at' | 'st1' | 'st2' | 'st3' | 'st4' | 'st5'): SocialstyrelseMål[] {
  // För ST-läkare, inkludera även tidigare års mål
  if (level.startsWith('st')) {
    const stYear = parseInt(level.replace('st', ''));
    let allMål: SocialstyrelseMål[] = [];

    for (let i = 1; i <= stYear; i++) {
      const levelKey = `st${i}` as 'st1' | 'st2' | 'st3' | 'st4' | 'st5';
      allMål = [...allMål, ...ST_ORTOPEDI_MÅL[levelKey]];
    }

    return allMål;
  }

  return getMålForLevel(level);
}

export function getMålByCategory(level: string, category: string): SocialstyrelseMål[] {
  const allMål = getMålForLevel(level as any);
  return allMål.filter(mål => mål.category === category);
}

export function getRequiredMål(level: string): SocialstyrelseMål[] {
  const allMål = getMålForLevel(level as any);
  return allMål.filter(mål => mål.required);
}

export function calculateMålProgress(userProgress: MålProgress[], level: string): {
  total: number;
  achieved: number;
  percentage: number;
} {
  const allMål = getRequiredMål(level);
  const achieved = userProgress.filter(p => p.achieved).length;

  return {
    total: allMål.length,
    achieved,
    percentage: allMål.length > 0 ? Math.round((achieved / allMål.length) * 100) : 0,
  };
}
