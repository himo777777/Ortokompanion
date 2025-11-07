/**
 * Socialstyrelsens utbildningsmål för läkare
 * Baserat på faktiska krav från Socialstyrelsen för:
 * - Läkarprogrammet
 * - AT (Allmäntjänstgöring)
 * - ST i Ortopedi (Specialistutbildning år 1-5)
 */

import { EducationLevel } from '@/types/education';
import { toLevelType } from '@/lib/ai-utils';

export interface SocialstyrelseMål {
  id: string;
  category: string;
  title: string;
  description: string;
  level: 'student' | 'at' | 'st1' | 'st2' | 'st3' | 'st4' | 'st5' | 'st-allmänmedicin' | 'st-akutsjukvård' | 'specialist-ortopedi' | 'specialist-allmänmedicin' | 'specialist-akutsjukvård';
  competencyArea: 'medicinsk-kunskap' | 'klinisk-färdighet' | 'kirurgisk-färdighet' | 'kommunikation' | 'professionalism' | 'samverkan' | 'utveckling' | 'ledarskap';
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

// ST-ALLMÄNMEDICIN MÅL - För ST-allmänmedicin med ortopedi-placering
export const ST_ALLMÄNMEDICIN_ORTOPEDI_MÅL: SocialstyrelseMål[] = [
  {
    id: 'st-am-01',
    category: 'Muskuloskeletal anamnes',
    title: 'Anamnesupptagning vid muskuloskeletala besvär',
    description: 'Strukturerat ta anamnes vid vanliga muskuloskeletala symtom i primärvården',
    level: 'st-allmänmedicin',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Kartlägger smärtans karaktär, duration och förlopp',
      'Frågar om riskfaktorer (rökning, alkohol, tidigare skador)',
      'Bedömer funktionsbegränsning i dagliga aktiviteter',
      'Identifierar red flags för allvarlig patologi',
    ],
  },
  {
    id: 'st-am-02',
    category: 'Klinisk undersökning',
    title: 'Ortopedisk statusundersökning',
    description: 'Utföra fokuserad ortopedisk undersökning av stora leder',
    level: 'st-allmänmedicin',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Undersöker axel metodiskt (impingement, rotator cuff)',
      'Undersöker knä systematiskt (ligament, menisk)',
      'Undersöker höft (rörlighet, smärta)',
      'Dokumenterar fynd strukturerat',
    ],
  },
  {
    id: 'st-am-03',
    category: 'Primärvårdsortopedi',
    title: 'Handlägga vanliga ortopediska tillstånd',
    description: 'Självständigt handlägga vanliga ortopediska besvär i primärvården',
    level: 'st-allmänmedicin',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Diagnostiserar och behandlar artros',
      'Handlägger ländryggsbesvär enligt riktlinjer',
      'Behandlar tendinopatier konservativt',
      'Känner igen indikationer för remiss till ortoped',
    ],
  },
  {
    id: 'st-am-04',
    category: 'Remisshantering',
    title: 'Adekvat remittering till ortoped',
    description: 'Bedöma när remiss till ortopedspecialist är indicerad',
    level: 'st-allmänmedicin',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Känner igen red flags',
      'Bedömer när konservativ behandling är uttömd',
      'Skriver strukturerad remiss med relevant information',
      'Prioriterar patienter korrekt',
    ],
  },
  {
    id: 'st-am-05',
    category: 'Rehabilitering',
    title: 'Koordinera rehabilitering',
    description: 'Samordna rehabilitering vid muskuloskeletala besvär',
    level: 'st-allmänmedicin',
    competencyArea: 'samverkan',
    required: true,
    assessmentCriteria: [
      'Ordinerar fysioterapi vid behov',
      'Samarbetar med arbetsterapeut',
      'Följer upp rehabiliteringsförlopp',
      'Bedömer arbetsförmåga',
    ],
  },
];

// ST-AKUTSJUKVÅRD MÅL - För ST-akutsjukvård med ortopedi-placering
export const ST_AKUTSJUKVÅRD_ORTOPEDI_MÅL: SocialstyrelseMål[] = [
  {
    id: 'st-aku-01',
    category: 'Akut traumahandläggning',
    title: 'Primär bedömning av trauma',
    description: 'Bedöma och prioritera traumapatienter enligt ATLS-principer',
    level: 'st-akutsjukvård',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Utför systematisk ABCDE-bedömning',
      'Identifierar livshotande skador',
      'Prioriterar interventioner korrekt',
      'Aktiverar traumalarm vid behov',
    ],
  },
  {
    id: 'st-aku-02',
    category: 'Frakturhandläggning akut',
    title: 'Akut handläggning av frakturer',
    description: 'Diagnostisera och initialt handlägga frakturer på akutmottagning',
    level: 'st-akutsjukvård',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Beställer adekvat bilddiagnostik',
      'Bedömer frakturstabilitet och dislokation',
      'Ger initial behandling (reposition, gips, analgetika)',
      'Konsulterar ortoped vid behov',
    ],
  },
  {
    id: 'st-aku-03',
    category: 'Kompartmentsyndrom',
    title: 'Känna igen kompartmentsyndrom',
    description: 'Identifiera och handlägga misstänkt kompartmentsyndrom',
    level: 'st-akutsjukvård',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Känner igen kliniska tecken (5 P)',
      'Utesluter kompartmentsyndrom systematiskt',
      'Kontaktar ortopedjouren akut vid misstanke',
      'Förbereder för akut fasciotomi',
    ],
  },
  {
    id: 'st-aku-04',
    category: 'Luxationer',
    title: 'Reponera vanliga luxationer',
    description: 'Diagnostisera och reponera vanliga luxationer',
    level: 'st-akutsjukvård',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Reponerar axelluxation',
      'Reponerar patellaluxation',
      'Kontrollerar neurovaskulär status före/efter',
      'Ordinerar adekvat uppföljning',
    ],
  },
  {
    id: 'st-aku-05',
    category: 'Smärtlindring',
    title: 'Optimal smärtlindring vid trauma',
    description: 'Ge adekvat smärtlindring vid muskuloskeletala skador',
    level: 'st-akutsjukvård',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Bedömer smärta systematiskt (VAS/NRS)',
      'Ger titrerad analgesi',
      'Använder regional blockad vid behov',
      'Följer upp smärtlindring',
    ],
  },
];

// SPECIALIST FORTBILDNING MÅL - För alla specialist-nivåer
export const SPECIALIST_FORTBILDNING_MÅL: SocialstyrelseMål[] = [
  {
    id: 'spec-fort-01',
    category: 'Evidensbaserad medicin',
    title: 'Uppdatera kunskaper kontinuerligt',
    description: 'Hålla sig uppdaterad med aktuell forskning och riktlinjer',
    level: 'specialist-ortopedi',
    competencyArea: 'utveckling',
    required: true,
    assessmentCriteria: [
      'Följer aktuell forskning i facktidskrifter',
      'Deltar i nationella konferenser',
      'Implementerar nya riktlinjer',
      'Utvärderar egen praxis',
    ],
  },
  {
    id: 'spec-fort-02',
    category: 'Komplicerade fall',
    title: 'Handlägga komplicerade fall',
    description: 'Behålla kompetens att handlägga komplexa ortopediska tillstånd',
    level: 'specialist-ortopedi',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Hanterar revisionskirurgi',
      'Diagnostiserar ovanliga tillstånd',
      'Handlägger komplikationer',
      'Konsulterar subspecialister vid behov',
    ],
  },
  {
    id: 'spec-fort-03',
    category: 'Handledning',
    title: 'Handleda yngre läkare',
    description: 'Aktivt handleda och utbilda AT- och ST-läkare',
    level: 'specialist-ortopedi',
    competencyArea: 'samverkan',
    required: true,
    assessmentCriteria: [
      'Handleder ST-läkare i kirurgi',
      'Ger strukturerad feedback',
      'Bedömer kompetens objektivt',
      'Bidrar till utbildningsprogram',
    ],
  },
  {
    id: 'spec-fort-04',
    category: 'Kvalitetsarbete',
    title: 'Delta i kvalitetsregister',
    description: 'Bidra till och använda nationella kvalitetsregister',
    level: 'specialist-ortopedi',
    competencyArea: 'utveckling',
    required: true,
    assessmentCriteria: [
      'Registrerar patienter i kvalitetsregister',
      'Analyserar egna resultat',
      'Jämför med nationella data',
      'Implementerar förbättringsåtgärder',
    ],
  },
  {
    id: 'spec-fort-05',
    category: 'Patientsäkerhet',
    title: 'Upprätthålla patientsäkerhet',
    description: 'Säkerställa hög patientsäkerhet i klinisk praxis',
    level: 'specialist-ortopedi',
    competencyArea: 'professionalism',
    required: true,
    assessmentCriteria: [
      'Följer hygienrutiner strikt',
      'Rapporterar avvikelser',
      'Deltar i morbiditet/mortalitetskonferenser',
      'Implementerar säkerhetsrutiner',
    ],
  },
];

/**
 * AT-TENTAMEN FÖRBEREDELSEMÅL
 * Specifika mål för förberedelse inför AT-kunskapsprov
 */
export const AT_TENTAMEN_MÅL: SocialstyrelseMål[] = [
  {
    id: 'at-exam-01',
    title: 'Basala läkemedelskunskaper inom ortopedi',
    description: 'Kunna ordinera och dosera vanliga läkemedel inom ortopedi inkl. antikoagulantia, analgetika, antibiotika',
    category: 'medicinal-kunskap',
    level: 'at',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Korrekt dosering av NSAID, paracetamol, opioider',
      'Trombosprofylax enligt riktlinjer',
      'Antibiotika vid frakturer och operation',
      'Kända interaktioner och kontraindikationer',
    ],
  },
  {
    id: 'at-exam-02',
    title: 'Differentialdiagnostik skelettsmärta',
    description: 'Kunna differentiera mellan trauma, infektion, tumör, reumatologisk sjukdom och övrig skelettsmärta',
    category: 'differential-diagnostik',
    level: 'at',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Anamnes och status för skelettsmärta',
      'Red flags för tumör och infektion',
      'Kliniska tecken på fraktur',
      'Remitteringskriterier till ortoped',
    ],
  },
  {
    id: 'at-exam-03',
    title: 'Journalföring och medicinjuridik',
    description: 'Korrekt journalföring enligt patientdatalagen, informerat samtycke, Lex Maria-rapportering',
    category: 'professionalism',
    level: 'at',
    competencyArea: 'professionalism',
    required: true,
    assessmentCriteria: [
      'Komplett SAML-dokumentation',
      'Journalföring enligt patientdatalagen',
      'Hantering av avvikelser',
      'Informerat samtycke dokumenterat',
    ],
  },
  {
    id: 'at-exam-04',
    title: 'Tvärspecialitet samverkan',
    description: 'Samarbete med anestesi, radiologi, infektionsklinik vid ortopediska tillstånd',
    category: 'samverkan',
    level: 'at',
    competencyArea: 'samverkan',
    required: true,
    assessmentCriteria: [
      'Korrekt remittering till anestesi',
      'Konferens med radiologi',
      'Samverkan infektionsklinik vid osteomyelit',
      'Teamwork på akutmottagning',
    ],
  },
  {
    id: 'at-exam-05',
    title: 'Etik och resurshushållning',
    description: 'Etiska överväganden vid prioritering, resursanvändning, samtycke och patientautonomi',
    category: 'professionalism',
    level: 'at',
    competencyArea: 'professionalism',
    required: true,
    assessmentCriteria: [
      'Prioritering enligt nationella riktlinjer',
      'Etiska dilemman i akutsituationer',
      'Resurshushållning',
      'Respekt för patientautonomi',
    ],
  },
];

/**
 * SPECIALISTEXAMEN FÖRBEREDELSEMÅL
 * Specifika mål för förberedelse inför specialistexamen i ortopedi
 */
export const SPECIALISTEXAMEN_MÅL: SocialstyrelseMål[] = [
  {
    id: 'spec-exam-01',
    title: 'Forskningsmetodik och evidensbaserad medicin',
    description: 'Förstå och kritiskt granska vetenskapliga studier, forskningsdesign, statistik och evidensgrader',
    category: 'evidens-forskning',
    level: 'specialist-ortopedi',
    competencyArea: 'utveckling',
    required: true,
    assessmentCriteria: [
      'Kritisk granskning av RCT-studier',
      'Förstå statistiska begrepp (p-värde, konfidensintervall)',
      'Evidensgrader enligt GRADE',
      'Tolka meta-analyser och systematiska översikter',
    ],
  },
  {
    id: 'spec-exam-02',
    title: 'Komplikationshantering och revision',
    description: 'Hantera komplikationer efter ortopedisk kirurgi inkl. infektioner, instabilitet, luxation, nervskada',
    category: 'komplikationer',
    level: 'specialist-ortopedi',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Diagnostik och handläggning protesinfektioner (PJI)',
      'Revision vid instabilitet',
      'Hantering nervskador',
      'Reoperation vid malunion/nonunion',
    ],
  },
  {
    id: 'spec-exam-03',
    title: 'Kvalitetsregister och uppföljning',
    description: 'Kunna använda och tolka data från nationella kvalitetsregister (SHR, SKAR, etc)',
    category: 'kvalitet',
    level: 'specialist-ortopedi',
    competencyArea: 'utveckling',
    required: true,
    assessmentCriteria: [
      'Registrera korrekt i SHR/SKAR',
      'Tolka registerdata för egen klinik',
      'Använd data för kvalitetsförbättring',
      'Förstå riskadjustering och case-mix',
    ],
  },
  {
    id: 'spec-exam-04',
    title: 'Riktlinjer och standardiserad vård',
    description: 'Känna till och applicera nationella och internationella guidelines (BOAST, AO, AAOS, NICE)',
    category: 'guidelines',
    level: 'specialist-ortopedi',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'BOAST guidelines för frakturer',
      'AO-klassifikation för frakturer',
      'AAOS rekommendationer',
      'NICE guidelines för artros',
    ],
  },
  {
    id: 'spec-exam-05',
    title: 'Ledarskap och utbildning',
    description: 'Handleda ST-läkare, leda team, bedriva undervisning och kvalitetsarbete',
    category: 'ledarskap',
    level: 'specialist-ortopedi',
    competencyArea: 'ledarskap',
    required: true,
    assessmentCriteria: [
      'Handledning av ST-läkare',
      'Leda traumateam',
      'Bedriva utbildning',
      'Kvalitetsarbete och förbättringsarbete',
    ],
  },
];

/**
 * SUBSPECIALITET-MÅL
 * Specifika mål för fördjupning inom ortopediska subspecialiteter
 */

// Fotkirurgi
export const FOTKIRURGI_MÅL: SocialstyrelseMål[] = [
  {
    id: 'foot-01',
    title: 'Hallux valgus kirurgi',
    description: 'Diagnostik och kirurgisk behandling av hallux valgus inkl. olika osteotomier',
    category: 'subspeciality-foot',
    level: 'specialist-ortopedi',
    competencyArea: 'kirurgisk-färdighet',
    required: false,
    assessmentCriteria: [
      'Indikationsställning för operation',
      'Val av osteotomiteknik (Scarf, Chevron, etc)',
      'Hantering komplikationer',
      'Postoperativ rehabilitering',
    ],
  },
  {
    id: 'foot-02',
    title: 'Achillesruptur och tendinopati',
    description: 'Konservativ och kirurgisk behandling av achillesruptur samt kronisk tendinopati',
    category: 'subspeciality-foot',
    level: 'specialist-ortopedi',
    competencyArea: 'klinisk-färdighet',
    required: false,
    assessmentCriteria: [
      'Klinisk diagnostik',
      'Val mellan konservativ och kirurgisk behandling',
      'Kirurgisk teknik vid ruptur',
      'Rehabiliteringsprotokoll',
    ],
  },
  {
    id: 'foot-03',
    title: 'Ankelartros och artrodés',
    description: 'Handläggning av svår ankelartros inkl. artrodés och ankelprotes',
    category: 'subspeciality-foot',
    level: 'specialist-ortopedi',
    competencyArea: 'kirurgisk-färdighet',
    required: false,
    assessmentCriteria: [
      'Indikationer för artrodés vs protes',
      'Kirurgisk teknik artrodés',
      'Ankelprotes-teknik',
      'Komplikationshantering',
    ],
  },
];

// Handkirurgi
export const HANDKIRURGI_MÅL: SocialstyrelseMål[] = [
  {
    id: 'hand-01',
    title: 'Karpaltunnelsyndrom',
    description: 'Diagnostik och kirurgisk dekompression vid karpaltunnelsyndrom',
    category: 'subspeciality-hand',
    level: 'specialist-ortopedi',
    competencyArea: 'kirurgisk-färdighet',
    required: false,
    assessmentCriteria: [
      'Klinisk diagnostik inkl. Phalens test',
      'Tolka EMG/neurografi',
      'Kirurgisk dekompression',
      'Hantering komplikationer',
    ],
  },
  {
    id: 'hand-02',
    title: 'Handled och distalradiusfrakturer',
    description: 'Kirurgisk behandling av komplexa distalradiusfrakturer och handledsskador',
    category: 'subspeciality-hand',
    level: 'specialist-ortopedi',
    competencyArea: 'kirurgisk-färdighet',
    required: false,
    assessmentCriteria: [
      'Klassifikation enligt AO',
      'Indikationer för kirurgi',
      'Volär platteosteosyntés',
      'Hantering ledband och TFCC-skador',
    ],
  },
  {
    id: 'hand-03',
    title: 'Seninflammation och trigger finger',
    description: 'Behandling av De Quervains tenosynovit, trigger finger och andra senlidelser',
    category: 'subspeciality-hand',
    level: 'specialist-ortopedi',
    competencyArea: 'kirurgisk-färdighet',
    required: false,
    assessmentCriteria: [
      'Klinisk diagnostik',
      'Injektion-teknik',
      'Kirurgisk release trigger finger',
      'Release De Quervains',
    ],
  },
];

// Sportortopedi
export const SPORTORTOPEDI_MÅL: SocialstyrelseMål[] = [
  {
    id: 'sport-01',
    title: 'ACL-rekonstruktion',
    description: 'Diagnostik och kirurgisk rekonstruktion av främre korsbandet',
    category: 'subspeciality-sport',
    level: 'specialist-ortopedi',
    competencyArea: 'kirurgisk-färdighet',
    required: false,
    assessmentCriteria: [
      'Klinisk diagnostik (Lachman, pivot shift)',
      'MR-tolkning',
      'Artroskopisk ACL-rekonstruktion',
      'Val av graft (hamstring vs patellarsena)',
    ],
  },
  {
    id: 'sport-02',
    title: 'Meniskkirurgi',
    description: 'Artroskopisk menisk resektion och sutur',
    category: 'subspeciality-sport',
    level: 'specialist-ortopedi',
    competencyArea: 'kirurgisk-färdighet',
    required: false,
    assessmentCriteria: [
      'Indikationer för resektion vs sutur',
      'Artroskopisk teknik',
      'Menisk-sutur-tekniker',
      'Postoperativ rehabilitering',
    ],
  },
  {
    id: 'sport-03',
    title: 'Skulderinstabilitet',
    description: 'Handläggning av akut och kronisk skulder luxation/instabilitet',
    category: 'subspeciality-sport',
    level: 'specialist-ortopedi',
    competencyArea: 'kirurgisk-färdighet',
    required: false,
    assessmentCriteria: [
      'Klinisk bedömning instabilitet',
      'Tolka MR artrografi',
      'Artroskopisk Bankart',
      'Indicering för öppen Latarjet',
    ],
  },
];

// Tumörortopedi
export const TUMÖRORTOPEDI_MÅL: SocialstyrelseMål[] = [
  {
    id: 'tumor-01',
    title: 'Skelettmetastaser handläggning',
    description: 'Diagnostik och behandling av skelettmetastaser inkl. profylaktisk fixation',
    category: 'subspeciality-tumor',
    level: 'specialist-ortopedi',
    competencyArea: 'medicinsk-kunskap',
    required: false,
    assessmentCriteria: [
      'Mirels score för frakturrisk',
      'Indikationer profylaktisk fixation',
      'Kirurgiska alternativ',
      'MDT-konferens vid metastaser',
    ],
  },
  {
    id: 'tumor-02',
    title: 'Primära bentumörer',
    description: 'Grundläggande diagnostik och remittering vid misstänkt primär bentumör',
    category: 'subspeciality-tumor',
    level: 'specialist-ortopedi',
    competencyArea: 'medicinsk-kunskap',
    required: false,
    assessmentCriteria: [
      'Red flags för malignitet',
      'Korrekt utredning (rtg, MR, biopsi)',
      'Akut remittering till sarkomcentrum',
      'Kommunikation med patient',
    ],
  },
];

// Barnortopedi
export const BARNORTOPEDI_MÅL: SocialstyrelseMål[] = [
  {
    id: 'ped-01',
    title: 'Höftledsdysplasi (DDH)',
    description: 'Screening, diagnostik och behandling av developmental dysplasia of the hip',
    category: 'subspeciality-pediatric',
    level: 'specialist-ortopedi',
    competencyArea: 'klinisk-färdighet',
    required: false,
    assessmentCriteria: [
      'Klinisk undersökning spädbarn (Barlow, Ortolani)',
      'Ultraljudsscreening',
      'Indikation för Pavlik bandage',
      'Uppföljning och remittering',
    ],
  },
  {
    id: 'ped-02',
    title: 'Suprakondylära humerusfrakturer barn',
    description: 'Akut handläggning och kirurgisk behandling av suprakondylära frakturer',
    category: 'subspeciality-pediatric',
    level: 'specialist-ortopedi',
    competencyArea: 'kirurgisk-färdighet',
    required: false,
    assessmentCriteria: [
      'Klassifikation (Gartland)',
      'Bedömning neurovaskulär status',
      'Perkutan pinnfixation',
      'Komplikationer (compartment, nervskada)',
    ],
  },
];

// Samla alla subspecialitet-mål
export const SUBSPECIALITET_MÅL: SocialstyrelseMål[] = [
  ...FOTKIRURGI_MÅL,
  ...HANDKIRURGI_MÅL,
  ...SPORTORTOPEDI_MÅL,
  ...TUMÖRORTOPEDI_MÅL,
  ...BARNORTOPEDI_MÅL,
];

// Utility functions
export function getMålForLevel(level: 'student' | 'at' | 'st1' | 'st2' | 'st3' | 'st4' | 'st5' | 'st-allmänmedicin' | 'st-akutsjukvård' | 'specialist-ortopedi' | 'specialist-allmänmedicin' | 'specialist-akutsjukvård'): SocialstyrelseMål[] {
  if (level === 'student') return LÄKARPROGRAMMET_MÅL;
  if (level === 'at') return [...AT_MÅL, ...AT_TENTAMEN_MÅL];
  if (level === 'st-allmänmedicin') return ST_ALLMÄNMEDICIN_ORTOPEDI_MÅL;
  if (level === 'st-akutsjukvård') return ST_AKUTSJUKVÅRD_ORTOPEDI_MÅL;
  if (level === 'specialist-ortopedi') return [...SPECIALIST_FORTBILDNING_MÅL, ...SPECIALISTEXAMEN_MÅL];
  if (level.startsWith('specialist')) return SPECIALIST_FORTBILDNING_MÅL;
  // Must be an ST ortho level (st1-st5)
  if (level in ST_ORTOPEDI_MÅL) return ST_ORTOPEDI_MÅL[level as keyof typeof ST_ORTOPEDI_MÅL];
  return [];
}

export function getAllMålForLevel(level: 'student' | 'at' | 'st1' | 'st2' | 'st3' | 'st4' | 'st5' | 'st-allmänmedicin' | 'st-akutsjukvård' | 'specialist-ortopedi' | 'specialist-allmänmedicin' | 'specialist-akutsjukvård'): SocialstyrelseMål[] {
  // För ST-ortopedi (st1-st5), inkludera även tidigare års mål
  if (level.startsWith('st') && level.match(/^st[1-5]$/)) {
    const stYear = parseInt(level.replace('st', ''));
    let allMål: SocialstyrelseMål[] = [];

    for (let i = 1; i <= stYear; i++) {
      const levelKey = `st${i}` as 'st1' | 'st2' | 'st3' | 'st4' | 'st5';
      allMål = [...allMål, ...ST_ORTOPEDI_MÅL[levelKey]];
    }

    return allMål;
  }

  // För andra ST-typer och specialister, returnera bara deras specifika mål
  return getMålForLevel(level);
}

export function getMålByCategory(level: string, category: string): SocialstyrelseMål[] {
  const validLevel = toLevelType(level);
  if (!validLevel) return [];
  const allMål = getMålForLevel(validLevel as EducationLevel);
  return allMål.filter(mål => mål.category === category);
}

export function getRequiredMål(level: string): SocialstyrelseMål[] {
  const validLevel = toLevelType(level);
  if (!validLevel) return [];
  const allMål = getMålForLevel(validLevel as EducationLevel);
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

/**
 * Get all goals across all levels
 */
export function getAllMål(): SocialstyrelseMål[] {
  const allGoals = [
    ...LÄKARPROGRAMMET_MÅL,
    ...AT_MÅL,
    ...AT_TENTAMEN_MÅL,
    ...Object.values(ST_ORTOPEDI_MÅL).flat(),
    ...ST_ALLMÄNMEDICIN_ORTOPEDI_MÅL,
    ...ST_AKUTSJUKVÅRD_ORTOPEDI_MÅL,
    ...SPECIALIST_FORTBILDNING_MÅL,
    ...SPECIALISTEXAMEN_MÅL,
    ...SUBSPECIALITET_MÅL,
  ];

  // Remove duplicates by ID
  const uniqueGoals = Array.from(
    new Map(allGoals.map(goal => [goal.id, goal])).values()
  );

  return uniqueGoals;
}

/**
 * Get goals for a specific subspecialty
 */
export function getMålForSubspecialty(subspecialty: 'fotkirurgi' | 'handkirurgi' | 'sportortopedi' | 'tumörortopedi' | 'barnortopedi' | 'ryggradskirurgi'): SocialstyrelseMål[] {
  switch (subspecialty) {
    case 'fotkirurgi':
      return FOTKIRURGI_MÅL;
    case 'handkirurgi':
      return HANDKIRURGI_MÅL;
    case 'sportortopedi':
      return SPORTORTOPEDI_MÅL;
    case 'tumörortopedi':
      return TUMÖRORTOPEDI_MÅL;
    case 'barnortopedi':
      return BARNORTOPEDI_MÅL;
    case 'ryggradskirurgi':
      // TODO: Add spine surgery goals
      return [];
    default:
      return [];
  }
}

/**
 * Get goals for a specific domain (used in question generation)
 * Maps OrtoKompanion domains to relevant Socialstyrelsen goals
 */
export function getMålForDomain(
  domain: 'trauma' | 'höft' | 'knä' | 'axel-armbåge' | 'hand-handled' | 'fot-fotled' | 'rygg' | 'sport' | 'tumör',
  level: 'student' | 'at' | 'st1' | 'st2' | 'st3' | 'st4' | 'st5' | 'st-allmänmedicin' | 'st-akutsjukvård' | 'specialist-ortopedi' | 'specialist-allmänmedicin' | 'specialist-akutsjukvård'
): SocialstyrelseMål[] {
  // Get base goals for level
  const levelGoals = getMålForLevel(level);

  // Get all goals for filtering
  const allGoals = getAllGoals();

  // Define domain-specific category mappings
  const domainCategories: Record<string, string[]> = {
    trauma: [
      'Traumaortopedi',
      'Traumahandläggning',
      'Akut traumahandläggning',
      'Frakturhandläggning akut',
      'Frakturbehandling',
      'Kompartmentsyndrom',
      'Akut handläggning',
    ],
    höft: [
      'Ledersättning',
      'Avancerad artroplastik',
      'Revisionskirurgi',
      'Komplexa revisioner',
      'Elektivortopedi',
    ],
    knä: [
      'Ledersättning',
      'Avancerad artroplastik',
      'Revisionskirurgi',
      'Sportortopedi', // ACL, menisk
      'Elektivortopedi',
    ],
    'axel-armbåge': [
      'Elektivortopedi',
      'Ledersättning',
      'Sportortopedi', // Rotatorcuff
      'Traumaortopedi', // Frakturer
    ],
    'hand-handled': [
      'Handkirurgi',
      'subspeciality-hand',
      'Traumaortopedi', // Handfrakturer
    ],
    'fot-fotled': [
      'subspeciality-foot',
      'Traumaortopedi', // Fotledsfrakturer
      'Elektivortopedi',
    ],
    rygg: [
      'Ryggkirurgi',
      'Traumaortopedi', // Ryggradfrakturer
    ],
    sport: [
      'Sportortopedi',
      'subspeciality-sport',
      'Traumaortopedi', // Sportskador
    ],
    tumör: [
      'Tumörortopedi',
      'subspeciality-tumor',
    ],
  };

  const relevantCategories = domainCategories[domain] || [];

  // Filter goals by relevant categories
  const domainSpecificGoals = allGoals.filter(goal =>
    relevantCategories.some(cat =>
      goal.category.toLowerCase().includes(cat.toLowerCase())
    )
  );

  // Combine level-specific goals with domain-specific goals
  const combinedGoals = [...levelGoals, ...domainSpecificGoals];

  // Remove duplicates by ID
  const uniqueGoals = Array.from(
    new Map(combinedGoals.map(goal => [goal.id, goal])).values()
  );

  return uniqueGoals;
}

/**
 * Competency areas for categorization
 */
export const COMPETENCY_AREAS = {
  'Diagnostik och behandling': 'Diagnostik och behandling',
  'Kirurgiska färdigheter': 'Kirurgiska färdigheter',
  'Akut omhändertagande': 'Akut omhändertagande',
  'Rehabilitering': 'Rehabilitering',
  'Kommunikation': 'Kommunikation',
  'Professionalism': 'Professionalism',
  'Ledarskap': 'Ledarskap',
} as const;
