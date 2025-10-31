/**
 * Mini-OSCE Assessments
 * Gate requirements for domain completion
 *
 * Each domain has 1-2 Mini-OSCEs that test:
 * - Critical safety actions
 * - Clinical decision-making
 * - Practical application
 * - Pitfall identification
 */

import { MiniOSCE } from '@/types/progression';
import { Domain } from '@/types/onboarding';
import { EducationLevel } from '@/types/education';

/**
 * Höft Mini-OSCE
 * Tests: PFF management, pain relief, NV status, X-ray indication
 */
export const HOEFT_MINI_OSCE: MiniOSCE = {
  id: 'hoeft-pff-001',
  domain: 'höft',
  level: 'st1',

  scenario: {
    title: 'Proximal femurfraktur hos äldre patient',
    description:
      '78-årig kvinna trillade hemma för 2 timmar sedan. Kan inte belasta höger ben. Smärta i höger ljumske vid rörelse. ' +
      'Vitala parametrar: BT 145/85, puls 92, saturation 96% på luft, afebrila. ' +
      'Status: Höger ben utåtroterat och förkortat. Svullen ljumske.',
    duration: 120, // 2 minutes
    vitalFacts: [
      'Trillade för 2h sedan',
      'Kan inte belasta',
      'Höger ben utåtroterat och förkortat',
      'Smärta vid rörelse',
    ],
  },

  criticalActions: [
    {
      id: 'pain-relief',
      action: 'Ge adekvat smärtlindring (t.ex. morfin eller paracetamol/NSAID)',
      required: true,
      hints: ['Patienten har smärta VAS 8/10', 'Morfin 2.5-5mg iv'],
    },
    {
      id: 'nv-status',
      action: 'Kontrollera neurovaskulär status (puls, motorik, sensibilitet)',
      required: true,
      hints: ['Palpera fotpulsar', 'Testa tårörelse och känsel'],
    },
    {
      id: 'xray-order',
      action: 'Ordinera höftröntgen (höft ap + axial eller lateral)',
      required: true,
      hints: ['Behövs för att klassificera frakturen', '2 projektioner krävs'],
    },
  ],

  assessment: {
    question:
      'Diktation: Beskriv din handläggning i 2-3 meningar. Inkludera diagnos, åtgärder och nästa steg.',
    requiredKeywords: [
      'proximal femurfraktur',
      'smärtlindring',
      'neurovaskulär',
      'röntgen',
      'höft',
    ],
    timeLimit: 120, // 2 minutes
  },

  pitfall: {
    description:
      'Patienten tar Eliquis (apixaban) för förmaksflimmer. Glömde du att fråga om antikoagulantia?',
    correctIdentification:
      'Fråga om antikoagulantia och kontrollera koagulationsstatus innan operation',
  },

  rubric: [
    {
      criterion: 'Smärtlindring given',
      maxScore: 2,
      description: 'Adekvat smärtlindring ordinerad och given',
      scoring: {
        '0': 'Ingen smärtlindring given',
        '1': 'Smärtlindring given men för sent eller fel dos',
        '2': 'Snabb och adekvat smärtlindring',
      },
    },
    {
      criterion: 'NV-status kontrollerad',
      maxScore: 2,
      description: 'Neurovaskulär status dokumenterad',
      scoring: {
        '0': 'NV-status ej kontrollerad',
        '1': 'Endast puls eller motorik/sensibilitet kontrollerad',
        '2': 'Komplett NV-status (puls + motorik + sensibilitet)',
      },
    },
    {
      criterion: 'Röntgen ordinerad korrekt',
      maxScore: 2,
      description: 'Rätt röntgenundersökning beställd',
      scoring: {
        '0': 'Ingen röntgen beställd',
        '1': 'Röntgen beställd men endast 1 projektion',
        '2': 'Korrekt röntgen med 2 projektioner (ap + lateral/axial)',
      },
    },
    {
      criterion: 'Diktation innehåller nyckelord',
      maxScore: 2,
      description: 'Dokumentation innehåller väsentliga delar',
      scoring: {
        '0': 'Saknar viktig information',
        '1': 'Innehåller 2-3 nyckelord',
        '2': 'Innehåller alla viktiga nyckelord och är välstrukturerad',
      },
    },
  ],

  passingScore: 0.8, // 80% = 6.4/8 points
};

/**
 * Fot/Fotled Mini-OSCE
 * Tests: Ottawa Ankle Rules, load testing, missed fibula fracture
 */
export const FOTLED_MINI_OSCE: MiniOSCE = {
  id: 'fotled-ottawa-001',
  domain: 'fot-fotled',
  level: 'at',

  scenario: {
    title: 'Fotledsskada efter fotbollsmatch',
    description:
      '23-årig man vred foten under fotbollsmatch för 1 timme sedan. Svullen lateral fotled, smärta vid palpation över lateral malleol. ' +
      'Kan belasta foten med smärta. Kan gå några steg med stöd.',
    duration: 90,
    vitalFacts: [
      'Vred foten för 1h sedan',
      'Svullen lateral fotled',
      'Kan belasta med smärta',
      'Kan gå några steg',
    ],
  },

  criticalActions: [
    {
      id: 'ottawa-rules',
      action: 'Tillämpa Ottawa Ankle Rules för att avgöra om röntgen behövs',
      required: true,
      hints: [
        'Palpera malleolerna',
        'Testa belastning - kan patienten gå 4 steg?',
        'Navicular och basis metatarsal 5',
      ],
    },
    {
      id: 'load-test',
      action: 'Utför belastningsprov (kan gå 4 steg)',
      required: true,
    },
    {
      id: 'xray-decision',
      action: 'Besluta om röntgen behövs baserat på Ottawa-kriterier',
      required: true,
      hints: ['Ömhet över malleol?', 'Kan inte gå 4 steg?'],
    },
  ],

  assessment: {
    question:
      'Enligt Ottawa Ankle Rules, behöver denna patient fotledsröntgen? Motivera ditt svar.',
    requiredKeywords: ['ottawa', 'belastning', 'malleol', 'röntgen'],
    timeLimit: 90,
  },

  pitfall: {
    description:
      'Patienten har också ömhet över proximal fibula (Maisonneuve-fraktur). Glömde du att palpera hela fibula?',
    correctIdentification:
      'Vid högenergiskada eller avvikande mekanism - palpera hela fibula och tibia för att utesluta proximala skador',
  },

  rubric: [
    {
      criterion: 'Ottawa Ankle Rules tillämpade korrekt',
      maxScore: 2,
      description: 'Alla komponenter av Ottawa-reglerna kontrollerade',
      scoring: {
        '0': 'Ottawa Rules ej tillämpade',
        '1': 'Delvis tillämpade (saknar minst 1 del)',
        '2': 'Alla delar av Ottawa Rules kontrollerade',
      },
    },
    {
      criterion: 'Belastningsprov utfört',
      maxScore: 2,
      description: 'Patient testad för att gå 4 steg',
      scoring: {
        '0': 'Belastningsprov ej utfört',
        '1': 'Utfört men inte dokumenterat tydligt',
        '2': 'Korrekt utfört och dokumenterat',
      },
    },
    {
      criterion: 'Korrekt röntgenbeslut',
      maxScore: 2,
      description: 'Rätt indikation för röntgen baserat på Ottawa',
      scoring: {
        '0': 'Fel beslut',
        '1': 'Rätt beslut men osäker motivering',
        '2': 'Rätt beslut med korrekt motivering',
      },
    },
    {
      criterion: 'Pitfall identifierad',
      maxScore: 2,
      description: 'Proximal fibula palperad',
      scoring: {
        '0': 'Proximal fibula ej palperad',
        '1': 'Palperad men inte dokumenterad',
        '2': 'Palperad, dokumenterad och röd flagga identifierad',
      },
    },
  ],

  passingScore: 0.8,
};

/**
 * Axel/Armbåge Mini-OSCE
 * Tests: Shoulder dislocation, NV screening, reduction vs X-ray first
 */
export const AXEL_MINI_OSCE: MiniOSCE = {
  id: 'axel-luxation-001',
  domain: 'axel-armbåge',
  level: 'st1',

  scenario: {
    title: 'Främre axelluxation efter падение',
    description:
      '45-årig man föll på ishockey för 30 minuter sedan. Höger axel i abnorm position, patienten stödjer armen med vänster hand. ' +
      'Tydlig deformitet, humerushuvudet palperas främre. Smärta VAS 9/10.',
    duration: 120,
    vitalFacts: [
      'Träningsskada för 30 min sedan',
      'Abnorm axelposition',
      'Deformitet',
      'Smärta VAS 9/10',
    ],
  },

  criticalActions: [
    {
      id: 'nv-screening',
      action: 'Kontrollera neurovaskulär status (speciellt n. axillaris och a. axillaris)',
      required: true,
      hints: ['Testa deltaideuskänsel', 'Palpera radialpuls', 'Testa axillaris-innerverad muskulatur'],
    },
    {
      id: 'xray-before-reduction',
      action: 'Ordinera röntgen INNAN reponering för att utesluta fraktur',
      required: true,
      hints: ['Viktigt att utesluta greater tuberosity-fraktur', 'Axel ap + Y-bild'],
    },
    {
      id: 'pain-management',
      action: 'Ge smärtlindring och sedering innan reponering',
      required: false,
      hints: ['Morfin + midazolam', 'Lokal infiltration möjlig'],
    },
  ],

  assessment: {
    question:
      'Diktation: Din handläggningsplan för denna axelluxation. Inkludera ordning av åtgärder.',
    requiredKeywords: ['axelluxation', 'neurovaskulär', 'röntgen', 'reponering'],
    timeLimit: 120,
  },

  pitfall: {
    description:
      'På röntgen ser du en liten avulsion från greater tuberosity. Glömde du att kolla för fraktur?',
    correctIdentification:
      'ALLTID röntgen före reponering för att identifiera tillhörande frakturer (greater tuberosity, glenoid, humerus)',
  },

  rubric: [
    {
      criterion: 'NV-status kontrollerad',
      maxScore: 2,
      description: 'Neurovaskulär status bedömd före och efter reponering',
      scoring: {
        '0': 'NV-status ej kontrollerad',
        '1': 'Endast puls eller endast nervstatus',
        '2': 'Komplett NV-status (n. axillaris + kärlstatus)',
      },
    },
    {
      criterion: 'Röntgen före reponering',
      maxScore: 2,
      description: 'Röntgen beställd innan reponeringsförsök',
      scoring: {
        '0': 'Ingen röntgen eller röntgen efter reponering',
        '1': 'Röntgen beställd men inte avvaktat svar',
        '2': 'Röntgen tagen och tolkad före reponering',
      },
    },
    {
      criterion: 'Smärtlindring planerad',
      maxScore: 2,
      description: 'Adekvat analgesi/sedering planerad',
      scoring: {
        '0': 'Ingen smärtlindring planerad',
        '1': 'Endast analgesi eller endast sedering',
        '2': 'Kombination av analgesi och sedering',
      },
    },
    {
      criterion: 'Diktation och ordningsföljd',
      maxScore: 2,
      description: 'Korrekt ordning av åtgärder dokumenterad',
      scoring: {
        '0': 'Fel ordning eller saknar kritiska steg',
        '1': 'Mestadels korrekt ordning',
        '2': 'Perfekt ordningsföljd: NV → Röntgen → Smärtlindring → Reponering → Kontroll-röntgen',
      },
    },
  ],

  passingScore: 0.8,
};

/**
 * Trauma Mini-OSCE
 * Tests: ATLS principles, prioritization, hemorrhage control
 */
export const TRAUMA_MINI_OSCE: MiniOSCE = {
  id: 'trauma-multi-001',
  domain: 'trauma',
  level: 'at',

  scenario: {
    title: 'Multitraumpatient efter trafikolycka',
    description:
      'Ung man inkommer till akutmottagningen efter MC-olycka. GCS 14 (E4 V4 M6), BT 95/60, puls 115, saturation 92%. ' +
      'Öppen fraktur vä underben med kraftig blödning. Instabil bäcken. Andningsfrekvens 28.',
    duration: 120,
    vitalFacts: [
      'MC-olycka',
      'GCS 14',
      'BT 95/60, puls 115',
      'Öppen fraktur + blödning',
      'Instabil bäcken',
    ],
  },

  criticalActions: [
    {
      id: 'abcde',
      action: 'Utför primär bedömning enligt ABCDE',
      required: true,
      hints: ['Airway, Breathing, Circulation, Disability, Exposure'],
    },
    {
      id: 'hemorrhage-control',
      action: 'Stoppa blödning från öppen underbenfraktur (direkt tryck/tourniquet)',
      required: true,
      timeLimit: 60,
      hints: ['Direkt tryck först', 'Tourniquet om ej kontroll', 'Tid är kritisk'],
    },
    {
      id: 'pelvic-binder',
      action: 'Applicera bäckenbälte (pelvic binder) för instabil bäcken',
      required: true,
      hints: ['Placera över trokanterna', 'Minskar volym och blödning'],
    },
  ],

  assessment: {
    question:
      'Prioritera dina 3 viktigaste åtgärder i ordning. Motivera prioriteringen.',
    requiredKeywords: ['abcde', 'blödning', 'bäcken', 'prioritering'],
    timeLimit: 90,
  },

  pitfall: {
    description:
      'Patienten har också pneumothorax på höger sida (andningsfrekvens 28, sat 92%). Upptäckte du detta i Breathing-fasen?',
    correctIdentification:
      'B-fasen: Auskultation bör avslöja nedsatt andningsljud höger. Behöver thoraxdränage omedelbart.',
  },

  rubric: [
    {
      criterion: 'ABCDE-princip tillämpas systematiskt',
      maxScore: 2,
      description: 'Strukturerad primärbedömning',
      scoring: {
        '0': 'Ingen systematik',
        '1': 'Vissa delar av ABCDE',
        '2': 'Komplett ABCDE i rätt ordning',
      },
    },
    {
      criterion: 'Blödningskontroll',
      maxScore: 2,
      description: 'Snabb och effektiv blödningskontroll',
      scoring: {
        '0': 'Blödning ej kontrollerad',
        '1': 'Blödning kontrollerad men långsamt',
        '2': 'Snabb blödningskontroll (<60s)',
      },
    },
    {
      criterion: 'Bäckenstabilisering',
      maxScore: 2,
      description: 'Bäckenbälte applicerat korrekt',
      scoring: {
        '0': 'Bäckenbälte ej applicerat',
        '1': 'Applicerat men fel placering',
        '2': 'Korrekt applicerat över trokanterna',
      },
    },
    {
      criterion: 'Prioritering och pitfall',
      maxScore: 2,
      description: 'Korrekt prioritering och pneumothorax identifierad',
      scoring: {
        '0': 'Fel prioritering och missad pneumothorax',
        '1': 'Korrekt prioritering ELLER pneumothorax identifierad',
        '2': 'Korrekt prioritering OCH pneumothorax identifierad',
      },
    },
  ],

  passingScore: 0.8,
};

/**
 * Hand/Handled Mini-OSCE
 * Tests: Scaphoid fracture management, immobilization, AVN risk
 */
export const HAND_HANDLED_MINI_OSCE: MiniOSCE = {
  id: 'hand-scaphoid-001',
  domain: 'hand-handled',
  level: 'at',

  scenario: {
    title: 'Misstänkt scaphoidfraktur efter fall',
    description:
      '22-årig man föll på utsträckt hand vid skateboarding. Smärta i handleden, särskilt i anatomical snuffbox. ' +
      'Initiala röntgenbilder (PA, lateral, scaphoid-view) visar ingen tydlig fraktur.',
    duration: 90,
    vitalFacts: [
      'Fall på utsträckt hand (FOOSH)',
      'Anatomical snuffbox tenderness',
      'Röntgen initialt normal',
      'Aktiv ung patient',
    ],
  },

  criticalActions: [
    {
      id: 'clinical-diagnosis',
      action: 'Identifiera kliniska tecken på scaphoidfraktur (snuffbox tenderness, scaphoid tubercle tenderness)',
      required: true,
      hints: ['Palpera anatomical snuffbox', 'Palpera scaphoid tubercle volart', 'Smärta vid axialtryck tumme'],
    },
    {
      id: 'immobilization',
      action: 'Applicera scaphoid-gips (tumspica) trots normal röntgen',
      required: true,
      hints: ['Scaphoidfrakturer kan vara ockulta initialt', 'Gips över CMC-leden på tummen'],
    },
    {
      id: 'follow-up-plan',
      action: 'Planera uppföljning med kontroll-röntgen eller MR',
      required: true,
      hints: ['Kontroll-röntgen efter 10-14 dagar', 'Alternativt MR inom några dagar', 'Viktigt att inte missa - risk för AVN'],
    },
  ],

  assessment: {
    question:
      'Förklara varför det är viktigt att behandla kliniskt misstänkt scaphoidfraktur trots normal röntgen.',
    requiredKeywords: ['occult', 'röntgen', 'avaskulär', 'nonunion', 'gips'],
    timeLimit: 90,
  },

  pitfall: {
    description:
      'Patienten återkommer efter 6 veckor utan gips (följde inte instruktioner). Röntgen visar nu scaphoidfraktur med tecken på nonunion. Missade du att betona vikten av compliance?',
    correctIdentification:
      'ALLTID förklara för patienten varför gips är kritiskt: scaphoid har dålig blodförsörjning (via distala polen), risk för avaskulär nekros (AVN) och nonunion är 5-12% även vid behandlade frakturer. Ockulta frakturer som inte immobiliseras har mycket högre risk.',
  },

  rubric: [
    {
      criterion: 'Klinisk diagnos',
      maxScore: 2,
      description: 'Korrekt identifiering av scaphoidfraktur-misstanke',
      scoring: {
        '0': 'Misstänkte inte scaphoid',
        '1': 'Misstänkte men osäker undersökning',
        '2': 'Systematisk undersökning med snuffbox + tubercle palpation',
      },
    },
    {
      criterion: 'Immobilisering trots normal röntgen',
      maxScore: 2,
      description: 'Korrekt behandling av kliniskt misstänkt fraktur',
      scoring: {
        '0': 'Ingen immobilisering',
        '1': 'Enkel handled-gips (ej tumspica)',
        '2': 'Scaphoid-gips (tumspica över CMC-leden)',
      },
    },
    {
      criterion: 'Uppföljningsplan',
      maxScore: 2,
      description: 'Adekvat plan för att bekräfta diagnos',
      scoring: {
        '0': 'Ingen uppföljning planerad',
        '1': 'Uppföljning men oklar tidsplan eller metod',
        '2': 'Kontroll-röntgen 10-14 dagar ELLER MR inom 3-5 dagar',
      },
    },
    {
      criterion: 'Patientinformation om risker',
      maxScore: 2,
      description: 'Förklaring av AVN-risk och vikten av compliance',
      scoring: {
        '0': 'Ingen patientinformation',
        '1': 'Viss information men ej tydlig om risker',
        '2': 'Tydlig förklaring av AVN/nonunion-risk och vikten av att bära gips',
      },
    },
  ],

  passingScore: 0.8,
};

/**
 * Knä Mini-OSCE
 * Tests: Hemartros evaluation, ACL testing, acute management
 */
export const KNA_MINI_OSCE: MiniOSCE = {
  id: 'kna-acl-001',
  domain: 'knä',
  level: 'st1',

  scenario: {
    title: 'Akut knäskada med hemartros',
    description:
      '26-årig fotbollsspelare kom till akuten efter vridskada på knät. Hörde "pop", omedelbar svullnad. ' +
      'Knät är nu (3 timmar efter skadan) påtagligt svullet och spänt. Smärta VAS 7/10. Kan inte belasta.',
    duration: 120,
    vitalFacts: [
      'Hörbart "pop" vid skadan',
      'Omedelbar svullnad (<2h)',
      'Spänt, svullet knä',
      'Kan inte belasta',
    ],
  },

  criticalActions: [
    {
      id: 'hemartros-recognition',
      action: 'Identifiera hemartros och förstå implikationerna',
      required: true,
      hints: ['Snabb svullnad <2h = blodig effusion', '70% är ACL-skada vid akut hemartros'],
    },
    {
      id: 'lachman-test',
      action: 'Utföra Lachman-test för ACL-bedömning',
      required: true,
      timeLimit: 60,
      hints: ['Mest känslig ACL-test i akuta skedet', 'Utförs i 20-30° flektion', 'Jämför med kontralateralt knä'],
    },
    {
      id: 'structured-exam',
      action: 'Systematisk undersökning av alla strukturer (ACL, PCL, MCL, LCL, menisk)',
      required: false,
      hints: ['Även om ACL misstänks - undersök allt', 'Look-Feel-Move systematik'],
    },
  ],

  assessment: {
    question:
      'Diktation: Din primära diagnos och handläggningsplan. Inkludera vidare utredning.',
    requiredKeywords: ['ACL', 'hemartros', 'MR', 'ortoped', 'RICE'],
    timeLimit: 120,
  },

  pitfall: {
    description:
      'MR efter 2 veckor visar inte bara ACL-ruptur utan också Segond-fraktur (lateral avulsionsfraktur) och lateral menisk-skada ("unhappy lateral triad"). Glömde du att undersöka för lateral kollateral-instabilitet?',
    correctIdentification:
      'Vid högenergi-vridskador kan "reverse Segond" eller Segond-frakturer förekomma (lateral kapsulär-avulsion). Undersök alltid både medial OCH lateral stabilitet med varus/valgus stress. Segond-fraktur har nästan 100% association med ACL-ruptur.',
  },

  rubric: [
    {
      criterion: 'Hemartros identifierad',
      maxScore: 2,
      description: 'Akut hemartros korrekt identifierad och tolkas',
      scoring: {
        '0': 'Missade hemartros eller förstod ej betydelsen',
        '1': 'Identifierade svullnad men osäker på implikation',
        '2': 'Korrekt: akut hemartros = 70% ACL-skada',
      },
    },
    {
      criterion: 'Lachman-test utfört',
      maxScore: 2,
      description: 'Korrekt teknik för Lachman-test',
      scoring: {
        '0': 'Lachman ej utfört',
        '1': 'Utfört men fel teknik (t.ex. 90° flektion = Anterior drawer)',
        '2': 'Korrekt: 20-30° flektion, jämfört med motsatt sida',
      },
    },
    {
      criterion: 'Handläggning och vidare utredning',
      maxScore: 2,
      description: 'Adekvat akutbehandling och uppföljning planerad',
      scoring: {
        '0': 'Ingen tydlig plan',
        '1': 'RICE + viss uppföljning men saknar MR/ortopedkontakt',
        '2': 'RICE + kryckor + MR inom 2-4 veckor + ortopedremiss',
      },
    },
    {
      criterion: 'Systematisk undersökning',
      maxScore: 2,
      description: 'Alla strukturer undersökta (ej bara ACL)',
      scoring: {
        '0': 'Endast ACL undersökt',
        '1': 'ACL + några andra strukturer',
        '2': 'Komplett undersökning: ACL, PCL, MCL, LCL, menisk, patella',
      },
    },
  ],

  passingScore: 0.8,
};

/**
 * Rygg Mini-OSCE
 * Tests: Red flags, cauda equina syndrome recognition, urgent management
 */
export const RYGG_MINI_OSCE: MiniOSCE = {
  id: 'rygg-cauda-001',
  domain: 'rygg',
  level: 'st2',

  scenario: {
    title: 'Akut bäcken-/bensvaghet hos patient med ryggsmärta',
    description:
      '52-årig kvinna med känd diskbråck L4-L5 söker akut för 2 dagars försämring. ' +
      'Bilateral bensvaghet, svårighet att gå, ny urininkontinens, nedsatt känsel i sätet. Smärta VAS 8/10.',
    duration: 120,
    vitalFacts: [
      'Bilateral bensvaghet (nytt)',
      'Urininkontinens (nytt)',
      'Sadel-anestesi',
      'Tidigare känd diskbråck',
    ],
  },

  criticalActions: [
    {
      id: 'cauda-equina-recognition',
      action: 'Identifiera cauda equina-syndrom baserat på klassiska symtom',
      required: true,
      timeLimit: 60,
      hints: [
        'Triad: Bilateral sciatica, sadel-anestesi, blås-/tarmstörning',
        'Detta är kirurgiskt AKUTFALL',
      ],
    },
    {
      id: 'urgent-mr',
      action: 'Beställa akut MR columna lumbalis',
      required: true,
      hints: ['MR OMEDELBART - kan inte vänta', 'Uteslut massiv diskbråck eller annan kompression'],
    },
    {
      id: 'neurosurgery-consult',
      action: 'Kontakta ryggkirurg/neurokirurg för akut kirurgi',
      required: true,
      hints: ['Dekompression inom 48h för bästa utfall', 'Varje timme räknas'],
    },
  ],

  assessment: {
    question:
      'Förklara patofysiologin bakom cauda equina-syndrom och varför snabb dekompression är kritisk.',
    requiredKeywords: ['cauda equina', 'kompression', 'dekompression', '48 timmar', 'neurologisk'],
    timeLimit: 90,
  },

  pitfall: {
    description:
      'Patienten hade också perianal anestesi (sadel-anestesi) och anal sfinktertonus var nedsatt vid rektalundersökning. Glömde du att undersöka anal ton och perianal sensorik?',
    correctIdentification:
      'ALLTID undersök anal sfinktertonus (rektalexploration) och perianal sensorik (S2-S5) vid misstänkt cauda equina. Nedsatt anal ton är ett viktigt objektivt tecken. Komplett neurologisk undersökning inklusive blåsfunktion (residualvolym) är kritisk.',
  },

  rubric: [
    {
      criterion: 'Cauda equina identifierat',
      maxScore: 2,
      description: 'Snabb igenkänning av cauda equina-syndrom',
      scoring: {
        '0': 'Missade diagnosen',
        '1': 'Misstänkte men osäker',
        '2': 'Korrekt och omedelbar diagnos baserat på klassisk triad',
      },
    },
    {
      criterion: 'Akut MR beställd',
      maxScore: 2,
      description: 'OMEDELBAR MR utan dröjsmål',
      scoring: {
        '0': 'Ingen MR eller fördröjd MR',
        '1': 'MR beställd men ej prioriterad som akut',
        '2': 'AKUT MR omedelbart beställd (nu, inte inom 24h)',
      },
    },
    {
      criterion: 'Kirurgkontakt och kirurgi planerad',
      maxScore: 2,
      description: 'Ryggkirurg kontaktad för akut dekompression',
      scoring: {
        '0': 'Ingen kirurgkontakt',
        '1': 'Kirurg kontaktad men ej tydlighet om akuit',
        '2': 'Akutkirurg kontaktad, dekompression planerad inom 48h',
      },
    },
    {
      criterion: 'Komplett neurologisk undersökning',
      maxScore: 2,
      description: 'Anal ton, perianal sensorik, blåsfunktion undersökt',
      scoring: {
        '0': 'Inkomplett neurologisk undersökning',
        '1': 'Mestadels komplett men missade anal ton eller blåsfunktion',
        '2': 'Komplett: bilateral benneuro, sadel-sensorik, anal ton, blåsfunktion',
      },
    },
  ],

  passingScore: 0.8,
};

/**
 * Sport Mini-OSCE
 * Tests: Concussion recognition, graduated return-to-play protocol
 */
export const SPORT_MINI_OSCE: MiniOSCE = {
  id: 'sport-concussion-001',
  domain: 'sport',
  level: 'at',

  scenario: {
    title: 'Idrottare med huvudskallstrauma och kognitiva symtom',
    description:
      '19-årig ishockeyspelare fick ett tackling och slog huvudet i sargen. Var omtöcknad i 30 sekunder, ' +
      'nu vaken men klagrar på huvudvärk, illamående och känner sig "suddig". Ingen medvetslöshet. GCS 15.',
    duration: 90,
    vitalFacts: [
      'Huvudtrauma med kort omtöckning',
      'Huvudvärk + illamående',
      'Kognitiva symtom ("suddig")',
      'GCS 15, inga fokala neurologiska tecken',
    ],
  },

  criticalActions: [
    {
      id: 'concussion-recognition',
      action: 'Identifiera hjärnskakning (concussion) baserat på symtom',
      required: true,
      hints: [
        'Hjärnskakning = kort kognitiv påverkan efter huvudtrauma',
        'Medvetslöshet EJ krävs för diagnos',
        'Kognition, huvudvärk, balansproblem är klassiskt',
      ],
    },
    {
      id: 'remove-from-play',
      action: 'TA UT SPELAREN från matchen/träningen OMEDELBART',
      required: true,
      timeLimit: 30,
      hints: ['När in doubt, sit them out!', 'Andra skallen-slag kan vara katastrofalt'],
    },
    {
      id: 'graduated-rtp',
      action: 'Förklara graduated return-to-play protocol',
      required: true,
      hints: ['Minst 24h vila först', 'Stegvis progression över minst 6 steg', 'Minst 1 dag per steg'],
    },
  ],

  assessment: {
    question:
      'När kan spelaren tidigast återgå till full tävling enligt return-to-play protocol?',
    requiredKeywords: ['symptomfri', 'gradvis', 'minst', 'dagar', 'progression'],
    timeLimit: 90,
  },

  pitfall: {
    description:
      'Spelaren ville återgå till matchen efter 10 minuter "jag mår bra nu". Du lät hen spela och fick en andra concussion (second impact syndrome). Detta kan vara livshotande!',
    correctIdentification:
      'ALDRIG låta spelare återgå samma dag vid misstänkt hjärnskakning, oavsett hur bra de säger att de mår. Second impact syndrome (andra skallen inom kort tid) kan orsaka massiv hjärnsvullnad och död. "When in doubt, sit them out" är gyllene regel.',
  },

  rubric: [
    {
      criterion: 'Hjärnskakning identifierad',
      maxScore: 2,
      description: 'Korrekt diagnos av concussion',
      scoring: {
        '0': 'Missade hjärnskakning',
        '1': 'Misstänkte men osäker',
        '2': 'Korrekt diagnos baserat på kognitiva symtom',
      },
    },
    {
      criterion: 'Omedelbart uttagning från spel',
      maxScore: 2,
      description: 'Spelare tagen ur match/träning direkt',
      scoring: {
        '0': 'Lät spelaren fortsätta',
        '1': 'Tog ut spelaren men efter fördröjning',
        '2': 'OMEDELBAR uttagning från spel',
      },
    },
    {
      criterion: 'Return-to-play protocol förklarat',
      maxScore: 2,
      description: 'Graduated RTP med minst 6 steg',
      scoring: {
        '0': 'Ingen RTP-plan',
        '1': 'Viss plan men ej strukturerad eller för snabb',
        '2': 'Korrekt graduated RTP: minst 24h vila, sedan 6 steg (minst 1 dag/steg)',
      },
    },
    {
      criterion: 'Second impact-risken förklarad',
      maxScore: 2,
      description: 'Förklarat varför ej återgång samma dag',
      scoring: {
        '0': 'Ingen information om risker',
        '1': 'Viss information men ej tydlig',
        '2': 'Tydlig förklaring av second impact syndrome-risk',
      },
    },
  ],

  passingScore: 0.8,
};

/**
 * Tumör Mini-OSCE
 * Tests: Red flags for malignancy, biopsy planning, specialist referral
 */
export const TUMOR_MINI_OSCE: MiniOSCE = {
  id: 'tumor-suspicion-001',
  domain: 'tumör',
  level: 'st3',

  scenario: {
    title: 'Misstänkt malign bentumör hos ung patient',
    description:
      '17-årig flicka söker för 2 månaders progressiv knäsmärta utan trauma. Nattsmärta som INTE svarar på NSAID. ' +
      'Röntgen visar lytisk-sklerotisk lesion i distala femur metafys med periosteal reaktion ("sunburst"). ' +
      'CRP och SR lätt förhöjda, inga feber.',
    duration: 120,
    vitalFacts: [
      'Progressiv smärta utan trauma',
      'Nattsmärta som EJ svarar på NSAID',
      'Lytisk-sklerotisk lesion',
      'Periosteal reaktion ("sunburst")',
      'Ålder 17 år',
    ],
  },

  criticalActions: [
    {
      id: 'malignancy-recognition',
      action: 'Identifiera röda flaggor för malign bentumör',
      required: true,
      hints: [
        'Nattsmärta som EJ svarar på NSAID (jfr osteoid osteoma SOM svarar)',
        'Periosteal reaktion är oroande',
        'Ålder + lokalisation = klassiskt för osteosarkom',
      ],
    },
    {
      id: 'no-biopsy-yourself',
      action: 'INTE göra biopsi själv - remittera till sarkomcentrum',
      required: true,
      timeLimit: 60,
      hints: [
        'Biopsi-tract måste kunna excideras vid definitiv operation',
        'Fel biopsi kan göra kurativ kirurgi omöjlig',
        'Endast sarkomkirurg eller dennes team bör biopera',
      ],
    },
    {
      id: 'staging-workup',
      action: 'Ordinera staging-undersökningar (MR lokal, CT thorax, blodprover)',
      required: true,
      hints: [
        'MR av hela femur för lokal staging',
        'CT thorax för lungmetastaser',
        'ALP, LDH (osteosarkom-markörer)',
      ],
    },
  ],

  assessment: {
    question:
      'Förklara varför det är KRITISKT att inte göra biopsi själv utan att remittera till sarkomcentrum.',
    requiredKeywords: ['biopsi-tract', 'excision', 'kontamination', 'kurativ', 'sarkom'],
    timeLimit: 120,
  },

  pitfall: {
    description:
      'Du gjorde en öppen incisionsbiopsi via lateral approach på femur. Biopsi bekräftade osteosarkom. Sarkomkirurgen säger nu att femur måste amputeras istället för limb-salvage eftersom ditt biopsi-tract kontaminerade laterala kompartmentet. Hur känns det?',
    correctIdentification:
      'ALDRIG göra biopsi själv vid misstänkt sarkom. Biopsi-tract (inklusive hela hematom) betraktas som kontaminerat och måste excideras en bloc vid definitiv kirurgi. Fel placerad biopsi kan förstöra möjligheten till limb-salvage surgery. ALLTID remittera till sarkomcentrum (t.ex. Karolinska, Skåne, Göteborg) för coordinated care.',
  },

  rubric: [
    {
      criterion: 'Misstanke om malignitet',
      maxScore: 2,
      description: 'Röda flaggor identifierade',
      scoring: {
        '0': 'Missade malignitetsmisstanke',
        '1': 'Viss misstanke men osäker',
        '2': 'Korrekt: högrisk för osteosarkom baserat på ålder, lokalisation, radiologi',
      },
    },
    {
      criterion: 'INGEN egen biopsi',
      maxScore: 2,
      description: 'Korrekt handläggning genom remiss',
      scoring: {
        '0': 'Gjorde biopsi själv (KATASTROFALT)',
        '1': 'Övervägde biopsi men ändrade sig',
        '2': 'DIREKT remiss till sarkomcentrum, ingen egen biopsi',
      },
    },
    {
      criterion: 'Staging-undersökningar ordinerade',
      maxScore: 2,
      description: 'Korrekt staging inför MDT',
      scoring: {
        '0': 'Inga staging-undersökningar',
        '1': 'Vissa undersökningar men inkomplett',
        '2': 'Komplett: MR lokal, CT thorax, ALP/LDH, blodstatus',
      },
    },
    {
      criterion: 'Förståelse för biopsi-tract problematik',
      maxScore: 2,
      description: 'Kan förklara varför ej egen biopsi',
      scoring: {
        '0': 'Ingen förståelse',
        '1': 'Viss förståelse men otydlig',
        '2': 'Tydlig förklaring: biopsi-tract kontaminerar, måste excideras, kan förstöra limb-salvage',
      },
    },
  ],

  passingScore: 0.8,
};

/**
 * All Mini-OSCEs by domain
 */
export const MINI_OSCES_BY_DOMAIN: Partial<Record<Domain, MiniOSCE[]>> = {
  'höft': [HOEFT_MINI_OSCE],
  'fot-fotled': [FOTLED_MINI_OSCE],
  'axel-armbåge': [AXEL_MINI_OSCE],
  'trauma': [TRAUMA_MINI_OSCE],
  'hand-handled': [HAND_HANDLED_MINI_OSCE],
  'knä': [KNA_MINI_OSCE],
  'rygg': [RYGG_MINI_OSCE],
  'sport': [SPORT_MINI_OSCE],
  'tumör': [TUMOR_MINI_OSCE],
};

/**
 * Get Mini-OSCE for a domain
 *
 * @param domain - Domain name
 * @returns Mini-OSCE or undefined if not available
 */
export function getMiniOSCEForDomain(domain: Domain): MiniOSCE | undefined {
  const osces = MINI_OSCES_BY_DOMAIN[domain];
  return osces ? osces[0] : undefined;
}

/**
 * Calculate OSCE score
 *
 * @param scores - Array of scores per criterion (0-2)
 * @param rubric - OSCE rubric
 * @returns Total score, max score, percentage, and pass/fail
 */
export function calculateOSCEScore(
  scores: Array<{ rubricId: number; score: 0 | 1 | 2 }>,
  rubric: MiniOSCE['rubric']
): {
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
} {
  const totalScore = scores.reduce((sum, item) => sum + item.score, 0);
  const maxScore = rubric.length * 2; // Each criterion max 2 points
  const percentage = maxScore > 0 ? totalScore / maxScore : 0;
  const passingScore = 0.8; // 80%

  return {
    totalScore,
    maxScore,
    percentage,
    passed: percentage >= passingScore,
    passingScore,
  };
}
