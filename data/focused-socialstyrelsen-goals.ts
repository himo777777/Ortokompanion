/**
 * Focused Socialstyrelsen Goals Database
 * Complete implementation for: Ortopedi, Akutsjukvård, Allmänmedicin, Läkarexamen
 * Based on official HSLF-FS 2021:8 requirements
 */

export interface SocialstyrelsensGoal {
  id: string;
  program: 'läkarexamen' | 'bt' | 'at' | 'st';
  specialty: 'läkarexamen' | 'allmänmedicin' | 'akutsjukvård' | 'ortopedi';
  year?: number;
  title: string;
  description: string;
  category: string;
  competencyArea:
    | 'medicinsk-kunskap'
    | 'klinisk-färdighet'
    | 'kirurgisk-färdighet'
    | 'kommunikation'
    | 'professionalism'
    | 'samverkan'
    | 'utveckling'
    | 'ledarskap'
    | 'patientsäkerhet';
  required: boolean;
  assessmentCriteria: string[];
  clinicalScenarios?: string[];
  associatedDiagnoses?: string[]; // ICD-10-SE codes
  associatedProcedures?: string[]; // KVÅ codes
  minimumCases?: number;
  minimumProcedures?: number;
  references?: string[]; // Swedish guidelines
}

// ==================== LÄKAREXAMEN (Medical School) ====================
// Grundläggande mål för alla läkarstudenter med ortopedisk relevans

export const LÄKAREXAMEN_GOALS: SocialstyrelsensGoal[] = [
  // Year 1-2: Pre-clinical
  {
    id: 'lex-001',
    program: 'läkarexamen',
    specialty: 'läkarexamen',
    year: 1,
    title: 'Anatomi - Rörelseapparaten',
    description: 'Behärska normal anatomi för skelett, leder, muskler, nerver och kärl',
    category: 'Preklinisk kunskap',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Identifiera alla skelettstrukturer på röntgen och MRT',
      'Beskriva ledernas uppbyggnad, funktion och biomekanik',
      'Förklara muskelgruppernas ursprung, fäste och innervation',
      'Känna till perifer nervfördelning och dermatomkartor',
      'Beskriva kärlförsörjningen till extremiteterna'
    ],
    clinicalScenarios: [
      'Tolka normala röntgenbilder',
      'Förklara rörelseinskränkning anatomiskt',
      'Bedöma nervskada kliniskt'
    ]
  },
  {
    id: 'lex-002',
    program: 'läkarexamen',
    specialty: 'läkarexamen',
    year: 2,
    title: 'Fysiologi - Frakturläkning och vävnadsreparation',
    description: 'Förstå normal läkningsprocess för skelett och mjukdelar',
    category: 'Preklinisk kunskap',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Beskriva de 4 faserna av frakturläkning',
      'Förklara faktorer som påverkar läkning',
      'Identifiera läkningskomplikationer',
      'Förstå senläkning och ligamentläkning',
      'Känna till brosk- och meniskläkning'
    ],
    references: ['Rockwood and Green\'s Fractures', 'Campbell\'s Operative Orthopaedics']
  },
  {
    id: 'lex-003',
    program: 'läkarexamen',
    specialty: 'läkarexamen',
    year: 2,
    title: 'Patologi - Muskuloskeletala sjukdomar',
    description: 'Grundläggande förståelse för ortopedisk patologi',
    category: 'Preklinisk kunskap',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Förstå artros patogenes och stadieindelning',
      'Känna till inflammatoriska ledsjukdomar',
      'Identifiera metabola skelettsjukdomar',
      'Förstå tumörpatologi i skelett',
      'Känna till infektioner i skelett och leder'
    ],
    associatedDiagnoses: ['M17', 'M06', 'M80', 'M86', 'C40']
  },

  // Year 3-4: Clinical introduction
  {
    id: 'lex-004',
    program: 'läkarexamen',
    specialty: 'läkarexamen',
    year: 3,
    title: 'Klinisk undersökningsteknik - Ortopedi',
    description: 'Systematisk ortopedisk undersökning enligt Look-Feel-Move',
    category: 'Klinisk färdighet',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Utföra inspektion systematiskt',
      'Palpera anatomiska landmärken korrekt',
      'Bedöma aktiv och passiv rörlighet',
      'Utföra specialtester för varje led',
      'Genomföra neurologisk undersökning',
      'Dokumentera fynd enligt SOAP'
    ],
    clinicalScenarios: [
      'Undersöka patient med knäsmärta',
      'Bedöma skulderinstabilitet',
      'Utföra ryggundersökning'
    ],
    minimumCases: 50
  },
  {
    id: 'lex-005',
    program: 'läkarexamen',
    specialty: 'läkarexamen',
    year: 3,
    title: 'Radiologi - Grundläggande skelettröntgen',
    description: 'Tolka vanliga röntgenundersökningar av skelett',
    category: 'Diagnostik',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Känna igen normal anatomi på röntgen',
      'Identifiera uppenbara frakturer',
      'Se ledförändringar vid artros',
      'Identifiera luxationer',
      'Förstå när CT/MRT är indicerat'
    ],
    clinicalScenarios: [
      'Bedöma handledsfraktur',
      'Identifiera höftfraktur',
      'Se artrosförändringar'
    ]
  },
  {
    id: 'lex-006',
    program: 'läkarexamen',
    specialty: 'läkarexamen',
    year: 4,
    title: 'Akut traumaomhändertagande',
    description: 'Initial handläggning av skadade patienter enligt ATLS',
    category: 'Akutmedicin',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Utföra ABCDE-bedömning',
      'Prioritera livshotande tillstånd',
      'Stabilisera frakturer temporärt',
      'Ge adekvat smärtlindring',
      'Dokumentera traumamekanism'
    ],
    associatedDiagnoses: ['T07', 'T14.9'],
    clinicalScenarios: [
      'Multitrauma efter bilolycka',
      'Fallolycka hos äldre',
      'Idrottsskada'
    ]
  },

  // Year 5-6: Clinical rotations
  {
    id: 'lex-007',
    program: 'läkarexamen',
    specialty: 'läkarexamen',
    year: 5,
    title: 'Ortopedisk rotation - Vanliga tillstånd',
    description: 'Handlägga vanliga ortopediska problem under handledning',
    category: 'Klinisk rotation',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Handlägga enklare frakturer',
      'Anlägga gips och skenor',
      'Assistera vid operationer',
      'Sköta postoperativ vård',
      'Delta i mottagningsarbete'
    ],
    minimumCases: 100,
    clinicalScenarios: [
      'Radiusfraktur',
      'Fotledsdistorsion',
      'Meniskskada',
      'Höftfraktur hos äldre'
    ]
  },
  {
    id: 'lex-008',
    program: 'läkarexamen',
    specialty: 'läkarexamen',
    year: 5,
    title: 'Beslutsstöd och riktlinjer',
    description: 'Använda validerade beslutsstöd i klinisk praxis',
    category: 'Evidensbaserad medicin',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Tillämpa Ottawa Ankle Rules',
      'Använda Ottawa Knee Rules',
      'Känna till NEXUS-kriterierna',
      'Förstå Canadian C-spine Rule',
      'Använda Pittsburgh Knee Rules'
    ],
    references: ['Socialstyrelsen riktlinjer', 'SBU rapporter']
  },
  {
    id: 'lex-009',
    program: 'läkarexamen',
    specialty: 'läkarexamen',
    year: 6,
    title: 'Interprofessionellt samarbete',
    description: 'Arbeta i multiprofessionella team inom ortopedi',
    category: 'Samverkan',
    competencyArea: 'samverkan',
    required: true,
    assessmentCriteria: [
      'Kommunicera med fysioterapeuter',
      'Samarbeta med arbetsterapeuter',
      'Konsultera ortopedtekniker',
      'Delta i vårdplanering',
      'Respektera andras kompetens'
    ]
  },
  {
    id: 'lex-010',
    program: 'läkarexamen',
    specialty: 'läkarexamen',
    year: 6,
    title: 'Patientsäkerhet inom ortopedi',
    description: 'Identifiera och förebygga komplikationer',
    category: 'Patientsäkerhet',
    competencyArea: 'patientsäkerhet',
    required: true,
    assessmentCriteria: [
      'Känna igen kompartmentsyndrom',
      'Förebygga tromboembolism',
      'Identifiera infektion postoperativt',
      'Hantera nervskador',
      'Rapportera avvikelser'
    ],
    associatedDiagnoses: ['T79.6', 'T81.4', 'M96.6']
  }
];

// ==================== AKUTSJUKVÅRD (Emergency Medicine) ====================

export const AKUTSJUKVÅRD_GOALS: SocialstyrelsensGoal[] = [
  // ST Year 1
  {
    id: 'akut-001',
    program: 'st',
    specialty: 'akutsjukvård',
    year: 1,
    title: 'ATLS - Advanced Trauma Life Support',
    description: 'Systematisk handläggning av traumapatienter',
    category: 'Traumatologi',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Genomföra primär bedömning (ABCDE) inom 2 minuter',
      'Identifiera och åtgärda livshotande tillstånd',
      'Utföra sekundär bedömning systematiskt',
      'Koordinera traumateam',
      'Dokumentera enligt traumajournal'
    ],
    associatedDiagnoses: ['T07', 'T14', 'S06', 'S27', 'S36'],
    minimumCases: 50,
    references: ['ATLS Student Manual 10th Edition']
  },
  {
    id: 'akut-002',
    program: 'st',
    specialty: 'akutsjukvård',
    year: 1,
    title: 'Ortopediska akutfall',
    description: 'Handläggning av akuta muskuloskeletala tillstånd',
    category: 'Ortopedisk akutmedicin',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Diagnostisera kompartmentsyndrom kliniskt',
      'Handlägga öppna frakturer enligt Gustilo',
      'Bedöma kärl- och nervstatus',
      'Reponera luxationer under sedering',
      'Anlägga temporär immobilisering'
    ],
    associatedDiagnoses: ['T79.6', 'S72', 'S82', 'S43', 'S73'],
    associatedProcedures: ['NHJ20', 'TNX10', 'NDM20'],
    minimumProcedures: 30
  },
  {
    id: 'akut-003',
    program: 'st',
    specialty: 'akutsjukvård',
    year: 1,
    title: 'Smärtlindring vid trauma',
    description: 'Multimodal smärtbehandling vid akuta skador',
    category: 'Smärtbehandling',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Bedöma smärta systematiskt',
      'Ge adekvat analgesi snabbt',
      'Utföra nervblockader',
      'Använda procedursedering säkert',
      'Monitorera biverkningar'
    ],
    associatedProcedures: ['NABC', 'NBCB', 'ZXA00']
  },

  // ST Year 2-3
  {
    id: 'akut-004',
    program: 'st',
    specialty: 'akutsjukvård',
    year: 2,
    title: 'Geriatrisk traumatologi',
    description: 'Handläggning av trauma hos äldre',
    category: 'Geriatrik',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Bedöma fallrisk och fallorsaker',
      'Handlägga höftfrakturer enligt fast-track',
      'Optimera preoperativt',
      'Identifiera delirium',
      'Planera tidig mobilisering'
    ],
    associatedDiagnoses: ['S72.0', 'S72.1', 'R26.2', 'F05'],
    references: ['Socialstyrelsen - Vård vid höftfraktur']
  },
  {
    id: 'akut-005',
    program: 'st',
    specialty: 'akutsjukvård',
    year: 2,
    title: 'Pediatrisk ortopedisk akutmedicin',
    description: 'Handläggning av skelettskador hos barn',
    category: 'Pediatrik',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Tolka tillväxtzonsskador (Salter-Harris)',
      'Handlägga suprakondylär humerusfraktur',
      'Bedöma barnmisshandel',
      'Använda ålderadekvat smärtlindring',
      'Kommunicera med barn och föräldrar'
    ],
    associatedDiagnoses: ['S42.4', 'S52.1', 'S79'],
    minimumCases: 30
  },
  {
    id: 'akut-006',
    program: 'st',
    specialty: 'akutsjukvård',
    year: 3,
    title: 'Katastrofmedicin och masskadehändelse',
    description: 'Handläggning vid många skadade',
    category: 'Katastrofmedicin',
    competencyArea: 'ledarskap',
    required: true,
    assessmentCriteria: [
      'Triagera enligt START/SALT',
      'Leda medicinskt arbete på skadeplats',
      'Koordinera resurser',
      'Dokumentera under kaotiska förhållanden',
      'Delta i debriefing'
    ],
    clinicalScenarios: [
      'Buskrock med 20 skadade',
      'Byggnadskollaps',
      'Tågolycka'
    ]
  },

  // ST Year 4-5
  {
    id: 'akut-007',
    program: 'st',
    specialty: 'akutsjukvård',
    year: 4,
    title: 'Ultraljud i akutmedicin (POCUS)',
    description: 'Point-of-care ultrasound vid trauma',
    category: 'Diagnostik',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Utföra eFAST-undersökning',
      'Bedöma frakturer med ultraljud',
      'Vägleda nervblockader',
      'Identifiera mjukdelsskador',
      'Dokumentera fynd korrekt'
    ],
    minimumProcedures: 100,
    references: ['EFAST protokoll', 'ACEP Guidelines']
  },
  {
    id: 'akut-008',
    program: 'st',
    specialty: 'akutsjukvård',
    year: 5,
    title: 'Handledning och utbildning',
    description: 'Undervisa i akut ortopedisk handläggning',
    category: 'Pedagogik',
    competencyArea: 'ledarskap',
    required: true,
    assessmentCriteria: [
      'Handleda AT/BT-läkare',
      'Undervisa på ATLS-kurser',
      'Leda simuleringsövningar',
      'Ge konstruktiv feedback',
      'Utveckla utbildningsmaterial'
    ]
  }
];

// ==================== ALLMÄNMEDICIN (General Practice) ====================

export const ALLMÄNMEDICIN_GOALS: SocialstyrelsensGoal[] = [
  // ST Year 1-2
  {
    id: 'allm-001',
    program: 'st',
    specialty: 'allmänmedicin',
    year: 1,
    title: 'Muskuloskeletal primärvård',
    description: 'Handlägga vanliga ortopediska besvär i primärvård',
    category: 'Ortopedi i primärvård',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Bedöma och behandla ryggsmärta enligt SBU',
      'Handlägga nackbesvär',
      'Diagnostisera och behandla tendiniter',
      'Utföra ledinjektioner',
      'Identifiera när remiss till ortoped behövs'
    ],
    associatedDiagnoses: ['M54', 'M75', 'M77', 'M25.5'],
    minimumCases: 200,
    references: ['SBU - Ländryggssmärta', 'Läkemedelsverket - Smärtbehandling']
  },
  {
    id: 'allm-002',
    program: 'st',
    specialty: 'allmänmedicin',
    year: 1,
    title: 'Artros i primärvård',
    description: 'Diagnostik och konservativ behandling av artros',
    category: 'Reumatologi',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Ställa diagnos enligt ACR-kriterier',
      'Initiera basbehandling (information, träning, viktminskning)',
      'Farmakologisk behandling enligt riktlinjer',
      'Remittera för artroskopisk/kirurgisk bedömning',
      'Följa upp behandlingseffekt'
    ],
    associatedDiagnoses: ['M17', 'M16', 'M19'],
    minimumCases: 100,
    references: ['Socialstyrelsen - Rörelseorganens sjukdomar']
  },
  {
    id: 'allm-003',
    program: 'st',
    specialty: 'allmänmedicin',
    year: 2,
    title: 'Idrottsmedicin i primärvård',
    description: 'Handlägga idrottsrelaterade skador',
    category: 'Idrottsmedicin',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Bedöma akuta mjukdelsskador',
      'Behandla överbelastningsskador',
      'Ge råd om återgång till idrott',
      'Förebyggande åtgärder',
      'Samarbeta med fysioterapeut'
    ],
    associatedDiagnoses: ['S83.5', 'M76', 'S93.4'],
    clinicalScenarios: [
      'Löparknä',
      'Tennisarmbåge',
      'Hälseneruptur'
    ]
  },

  // ST Year 3-4
  {
    id: 'allm-004',
    program: 'st',
    specialty: 'allmänmedicin',
    year: 3,
    title: 'Osteoporos prevention och behandling',
    description: 'Handlägga osteoporos i primärvård',
    category: 'Metabola skelettsjukdomar',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Riskbedömning med FRAX',
      'Indikationer för DXA',
      'Initiering av behandling',
      'Uppföljning och monitorering',
      'Frakturprevention'
    ],
    associatedDiagnoses: ['M80', 'M81'],
    references: ['Läkemedelsverket - Osteoporos']
  },
  {
    id: 'allm-005',
    program: 'st',
    specialty: 'allmänmedicin',
    year: 3,
    title: 'Rehabilitering efter ortopedisk kirurgi',
    description: 'Primärvårdens roll i postoperativ rehabilitering',
    category: 'Rehabilitering',
    competencyArea: 'samverkan',
    required: true,
    assessmentCriteria: [
      'Koordinera rehabiliteringsteam',
      'Monitorera rehabiliteringsframsteg',
      'Identifiera komplikationer',
      'Optimera smärtlindring',
      'Stödja återgång till arbete'
    ],
    clinicalScenarios: [
      'Efter höftprotesoperation',
      'Efter korsbandsrekonstruktion',
      'Efter ryggkirurgi'
    ]
  },
  {
    id: 'allm-006',
    program: 'st',
    specialty: 'allmänmedicin',
    year: 4,
    title: 'Kronisk smärta - muskuloskeletal',
    description: 'Handlägga långvarig smärta från rörelseapparaten',
    category: 'Smärtmedicin',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Multimodal smärtanalys',
      'Biopsykosocial bedömning',
      'Icke-farmakologisk behandling',
      'Läkemedelsoptimering',
      'Samverkan med smärtklinik'
    ],
    associatedDiagnoses: ['M79.3', 'M54.5', 'G56'],
    references: ['Socialstyrelsen - Nationella riktlinjer för rörelseorganens sjukdomar']
  }
];

// ==================== ORTOPEDI (Orthopedics) - COMPREHENSIVE ====================

export const ORTOPEDI_GOALS: SocialstyrelsensGoal[] = [
  // ST Year 1: Foundation
  {
    id: 'ort-001',
    program: 'st',
    specialty: 'ortopedi',
    year: 1,
    title: 'Höftfrakturkirurgi enligt svenska riktlinjer',
    description: 'Komplett handläggning av höftfrakturer från ankomst till rehabilitering',
    category: 'Höftkirurgi',
    competencyArea: 'kirurgisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Klassificera enligt Garden och AO/OTA',
      'Välja operationsmetod baserat på frakturtyp och patientfaktorer',
      'Operera collumfraktur med skruvar eller proteshuvud',
      'Operera pertrokantär fraktur med märgspik eller DHS',
      'Följa fast-track protokoll',
      'Registrera i Rikshöft'
    ],
    associatedDiagnoses: ['S72.0', 'S72.1', 'S72.2'],
    associatedProcedures: ['NFB19', 'NFB29', 'NFB39', 'NFB49', 'NFB59', 'NFB62', 'NFB99'],
    minimumProcedures: 30,
    clinicalScenarios: [
      'Garden IV hos 85-årig kvinna',
      'Pertrokantär instabil fraktur',
      'Patologisk höftfraktur',
      'Höftfraktur hos patient med Parkinsons'
    ],
    references: ['Rikshöft Årsrapport', 'Socialstyrelsen - Vård vid höftfraktur']
  },
  {
    id: 'ort-002',
    program: 'st',
    specialty: 'ortopedi',
    year: 1,
    title: 'Distal radiusfraktur',
    description: 'Handläggning av handledsfrakturer',
    category: 'Handkirurgi',
    competencyArea: 'kirurgisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Klassificera enligt AO och Frykman',
      'Reponera i lokalbedövning',
      'Anlägga dorsal gipsskena',
      'Operera med volar platta',
      'Handlägga komplikationer'
    ],
    associatedDiagnoses: ['S52.5', 'S52.6'],
    associatedProcedures: ['NCJ62', 'NCJ69', 'TNC10'],
    minimumProcedures: 40,
    clinicalScenarios: [
      'Colles fraktur hos 70-årig',
      'Smiths fraktur',
      'Intraartikulär fraktur hos yngre'
    ]
  },
  {
    id: 'ort-003',
    program: 'st',
    specialty: 'ortopedi',
    year: 1,
    title: 'Fotledsfraktur',
    description: 'Operativ behandling av malleolfrakturer',
    category: 'Fotkirurgi',
    competencyArea: 'kirurgisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Klassificera enligt Weber och Lauge-Hansen',
      'Bedöma syndesmosinstabilitet',
      'Operera uni-, bi- och trimalleolära frakturer',
      'Positionskontroll med genomlysning',
      'Postoperativ regim'
    ],
    associatedDiagnoses: ['S82.5', 'S82.6', 'S82.8'],
    associatedProcedures: ['NHJ62', 'NHJ72', 'NHJ82'],
    minimumProcedures: 25
  },

  // ST Year 2: Expanding skills
  {
    id: 'ort-004',
    program: 'st',
    specialty: 'ortopedi',
    year: 2,
    title: 'Artroskopisk baskirurgi - knä',
    description: 'Grundläggande knäartroskopi',
    category: 'Artroskopi',
    competencyArea: 'kirurgisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Etablera standardportaler säkert',
      'Genomföra diagnostisk artroskopi',
      'Utföra partiell meniskresektion',
      'Hantera osteokondral skada',
      'Dokumentera fynd enligt IKDC'
    ],
    associatedDiagnoses: ['M23.2', 'M23.3', 'M17'],
    associatedProcedures: ['NGD11', 'NGD91', 'NGF31'],
    minimumProcedures: 50,
    references: ['ESSKA Guidelines']
  },
  {
    id: 'ort-005',
    program: 'st',
    specialty: 'ortopedi',
    year: 2,
    title: 'Primär knäproteskirurgi',
    description: 'Total knäartroplastik för artros',
    category: 'Proteskirurgi',
    competencyArea: 'kirurgisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Preoperativ planering med mallar',
      'Exponering via medial parapatellar',
      'Benresektion med styrinstrument',
      'Ligamentbalansering',
      'Cementering och positionering',
      'Registrering i SKAR'
    ],
    associatedDiagnoses: ['M17.1', 'M17.3', 'M17.5'],
    associatedProcedures: ['NGB19', 'NGB29', 'NGB49'],
    minimumProcedures: 20,
    references: ['Svenska Knäprotesregistret', 'Knee Society Score']
  },
  {
    id: 'ort-006',
    program: 'st',
    specialty: 'ortopedi',
    year: 2,
    title: 'Axelkirurgi - impingement och rotatorkuff',
    description: 'Handläggning av subakromiella besvär',
    category: 'Axelkirurgi',
    competencyArea: 'kirurgisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Klinisk diagnostik med specialtester',
      'MRT-tolkning av rotatorkuffen',
      'Artroskopisk subakromial dekompression',
      'Rotatorkuffsutur (enklare)',
      'Postoperativ rehabilitering'
    ],
    associatedDiagnoses: ['M75.3', 'M75.1', 'S46.0'],
    associatedProcedures: ['NBD91', 'NBK59'],
    minimumProcedures: 15
  },

  // ST Year 3: Advanced procedures
  {
    id: 'ort-007',
    program: 'st',
    specialty: 'ortopedi',
    year: 3,
    title: 'Primär höftproteskirurgi',
    description: 'Total höftartroplastik',
    category: 'Proteskirurgi',
    competencyArea: 'kirurgisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Preoperativ planering',
      'Val av implantat och fixation',
      'Operera via bakre eller lateralt',
      'Bedöma stabilitet och benlängd',
      'Förebygga luxation',
      'Registrera i SHPR'
    ],
    associatedDiagnoses: ['M16.1', 'M16.3', 'M87'],
    associatedProcedures: ['NFB29', 'NFB39', 'NFB49'],
    minimumProcedures: 30,
    references: ['Svenska Höftprotesregistret']
  },
  {
    id: 'ort-008',
    program: 'st',
    specialty: 'ortopedi',
    year: 3,
    title: 'Ryggkirurgi - diskbråck och stenos',
    description: 'Grundläggande degenerativ ryggkirurgi',
    category: 'Ryggkirurgi',
    competencyArea: 'kirurgisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Tolka MRT rygg',
      'Indikationer för kirurgi',
      'Mikrodiskektomi',
      'Laminektomi för stenos',
      'Identifiera och hantera durarift'
    ],
    associatedDiagnoses: ['M51.1', 'M48.0', 'M47.2'],
    associatedProcedures: ['ABC26', 'ABC36', 'ABC56'],
    minimumProcedures: 20,
    references: ['Swespine register']
  },
  {
    id: 'ort-009',
    program: 'st',
    specialty: 'ortopedi',
    year: 3,
    title: 'Pediatrisk ortopedi - grundläggande',
    description: 'Vanliga barnortopediska tillstånd',
    category: 'Barnortopedi',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Bedöma höftdysplasi',
      'Handlägga Perthes sjukdom',
      'Behandla suprakondylär humerusfraktur',
      'Förstå tillväxtzonsskador',
      'Kommunicera med barn och föräldrar'
    ],
    associatedDiagnoses: ['Q65', 'M91.1', 'S42.4', 'S79'],
    minimumCases: 50
  },

  // ST Year 4: Subspecialty exposure
  {
    id: 'ort-010',
    program: 'st',
    specialty: 'ortopedi',
    year: 4,
    title: 'Tumörortopedi - grundläggande',
    description: 'Handläggning av skelettumörer',
    category: 'Tumörortopedi',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Känna igen aggressiva röntgenförändringar',
      'Biopsiprinciper',
      'Handlägga patologiska frakturer',
      'Samarbeta med onkolog',
      'Palliativ ortopedisk kirurgi'
    ],
    associatedDiagnoses: ['C40', 'C41', 'C79.5', 'D16'],
    clinicalScenarios: [
      'Patologisk femurfraktur',
      'Osteosarkom hos tonåring',
      'Metastas i ryggrad'
    ]
  },
  {
    id: 'ort-011',
    program: 'st',
    specialty: 'ortopedi',
    year: 4,
    title: 'Infektioner - osteomyelit och septisk artrit',
    description: 'Handläggning av muskuloskeletala infektioner',
    category: 'Infektionsortopedi',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Diagnostik med blodprov och bilddiagnostik',
      'Ledpunktion och odling',
      'Kirurgisk sanering',
      'Antibiotikabehandling',
      'Långtidsuppföljning'
    ],
    associatedDiagnoses: ['M86', 'M00', 'T84.5'],
    associatedProcedures: ['NHU20', 'NGU20', 'NFU20'],
    minimumCases: 20
  },
  {
    id: 'ort-012',
    program: 'st',
    specialty: 'ortopedi',
    year: 4,
    title: 'Revisionsproteskirurgi - introduktion',
    description: 'Handläggning av proteskomplikationer',
    category: 'Revisionskirurgi',
    competencyArea: 'kirurgisk-färdighet',
    required: false,
    assessmentCriteria: [
      'Utreda proteslossning',
      'Planera revision',
      'Hantera bendefekter',
      'Tvåstegsprocedur vid infektion',
      'Periprostetisk fraktur'
    ],
    associatedDiagnoses: ['T84.0', 'T84.5', 'M97'],
    associatedProcedures: ['NFU29', 'NGU29'],
    minimumCases: 10
  },

  // ST Year 5: Consolidation and specialization
  {
    id: 'ort-013',
    program: 'st',
    specialty: 'ortopedi',
    year: 5,
    title: 'Handledning och undervisning',
    description: 'Pedagogisk kompetens inom ortopedi',
    category: 'Pedagogik',
    competencyArea: 'ledarskap',
    required: true,
    assessmentCriteria: [
      'Handleda yngre kollegor',
      'Undervisa på kurser',
      'Utveckla utbildningsmaterial',
      'Bedöma andras kompetens',
      'Ge konstruktiv feedback'
    ]
  },
  {
    id: 'ort-014',
    program: 'st',
    specialty: 'ortopedi',
    year: 5,
    title: 'Kvalitetsarbete och forskning',
    description: 'Vetenskapligt förhållningssätt och kvalitetsutveckling',
    category: 'Utveckling',
    competencyArea: 'utveckling',
    required: true,
    assessmentCriteria: [
      'Genomföra kvalitetsprojekt',
      'Analysera registerdata',
      'Presentera på möten',
      'Skriva vetenskaplig artikel',
      'Kritiskt granska litteratur'
    ],
    references: ['GRADE metodik', 'CONSORT guidelines']
  },
  {
    id: 'ort-015',
    program: 'st',
    specialty: 'ortopedi',
    year: 5,
    title: 'Avancerad traumatologi',
    description: 'Komplexa frakturer och polytrauma',
    category: 'Traumatologi',
    competencyArea: 'kirurgisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Handlägga bäckenfrakturer',
      'Operera acetabulumfrakturer',
      'Damage control ortopedi',
      'Komplexa periprotesiska frakturer',
      'Leda traumateam'
    ],
    associatedDiagnoses: ['S32.4', 'S32.8', 'S72.4'],
    associatedProcedures: ['NFJ62', 'NAJ62'],
    minimumCases: 20
  }
];

// ==================== BT - BASTJÄNSTGÖRING (from 2021) ====================
// Obligatorisk 6-månaders tjänstgöring efter läkarexamen sedan 2021

export const BT_GOALS: SocialstyrelsensGoal[] = [
  // Akut omhändertagande
  {
    id: 'bt-001',
    program: 'bt',
    specialty: 'allmänmedicin',
    title: 'Initial bedömning enligt ABCDE',
    description: 'Systematisk initial bedömning av akut sjuk patient',
    category: 'Akut omhändertagande',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Utföra systematisk ABCDE-bedömning',
      'Identifiera livshotande tillstånd',
      'Prioritera åtgärder baserat på fynd',
      'Kommunicera fynd till teamet',
      'Dokumentera initial bedömning korrekt'
    ],
    clinicalScenarios: [
      'Andningspåverkad patient',
      'Cirkulatoriskt instabil patient',
      'Medvetandepåverkad patient'
    ],
    minimumCases: 50
  },
  {
    id: 'bt-002',
    program: 'bt',
    specialty: 'akutsjukvård',
    title: 'Basal hjärt-lungräddning (HLR)',
    description: 'Behärska HLR enligt svenska riktlinjer',
    category: 'Akut omhändertagande',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Utföra HLR enligt HLR-rådets riktlinjer',
      'Använda defibrillator korrekt',
      'Leda HLR i team',
      'Hantera luftväg under HLR',
      'Känna till läkemedel vid hjärtstopp'
    ],
    minimumProcedures: 5,
    references: ['Svenska HLR-rådet 2021']
  },
  {
    id: 'bt-003',
    program: 'bt',
    specialty: 'allmänmedicin',
    title: 'Anamnesupptagning och status',
    description: 'Strukturerad anamnes och fullständig kroppsundersökning',
    category: 'Grundläggande klinisk kompetens',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Ta omfattande och relevant anamnes',
      'Utföra systematisk kroppsundersökning',
      'Använda kliniska undersökningsmetoder korrekt',
      'Identifiera patologiska fynd',
      'Sammanfatta och presentera patientfall'
    ],
    minimumCases: 100
  },
  {
    id: 'bt-004',
    program: 'bt',
    specialty: 'allmänmedicin',
    title: 'Infektionssjukdomar och antibiotikabehandling',
    description: 'Diagnostik och behandling av vanliga infektioner enligt STRAMA',
    category: 'Medicinsk behandling',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Diagnostisera vanliga infektioner',
      'Välja antibiotika enligt STRAMA-riktlinjer',
      'Känna till resistensproblematik',
      'Bedöma när odling behövs',
      'Följa upp antibiotikabehandling'
    ],
    associatedDiagnoses: ['J18', 'N39', 'A46', 'L03'],
    minimumCases: 30,
    references: ['STRAMA nationella riktlinjer']
  },
  {
    id: 'bt-005',
    program: 'bt',
    specialty: 'allmänmedicin',
    title: 'Smärtbehandling',
    description: 'Bedöma och behandla akut och kronisk smärta',
    category: 'Medicinsk behandling',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Använda smärtskattningsinstrument',
      'Välja analgetika enligt trappstegsmodellen',
      'Känna till biverkningar och interaktioner',
      'Hantera opioidbehandling säkert',
      'Identifiera beroendeproblematik'
    ],
    minimumCases: 40
  },
  {
    id: 'bt-006',
    program: 'bt',
    specialty: 'allmänmedicin',
    title: 'Kommunikation med patient och anhöriga',
    description: 'Professionell kommunikation i olika kliniska situationer',
    category: 'Kommunikation',
    competencyArea: 'kommunikation',
    required: true,
    assessmentCriteria: [
      'Ge tydlig information om sjukdom och behandling',
      'Visa empati och lyssna aktivt',
      'Hantera svåra samtal',
      'Kommunicera dåliga nyheter',
      'Hantera språkbarriärer med tolk'
    ],
    minimumCases: 50
  },
  {
    id: 'bt-007',
    program: 'bt',
    specialty: 'allmänmedicin',
    title: 'Teamarbete och interprofessionell samverkan',
    description: 'Arbeta effektivt i vårdteam',
    category: 'Samverkan',
    competencyArea: 'samverkan',
    required: true,
    assessmentCriteria: [
      'Samarbeta med olika yrkeskategorier',
      'Kommunicera tydligt i teamet',
      'Respektera olika kompetenser',
      'Delta i vårdplanering',
      'Ge och ta emot konstruktiv feedback'
    ]
  },
  {
    id: 'bt-008',
    program: 'bt',
    specialty: 'allmänmedicin',
    title: 'Patientsäkerhet och avvikelserapportering',
    description: 'Arbeta patientsäkert och hantera avvikelser',
    category: 'Patientsäkerhet',
    competencyArea: 'patientsäkerhet',
    required: true,
    assessmentCriteria: [
      'Identifiera patientsäkerhetsrisker',
      'Rapportera avvikelser korrekt',
      'Delta i händelseanalys',
      'Följa hygienrutiner',
      'Använda WHO:s checklista för säker kirurgi'
    ],
    references: ['Patientsäkerhetslagen', 'WHO Patient Safety']
  },
  {
    id: 'bt-009',
    program: 'bt',
    specialty: 'allmänmedicin',
    title: 'Journalföring och intyg',
    description: 'Korrekt medicinsk dokumentation',
    category: 'Administration',
    competencyArea: 'professionalism',
    required: true,
    assessmentCriteria: [
      'Föra journal enligt patientdatalagen',
      'Skriva läkarintyg korrekt',
      'Dokumentera enligt SOAP-modellen',
      'Hantera sekretess och samtycke',
      'Använda journalsystem effektivt'
    ],
    references: ['Patientdatalagen', 'Socialstyrelsens föreskrifter om journalföring']
  },
  {
    id: 'bt-010',
    program: 'bt',
    specialty: 'ortopedi',
    title: 'Ortopedisk basundersökning',
    description: 'Grundläggande ortopedisk undersökningsteknik',
    category: 'Ortopedisk kompetens',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Undersöka alla stora leder systematiskt',
      'Utföra neurologisk undersökning av extremiteter',
      'Bedöma gångmönster och hållning',
      'Använda specifika ortopediska test',
      'Tolka basala röntgenbilder'
    ],
    minimumCases: 20
  },
  {
    id: 'bt-011',
    program: 'bt',
    specialty: 'ortopedi',
    title: 'Akuta ortopediska tillstånd',
    description: 'Initial handläggning av ortopediska akutfall',
    category: 'Ortopedisk kompetens',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Bedöma frakturmisstanke kliniskt',
      'Anlägga gips och stödförband',
      'Reponera enklare luxationer',
      'Identifiera kompartmentsyndrom',
      'Känna igen septisk artrit'
    ],
    associatedDiagnoses: ['S72', 'S52', 'S82', 'M86', 'T79.A'],
    minimumCases: 15
  },
  {
    id: 'bt-012',
    program: 'bt',
    specialty: 'allmänmedicin',
    title: 'Psykisk ohälsa - grundläggande bedömning',
    description: 'Identifiera och initialt hantera psykisk ohälsa',
    category: 'Psykiatri',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Bedöma suicidrisk',
      'Identifiera depression och ångest',
      'Känna till akut psykiatri',
      'Hantera agiterade patienter',
      'Initiera basbehandling'
    ],
    associatedDiagnoses: ['F32', 'F41', 'F10'],
    minimumCases: 20
  },
  {
    id: 'bt-013',
    program: 'bt',
    specialty: 'allmänmedicin',
    title: 'Pediatrisk baskunskap',
    description: 'Grundläggande barnmedicin för BT-läkare',
    category: 'Pediatrik',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Bedöma sjukt barn enligt triagesystem',
      'Känna till normalvärden för olika åldrar',
      'Identifiera allvarlig infektion hos barn',
      'Dosera läkemedel till barn',
      'Kommunicera med barn och föräldrar'
    ],
    minimumCases: 15
  },
  {
    id: 'bt-014',
    program: 'bt',
    specialty: 'allmänmedicin',
    title: 'Geriatrisk baskunskap',
    description: 'Grundläggande äldreomsorg och geriatrik',
    category: 'Geriatrik',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Utföra geriatrisk bedömning',
      'Identifiera skörhet och fallrisk',
      'Hantera polyfarmaci',
      'Bedöma kognitiv funktion',
      'Planera vård i livets slutskede'
    ],
    minimumCases: 20
  },
  {
    id: 'bt-015',
    program: 'bt',
    specialty: 'allmänmedicin',
    title: 'Etik och prioritering',
    description: 'Medicinsk etik och prioriteringsprinciper',
    category: 'Professionalism',
    competencyArea: 'professionalism',
    required: true,
    assessmentCriteria: [
      'Tillämpa de fyra etiska principerna',
      'Förstå prioriteringsplattformen',
      'Hantera etiska dilemman',
      'Respektera patientautonomi',
      'Följa tystnadsplikt och sekretess'
    ]
  }
];

// ==================== AT - ALLMÄNTJÄNSTGÖRING (historical, until 2020) ====================
// 21 månaders obligatorisk tjänstgöring (ersatt av BT 2021)

export const AT_GOALS: SocialstyrelsensGoal[] = [
  // Internmedicin (6 månader)
  {
    id: 'at-001',
    program: 'at',
    specialty: 'allmänmedicin',
    title: 'Internmedicinsk grundkompetens',
    description: 'Bred internmedicinsk kunskap under 6 månaders tjänstgöring',
    category: 'Internmedicin',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Handlägga hjärt-kärlsjukdomar',
      'Diagnostisera och behandla lungsjukdomar',
      'Hantera endokrina sjukdomar inklusive diabetes',
      'Bedöma och behandla njursjukdomar',
      'Handlägga gastroenterologiska problem'
    ],
    associatedDiagnoses: ['I50', 'J44', 'E11', 'N18', 'K92'],
    minimumCases: 200,
    minimumProcedures: 50
  },
  {
    id: 'at-002',
    program: 'at',
    specialty: 'allmänmedicin',
    title: 'EKG-tolkning och hjärtdiagnostik',
    description: 'Självständig EKG-tolkning och basal hjärtdiagnostik',
    category: 'Internmedicin',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Tolka normalt och patologiskt EKG',
      'Identifiera akut hjärtinfarkt',
      'Känna igen arytmier',
      'Bedöma QTc och andra riskfaktorer',
      'Indikation för ytterligare hjärtutredning'
    ],
    minimumProcedures: 100
  },
  {
    id: 'at-003',
    program: 'at',
    specialty: 'allmänmedicin',
    title: 'Akutmedicin på medicinavdelning',
    description: 'Handläggning av medicinska akutfall',
    category: 'Internmedicin',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Handlägga akut hjärtsvikt',
      'Behandla astma och KOL-exacerbation',
      'Hantera diabetesketoacidos',
      'Bedöma och behandla sepsis',
      'Handlägga akut konfusion'
    ],
    minimumCases: 100
  },

  // Kirurgi (6 månader)
  {
    id: 'at-004',
    program: 'at',
    specialty: 'akutsjukvård',
    title: 'Kirurgisk grundkompetens',
    description: 'Basal kirurgisk kunskap under 6 månaders tjänstgöring',
    category: 'Kirurgi',
    competencyArea: 'kirurgisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Bedöma akut buk',
      'Handlägga trauma enligt ATLS',
      'Utföra basala kirurgiska ingrepp',
      'Hantera postoperativa komplikationer',
      'Förstå indikationer för operation'
    ],
    minimumCases: 150,
    minimumProcedures: 30
  },
  {
    id: 'at-005',
    program: 'at',
    specialty: 'akutsjukvård',
    title: 'Sårbehandling och mindre kirurgi',
    description: 'Praktisk sårbehandling och mindre ingrepp',
    category: 'Kirurgi',
    competencyArea: 'kirurgisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Suturera olika typer av sår',
      'Incision och dränage av abscess',
      'Lokal anestesi och blockader',
      'Handlägga infekterade sår',
      'Bedöma läkningsprocess'
    ],
    minimumProcedures: 50
  },
  {
    id: 'at-006',
    program: 'at',
    specialty: 'ortopedi',
    title: 'Ortopedisk AT-kompetens',
    description: 'Ortopediska kunskaper under kirurgiplacering',
    category: 'Kirurgi/Ortopedi',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Bedöma frakturer kliniskt och radiologiskt',
      'Gipsa och bandagera',
      'Assistera vid ortopediska operationer',
      'Följa upp opererade patienter',
      'Handlägga ortopediska infektioner'
    ],
    minimumCases: 50
  },

  // Psykiatri (3 månader)
  {
    id: 'at-007',
    program: 'at',
    specialty: 'allmänmedicin',
    title: 'Psykiatrisk grundkompetens',
    description: 'Basal psykiatri under 3 månaders tjänstgöring',
    category: 'Psykiatri',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Diagnostisera affektiva sjukdomar',
      'Bedöma psykos och förvirringstillstånd',
      'Hantera självmordsrisk',
      'Behandla ångestsyndrom',
      'Förstå tvångsvård enligt LPT'
    ],
    associatedDiagnoses: ['F32', 'F31', 'F20', 'F41', 'F10'],
    minimumCases: 75
  },
  {
    id: 'at-008',
    program: 'at',
    specialty: 'allmänmedicin',
    title: 'Psykofarmakologi',
    description: 'Grundläggande psykofarmakologisk behandling',
    category: 'Psykiatri',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Välja antidepressiva läkemedel',
      'Hantera antipsykotika och biverkningar',
      'Behandla sömnstörningar',
      'Känna till beroendeproblematik',
      'Monitorera läkemedelsbehandling'
    ],
    minimumCases: 50
  },

  // Allmänmedicin (3 månader)
  {
    id: 'at-009',
    program: 'at',
    specialty: 'allmänmedicin',
    title: 'Primärvårdskompetens',
    description: 'Allmänmedicinsk kompetens på vårdcentral',
    category: 'Allmänmedicin',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Handlägga oselekterade patienter',
      'Utföra hälsokontroller och screening',
      'Behandla kroniska sjukdomar',
      'Hembesök och äldreomsorg',
      'Samverka med kommunal vård'
    ],
    minimumCases: 200
  },
  {
    id: 'at-010',
    program: 'at',
    specialty: 'allmänmedicin',
    title: 'Prevention och hälsofrämjande',
    description: 'Förebyggande medicin och livsstilsrådgivning',
    category: 'Allmänmedicin',
    competencyArea: 'kommunikation',
    required: true,
    assessmentCriteria: [
      'Genomföra hälsosamtal',
      'Motivera livsstilsförändringar',
      'Utföra vaccinationer',
      'Screening enligt nationella program',
      'Tobaksavvänjning'
    ],
    minimumCases: 50
  },

  // Valbar tjänstgöring (3 månader)
  {
    id: 'at-011',
    program: 'at',
    specialty: 'ortopedi',
    title: 'Fördjupad ortopedisk kompetens (valbar)',
    description: 'Fördjupning inom ortopedi under valbar placering',
    category: 'Valbar tjänstgöring',
    competencyArea: 'kirurgisk-färdighet',
    required: false,
    assessmentCriteria: [
      'Assistera vid elektiv ortopedisk kirurgi',
      'Handlägga postoperativa patienter självständigt',
      'Delta i ortopedisk mottagning',
      'Följa upp proteser och osteosyntesmaterial',
      'Utföra ledpunktioner'
    ],
    minimumCases: 75,
    minimumProcedures: 20
  },
  {
    id: 'at-012',
    program: 'at',
    specialty: 'akutsjukvård',
    title: 'Akutsjukvård (valbar)',
    description: 'Fördjupning inom akutmedicin',
    category: 'Valbar tjänstgöring',
    competencyArea: 'klinisk-färdighet',
    required: false,
    assessmentCriteria: [
      'Arbeta självständigt på akutmottagning',
      'Triagera enligt RETTS',
      'Handlägga multitrauma',
      'Leda akutteam',
      'Utföra akuta procedurer'
    ],
    minimumCases: 100
  },

  // Övergripande AT-kompetenser
  {
    id: 'at-013',
    program: 'at',
    specialty: 'allmänmedicin',
    title: 'Vetenskaplig kompetens',
    description: 'Grundläggande vetenskaplig förståelse',
    category: 'Vetenskap',
    competencyArea: 'utveckling',
    required: true,
    assessmentCriteria: [
      'Kritiskt granska medicinsk litteratur',
      'Förstå grundläggande statistik',
      'Delta i kvalitetsarbete',
      'Presentera patientfall vetenskapligt',
      'Förstå evidensbaserad medicin'
    ]
  },
  {
    id: 'at-014',
    program: 'at',
    specialty: 'allmänmedicin',
    title: 'Handledning och undervisning',
    description: 'Kunna handleda och undervisa',
    category: 'Pedagogik',
    competencyArea: 'ledarskap',
    required: true,
    assessmentCriteria: [
      'Handleda medicinstudenter',
      'Presentera på utbildning',
      'Ge konstruktiv feedback',
      'Planera undervisning',
      'Utvärdera lärande'
    ]
  },
  {
    id: 'at-015',
    program: 'at',
    specialty: 'allmänmedicin',
    title: 'Myndighetsutövning',
    description: 'Kunskap om läkarens myndighetsroll',
    category: 'Juridik',
    competencyArea: 'professionalism',
    required: true,
    assessmentCriteria: [
      'Utfärda dödsbevis och dödsorsaksintyg',
      'Hantera anmälningsplikt',
      'Känna till tvångsvård',
      'Skriva rättsintyg',
      'Förstå Lex Maria'
    ],
    references: ['Socialstyrelsen SOSFS 2005:29']
  },
  {
    id: 'at-016',
    program: 'at',
    specialty: 'allmänmedicin',
    title: 'Jour- och beredskapstjänstgöring',
    description: 'Kompetens för självständig jourtjänstgöring',
    category: 'Jourtjänstgöring',
    competencyArea: 'klinisk-färdighet',
    required: true,
    assessmentCriteria: [
      'Prioritera under hög arbetsbelastning',
      'Fatta snabba medicinska beslut',
      'Konsultera bakjour adekvat',
      'Hantera flera patienter samtidigt',
      'Arbeta hela jourpass säkert'
    ],
    minimumCases: 500
  },
  {
    id: 'at-017',
    program: 'at',
    specialty: 'allmänmedicin',
    title: 'Läkemedelsförskrivning',
    description: 'Säker och rationell läkemedelsbehandling',
    category: 'Farmakologi',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Förskriva enligt FASS och rekommendationer',
      'Identifiera interaktioner',
      'Dosera vid njur- och leversvikt',
      'Hantera biverkningar',
      'Följa förskrivningsregler'
    ],
    references: ['Läkemedelsverket', 'Kloka listan']
  },
  {
    id: 'at-018',
    program: 'at',
    specialty: 'allmänmedicin',
    title: 'Vårdhygien och smittskydd',
    description: 'Förebygga vårdrelaterade infektioner',
    category: 'Patientsäkerhet',
    competencyArea: 'patientsäkerhet',
    required: true,
    assessmentCriteria: [
      'Tillämpa basala hygienrutiner',
      'Hantera isolering och smittspårning',
      'Följa antibiotikapolicy',
      'Rapportera anmälningspliktiga sjukdomar',
      'Använda skyddsutrustning korrekt'
    ],
    references: ['Folkhälsomyndigheten', 'Vårdhandboken']
  },
  {
    id: 'at-019',
    program: 'at',
    specialty: 'allmänmedicin',
    title: 'Palliativ vård',
    description: 'Vård i livets slutskede',
    category: 'Palliativ medicin',
    competencyArea: 'kommunikation',
    required: true,
    assessmentCriteria: [
      'Bedöma och behandla smärta palliativt',
      'Hantera andra symtom i livets slut',
      'Kommunicera med döende och anhöriga',
      'Samarbeta med palliativa team',
      'Känna till brytpunktssamtal'
    ],
    minimumCases: 10,
    references: ['Nationella vårdprogrammet för palliativ vård']
  },
  {
    id: 'at-020',
    program: 'at',
    specialty: 'allmänmedicin',
    title: 'AT-tentamen',
    description: 'Godkänd skriftlig AT-tentamen',
    category: 'Examination',
    competencyArea: 'medicinsk-kunskap',
    required: true,
    assessmentCriteria: [
      'Godkänt resultat på nationell AT-tentamen',
      'Bred medicinsk kunskap',
      'Kliniskt resonerande',
      'Patientsäkerhet',
      'Etik och juridik'
    ],
    references: ['Socialstyrelsen AT-tentamen']
  }
];

// ==================== COMPLETE GOAL DATABASE ====================

export const ALL_FOCUSED_GOALS = [
  ...LÄKAREXAMEN_GOALS,
  ...AKUTSJUKVÅRD_GOALS,
  ...ALLMÄNMEDICIN_GOALS,
  ...ORTOPEDI_GOALS,
  ...BT_GOALS,
  ...AT_GOALS
];

// ==================== HELPER FUNCTIONS ====================

export function getGoalsBySpecialty(specialty: string): SocialstyrelsensGoal[] {
  return ALL_FOCUSED_GOALS.filter(goal => goal.specialty === specialty);
}

export function getGoalsByProgram(program: string): SocialstyrelsensGoal[] {
  return ALL_FOCUSED_GOALS.filter(goal => goal.program === program);
}

export function getGoalsByCompetencyArea(area: string): SocialstyrelsensGoal[] {
  return ALL_FOCUSED_GOALS.filter(goal => goal.competencyArea === area);
}

export function getRequiredGoals(): SocialstyrelsensGoal[] {
  return ALL_FOCUSED_GOALS.filter(goal => goal.required);
}

export function getGoalById(id: string): SocialstyrelsensGoal | undefined {
  return ALL_FOCUSED_GOALS.find(goal => goal.id === id);
}

// ==================== GOAL STATISTICS ====================

export const GOAL_STATISTICS = {
  total: ALL_FOCUSED_GOALS.length,
  bySpecialty: {
    läkarexamen: LÄKAREXAMEN_GOALS.length,
    akutsjukvård: AKUTSJUKVÅRD_GOALS.length,
    allmänmedicin: ALLMÄNMEDICIN_GOALS.length,
    ortopedi: ORTOPEDI_GOALS.length
  },
  byProgram: {
    läkarexamen: ALL_FOCUSED_GOALS.filter(g => g.program === 'läkarexamen').length,
    st: ALL_FOCUSED_GOALS.filter(g => g.program === 'st').length,
    at: AT_GOALS.length,
    bt: BT_GOALS.length
  },
  required: ALL_FOCUSED_GOALS.filter(g => g.required).length,
  optional: ALL_FOCUSED_GOALS.filter(g => !g.required).length
};

console.log('✅ Loaded Focused Socialstyrelsen Goals:', {
  total: GOAL_STATISTICS.total,
  specialties: GOAL_STATISTICS.bySpecialty,
  programs: GOAL_STATISTICS.byProgram
});

export default {
  ALL_FOCUSED_GOALS,
  LÄKAREXAMEN_GOALS,
  AKUTSJUKVÅRD_GOALS,
  ALLMÄNMEDICIN_GOALS,
  ORTOPEDI_GOALS,
  BT_GOALS,
  AT_GOALS,
  getGoalsBySpecialty,
  getGoalsByProgram,
  getGoalsByCompetencyArea,
  getRequiredGoals,
  getGoalById,
  GOAL_STATISTICS
};