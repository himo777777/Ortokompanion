/**
 * Unified Clinical Cases Data
 *
 * Combines Step-by-Step and Case Study data into a single unified format
 */

import { UnifiedClinicalCase } from '@/types/clinical-cases';

export const UNIFIED_CLINICAL_CASES: UnifiedClinicalCase[] = [
  // ==================== GUIDED MODE CASES (from step-by-step) ====================

  {
    id: 'sbs-001-femur-fracture',
    title: 'Högenergiskada - Femurfraktur',
    domain: 'trauma',
    difficulty: 'intermediate',
    level: 'st2',
    mode: 'guided',
    patient: {
      age: 45,
      gender: 'Man',
      complaint: 'Svår smärta i höger lår efter trafikolycka',
    },
    initialPresentation:
      'En 45-årig man kommer till akuten efter en trafikolycka. Han klagar på svår smärta i höger lår och kan inte belasta benet.',
    learningObjectives: [
      'Identifiera kritiska anamnesuppgifter vid högenergiskador',
      'Utföra systematisk traumaundersökning enligt ATLS',
      'Planera adekvat initial utredning',
      'Välja lämplig behandlingsstrategi för femurfrakturer',
    ],
    references: ['atls-sverige-2022', 'rockwood-9ed', 'campbell-13ed'],
    steps: [
      {
        id: 'step-001-anamnes',
        title: 'Anamnes',
        type: 'anamnes',
        question:
          'Vilka är de viktigaste anamnesuppgifterna du behöver samla in för att bedöma denna patient?',
        hints: [
          'Tänk på traumamekanismen - hur högt var energin?',
          'Glöm inte att fråga om andra skador och vitalparametrar',
          'Vilka antikoagulantia eller sjukdomar är viktiga att känna till?',
        ],
        examples: [
          'Hur gick olyckan till? Hastighet?',
          'Var patienten medvetslös?',
          'Finns andra skador?',
          'Medicinering och tidigare sjukdomar?',
        ],
        correctAnswer:
          'Traumamekanism (hastighet, bilbältesanvändning), medvetandegrad, andra skador, smärtlokalisation, antikoagulation, komorbiditeter (hjärtsjukdom, diabetes)',
        feedback:
          'Utmärkt! Vid högenergiskador är det kritiskt att bedöma hela patienten enligt ATLS-protokollet (ABCDE). Traumamekanismen ger viktig information om risk för andra skador. Antikoagulation påverkar blödningsrisk och kirurgisk timing.',
      },
      {
        id: 'step-002-differential',
        title: 'Differentialdiagnoser',
        type: 'differential',
        question:
          'Baserat på presentationen och anamnes, vilka är dina huvudsakliga differentialdiagnoser?',
        hints: [
          'Den mest troliga diagnosen baserad på trauma och symtom?',
          'Tänk på både skelettskador och mjukdelsskador',
          'Vilka livshotande tillstånd måste uteslutas?',
        ],
        examples: [
          'Vilken typ av fraktur är mest sannolik?',
          'Kan det finnas kärlskada?',
          'Risk för kompartmentsyndrom?',
        ],
        correctAnswer:
          'Primärt: Femurfraktur (diafysär/subtrokantär), Sekundärt: Höftluxation, acetabulumfraktur, kärlskada (arteria/vena femoralis), nervskada (n. ischiadicus)',
        feedback:
          'Korrekt tänkt! Femurfrakturer efter högenergiskador kan vara komplexa. Det är viktigt att aktivt utesluta vaskulära skador (cirka 2% risk) och nervskador. Tänk alltid ABCDE - femurfrakturer kan ge betydande blodförlust (upp till 1-2 liter).',
      },
      {
        id: 'step-003-status',
        title: 'Klinisk Undersökning',
        type: 'status',
        question:
          'Beskriv den systematiska undersökning du skulle göra. Fokusera på det viktigaste.',
        hints: [
          'Börja med primär bedömning enligt ATLS',
          'Vilken lokal undersökning behövs för femur?',
          'Glöm inte distal cirkulation och neurologi',
        ],
        examples: [
          'ABCDE-bedömning',
          'Inspektion av extremiteten',
          'Palpation och stabilitet',
          'Neurovaskulär status',
        ],
        correctAnswer:
          'ABCDE enligt ATLS, Inspektion (deformitet, svullnad, hudfärg, öppna sår), Palpation (lokalisera smärta, krepitationer), Rörlighet (försiktig, stabilitet), Neurovaskulär status (pulsar: femoralis, poplitea, dorsalis pedis, tibialis posterior; sensibilitet; motorik)',
        feedback:
          'Excellent systematik! Vid högenergiskador är ATLS-protokollet avgörande. Distal neurovaskulär status MÅSTE dokumenteras både före och efter alla interventioner. Vid misstanke om kärlskada är ABI (Ankle-Brachial Index) ett snabbt screeningtest.',
      },
      {
        id: 'step-004-investigation',
        title: 'Utredning',
        type: 'investigation',
        question:
          'Vilka undersökningar behöver du beställa och i vilken prioritetsordning?',
        hints: [
          'Grundläggande trauma-lab och bilddiagnostik',
          'Vilka röntgenbilder behövs för att bedöma frakturen?',
          'När behövs mer avancerad bilddiagnostik?',
        ],
        examples: [
          'Standardtrauma-prover?',
          'Röntgen av femur - vilka projektioner?',
          'När är CT indicerat?',
          'Behövs kärlutredning?',
        ],
        correctAnswer:
          'Akut: Hb, LPK, CRP, koagulation, elstatus, blodgruppering; Rtg: Femur (AP + lateral), höft (AP), knä (AP + lateral); Vid misstanke kärlskada: CTA eller konventionell angiografi; Vid komplex fraktur: CT för preoperativ planering',
        feedback:
          'Väl planerat! Standardprover är viktiga för att bedöma blodförlust och planera kirurgi. Röntgen MÅSTE inkludera leden ovan och under frakturen. CTA är guldstandard vid misstanke om kärlskada. Vid subtrokantära eller distala frakturer kan CT ge värdefull information för kirurgisk planering.',
      },
      {
        id: 'step-005-diagnosis',
        title: 'Diagnos & Klassificering',
        type: 'diagnosis',
        question:
          'Du får röntgensvar som visar en transversal diafysär femurfraktur med minimal dislokation. Hur klassificerar du denna fraktur och vilka faktorer påverkar prognos?',
        hints: [
          'Vilken klassifikation används för femurfrakturer?',
          'Vad är viktigt för stabilitet och läkning?',
          'Vilka komplikationer kan uppstå?',
        ],
        examples: [
          'AO/OTA-klassifikation',
          'Öppen vs sluten fraktur',
          'Frakturmönster och stabilitet',
          'Mjukdelsskada',
        ],
        correctAnswer:
          'AO/OTA 32-A (diafysär femurfraktur, A = simpel), Sluten fraktur, Transversal (potentiellt stabil efter fixation), Mjukdelsstatus: Tscherne grad bedömning, Prognosfaktorer: frakturtyp, mjukdelsskada, patientfaktorer, kärlskada',
        feedback:
          'Utmärkt klassificering! AO/OTA-systemet är standard för femurfrakturer. Transversala frakturer kan vara både bra (enkel reposition) och dåliga (axial instabilitet). Mjukdelsskadan (Tscherne-klassifikation för slutna frakturer) är ofta viktigare för prognosen än själva frakturen!',
      },
      {
        id: 'step-006-treatment',
        title: 'Behandlingsplan',
        type: 'treatment',
        question:
          'Vilken är din behandlingsplan för denna patient? Inkludera akut handläggning och definitiv behandling.',
        hints: [
          'Vad behövs omedelbart för denna patient?',
          'Vilken kirurgisk metod är standard för diafysära femurfrakturer?',
          'När ska operationen göras?',
        ],
        examples: [
          'Smärtlindring och stabilisering',
          'Antikoagulation postoperativt',
          'Kirurgisk metod och timing',
          'Mobilisering och rehabilitering',
        ],
        correctAnswer:
          'AKUT: Smärtlindring (opioider), Reposition och temporär stabilisering (Donway-skena eller traktion), Hydrering och blodprodukter vid behov. DEFINITIV: Intramedullar spikosteosyntes (antegrad) inom 24h (minskar komplikationer), Postop: Trombosprofylax (LMWH 4-6 veckor), Tidig mobilisering med belastning efter förmåga, Fysioterapi från dag 1',
        feedback:
          'Perfekt behandlingsstrategi! Tidig fixering (<24h) minskar risk för ARDS, lungemboli och mortalitet. Intramedullar spik är guldstandard för diafysära frakturer - ger stabil fixation med möjlighet till tidig full belastning. Tänk "damage control orthopaedics" hos instabila patienter - då temporär extern fixation först.',
      },
    ],
  },

  {
    id: 'sbs-002-achilles-rupture',
    title: 'Akut Fotsmärta - Achillesruptur',
    domain: 'fot-fotled',
    difficulty: 'beginner',
    level: 'at',
    mode: 'guided',
    patient: {
      age: 38,
      gender: 'Man',
      complaint: 'Svårt att gå på tå efter "knäpp" i vaden vid badminton',
    },
    initialPresentation:
      'En 38-årig tidigare frisk man kommer till akuten efter att ha spelat badminton. Han beskriver att han kände ett "knäpp" i vaden och nu har svårt att gå på tå.',
    learningObjectives: [
      'Känna igen klassisk presentation av achillesruptur',
      'Utföra korrekt klinisk undersökning',
      'Förstå indikationer för konservativ vs. operativ behandling',
    ],
    references: ['campbell-13ed', 'rockwood-9ed'],
    steps: [
      {
        id: 'step-201-anamnes',
        title: 'Anamnes',
        type: 'anamnes',
        question: 'Vilka specifika frågor ska du ställa för att bekräfta din misstanke om achillesruptur?',
        hints: [
          'Hur beskriver patienter vanligtvis händelsen?',
          'Vilken typ av aktivitet orsakar detta?',
          'Tidigare problem med senan?',
        ],
        examples: [
          'Var kände du "knäppet"?',
          'Vilken typ av rörelse gjorde du?',
          'Tidigare smärta eller tendinit?',
          'Medicinering (fluorokinoloner, kortison)?',
        ],
        feedback:
          'Bra! Den klassiska triad är: (1) Plötslig smärta i vaden med "knäppande" känsla, (2) Under explosiv aktivitet med push-off, (3) Oftast hos tidigare friska män 30-50 år. Fluorokinoloner och kortisoninjektioner nära senan är riskfaktorer!',
      },
      {
        id: 'step-202-status',
        title: 'Klinisk Undersökning',
        type: 'status',
        question: 'Vilka kliniska test använder du för att bekräfta diagnosen achillesruptur?',
        hints: [
          'Det finns tre klassiska test - kan du namnge dem?',
          'Vilket test är mest tillförlitligt?',
          'Vad ser du vid inspektion?',
        ],
        examples: [
          'Simmond/Thompson test',
          'Palpabel lucka',
          'Matles test',
          'Tåstående förmåga',
        ],
        correctAnswer:
          'INSPEKTION: Svullnad, ev. synlig/palpabel lucka 2-6 cm proximalt om calcaneus. TEST: (1) Thompsons test (VIKTIGAST - komprimera vader, titta på fotflexion), (2) Palpation av lucka, (3) Matles test (benäget, knä 90°, kolla fotposition). FUNKTION: Kan EJ gå på tå på skadad sida.',
        feedback:
          'Excellent! Thompsons test är guldstandard - positivt test (ingen/minskad plantarflexion vid vadkompression) har 96% sensitivitet. OBS: Patienter kan ofta fortfarande plantarflektera något via tibialis posterior och peronealer - testa därför alltid Thompsons!',
      },
      {
        id: 'step-203-investigation',
        title: 'Utredning',
        type: 'investigation',
        question: 'Behöver du några undersökningar för att bekräfta diagnosen? Motivera ditt svar.',
        hints: [
          'Är achillesruptur en klinisk diagnos?',
          'När kan bilddiagnostik vara värdefull?',
          'Vad kan ultraljud visa?',
        ],
        examples: [
          'Röntgen - vad ser man?',
          'Ultraljud eller MR?',
          'När behövs bilddiagnostik?',
        ],
        correctAnswer:
          'Achillesruptur är en KLINISK diagnos. Bilddiagnostik behövs EJ rutinmässigt. RTG: Utesluter avulsionsfraktur från calcaneus. ULJ/MR: Kan användas vid osäkerhet, för att bedöma rupturens utbredning, eller inför operation för att planera. MR kan visa degenerativa förändringar i återstående sena.',
        feedback:
          'Helt korrekt! En erfaren kliniker kan diagnostisera achillesruptur med >95% säkerhet baserat på anamnes och klinisk undersökning. Bilddiagnostik är främst värdefull för: (1) Osäker klinik, (2) Subtotala rupturer, (3) Preoperativ planering vid komplex kirurgi, (4) Försäkringsmedicinska skäl.',
      },
      {
        id: 'step-204-treatment',
        title: 'Behandling',
        type: 'treatment',
        question:
          'Vilka behandlingsalternativ finns och hur väljer du mellan dem för denna aktiva 38-åriga patient?',
        hints: [
          'Två huvudsakliga strategier: konservativ vs. operativ',
          'Vilka faktorer påverkar valet?',
          'Vad säger evidensen om reruptur?',
        ],
        examples: [
          'Konservativ med gipsskena',
          'Öppen kirurgisk sutur',
          'Perkutan sutur',
          'Patientfaktorer som påverkar',
        ],
        correctAnswer:
          'KONSERVATIV: Gipsskena i spetsfot 2v → walker boot med kilar, gradvis dorsalflexion över 6v. Total 8-12v. OPERATIV: Öppen sutur (bäst styrka) eller perkutan (lägre sårkomplikationer). REKOMMENDATION: För aktiv 38-åring ofta OPERATIV pga lägre reruptur (3% vs 12%) och bättre funktion. Faktorer: aktivitetsnivå, ålder, komorbiditeter, patientpreferens.',
        feedback:
          'Mycket bra analys! Modern forskning visar att skillnaderna mellan konservativ och operativ behandling har minskat med moderna protokoll (tidig rörlighet). För unga aktiva patienter rekommenderas ofta operation pga lägre rerupturrisk. Hos äldre/inaktiva eller vid hög operationsrisk kan konservativ behandling med tidig funktionell mobilisering ge goda resultat.',
      },
    ],
  },

  {
    id: 'sbs-003-pediatric-supracondylar',
    title: 'Barnskada - Suprakondylär Humerusfraktur',
    domain: 'hand-handled',
    difficulty: 'advanced',
    level: 'st3',
    mode: 'guided',
    patient: {
      age: 6,
      gender: 'Flicka',
      complaint: 'Kraftig svullnad och smärta över armbågen efter fall från gungan',
    },
    initialPresentation:
      'En 6-årig flicka kommer till akuten efter fall från gungan. Hon har kraftig svullnad och smärta över armbågen och håller armen i flexion. Modern är mycket orolig.',
    learningObjectives: [
      'Bedöma vaskulär status vid suprakondylära frakturer',
      'Känna till Gartland-klassifikationen',
      'Förstå akut handläggning och operationsindikationer',
      'Identifiera riskfaktorer för kompartmentsyndrom',
    ],
    references: ['tachdjian-5ed', 'gartland-1959', 'rockwood-9ed'],
    steps: [
      // Abbreviated for space - full implementation would include all steps
      {
        id: 'step-301-anamnes',
        title: 'Anamnes',
        type: 'anamnes',
        question:
          'Vilka är de kritiska anamnesuppgifterna vid misstänkt suprakondylär humerusfraktur hos barn?',
        hints: [
          'Traumamekanism är viktig hos barn',
          'Tid sedan skadan?',
          'Symtom som tyder på kärlpåverkan?',
        ],
        examples: [
          'Fallhöjd och hur landade barnet?',
          'När inträffade skadan?',
          'Domningar eller färgförändring i handen?',
          'Öppna vs stängda frakturer?',
        ],
        feedback:
          'Utmärkt! Suprakondylära humerusfrakturer utgör 50-60% av alla armbågsfrakturer hos barn. Fall på utsträckt arm (FOOSH) är klassisk mekanism. TID är kritisk - risk för kompartmentsyndrom och Volkmanns kontraktur ökar med tiden. ALLTID fråga om domningar och färgförändringar!',
      },
      // ... rest of steps
    ],
  },

  // ==================== SCENARIO MODE CASES (from caseStudies) ====================

  {
    id: 'student-1',
    title: 'Handledsfraktur efter fall',
    domain: 'hand-handled',
    difficulty: 'beginner',
    level: 'student',
    mode: 'scenario',
    patient: {
      age: 65,
      gender: 'Kvinna',
      complaint: 'Ont i handleden efter fall',
    },
    initialPresentation: `En 65-årig kvinna kommer till akuten efter att ha fallit på utsträchkt hand. Hon har svår smärta i handleden och kan inte röra den. Vid undersökning ser du svullnad och deformitet vid distala radius.`,
    learningObjectives: [
      'Känna igen Colles fraktur',
      'Utföra neurovaskulär undersökning',
    ],
    references: ['rockwood-9ed', 'green-8ed'],
    questions: [
      {
        id: 'q1',
        question: 'Vilken är den vanligaste frakturen vid fall på utsträckt hand hos äldre?',
        options: [
          'Scaphoidfraktur',
          'Colles fraktur',
          'Smiths fraktur',
          'Bartons fraktur',
        ],
        correctAnswer: 'Colles fraktur',
        explanation:
          'Colles fraktur (distal radiusfraktur med dorsal vinkling) är den vanligaste frakturen vid fall på utsträckt hand hos äldre personer, särskilt kvinnor med osteoporos.',
      },
      {
        id: 'q2',
        question: 'Vilka strukturer måste du kontrollera vid undersökning?',
        options: [
          'Endast puls',
          'Puls, sensorik och motorik',
          'Endast motorik',
          'Endast sensorik',
        ],
        correctAnswer: 'Puls, sensorik och motorik',
        explanation:
          'Det är viktigt att göra en fullständig neurovaskulär undersökning med kontroll av puls, sensorik (medianus-, ulnaris- och radialisfördel) och motorik för att utesluta nervskada eller kärlskada.',
      },
    ],
  },

  {
    id: 'at-1',
    title: 'Akut fotledsdistorsion',
    domain: 'fot-fotled',
    difficulty: 'beginner',
    level: 'at',
    mode: 'scenario',
    patient: {
      age: 28,
      gender: 'Man',
      complaint: 'Vridit foten vid fotbollsspel',
    },
    initialPresentation: `En 28-årig man kommer till akuten efter att ha vridit foten vid fotbollsspel. Han har svullnad lateralt om fotleden och kan belasta med smärta. Ottawa ankle rules indikerar röntgen.`,
    learningObjectives: [
      'Tillämpa Ottawa ankle rules',
      'Förstå funktionell behandling av ankelskador',
    ],
    references: ['sccm-ottawa-rules', 'rockwood-9ed', 'weber-1972'],
    questions: [
      {
        id: 'q1',
        question: 'Vilka är indikationerna för röntgen enligt Ottawa ankle rules?',
        explanation:
          'Ottawa ankle rules säger att röntgen ska tas om det finns: 1) Ömhet över bakre delen eller spetsen av malleolerna, 2) Oförmåga att gå 4 steg direkt efter skadan och i akuten, 3) Ömhet över naviculare eller basis metatarsale 5.',
      },
      {
        id: 'q2',
        question: 'Hur behandlar du en isolerad laterlig ligamentskada utan fraktur?',
        explanation:
          'Funktionell behandling rekommenderas: RICE (vila, is, kompression, elevation) initialt, följt av tidig mobilisering och styrketräning. Ortos eller bandage kan användas för stabilitet. Gips är sällan indicerat.',
      },
    ],
  },

  {
    id: 'st1-1',
    title: 'Komplex lårbensbrott',
    domain: 'trauma',
    difficulty: 'advanced',
    level: 'st1',
    mode: 'scenario',
    patient: {
      age: 42,
      gender: 'Man',
      complaint: 'Polytrauma efter trafikolycka',
    },
    initialPresentation: `En 42-årig man inkommer efter MC-olycka. Han har ett slutet femurbrott på vänster sida, midjeskaft. Patienten är cirkulatoriskt stabil men har betydande smärta. Röntgen visar en tvärgående fraktur i mitten av femurskaftet.`,
    learningObjectives: [
      'Förstå indikationer för intramedullar spik',
      'Känna till komplikationer efter femurfrakturer',
    ],
    references: ['atls-sverige-2022', 'rockwood-9ed', 'campbell-13ed'],
    questions: [
      {
        id: 'q1',
        question: 'Vilken är den primära behandlingsmetoden för denna frakturtyp?',
        explanation:
          'Intramedullär spikoperration (märgspikning) är guldstandarden för slutna femorala skaftfrakturer hos vuxna. Detta ger stabil fixation, tillåter tidig mobilisering och har låg komplikationsrisk. Operationen bör utföras akut, helst inom 24 timmar.',
      },
      {
        id: 'q2',
        question: 'Vilka komplikationer måste du vara vaksam på postoperativt?',
        explanation:
          'Viktiga komplikationer att övervaka: 1) Fettembolisyndrom (FES) - kan uppstå 24-72h postop, 2) Kompartmentsyndrom, 3) Infektion, 4) Malunion/nonunion, 5) Nervskador (n. ischiadicus). FES-triaden: andningspåverkan, neurologiska symtom, petekier.',
      },
    ],
  },
];

/**
 * Get cases by mode
 */
export function getCasesByMode(mode: 'guided' | 'scenario' | 'all') {
  if (mode === 'all') return UNIFIED_CLINICAL_CASES;
  return UNIFIED_CLINICAL_CASES.filter((c) => c.mode === mode);
}

/**
 * Get cases by difficulty level
 */
export function getCasesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced' | 'all') {
  if (difficulty === 'all') return UNIFIED_CLINICAL_CASES;
  return UNIFIED_CLINICAL_CASES.filter((c) => c.difficulty === difficulty);
}

/**
 * Get cases by domain
 */
export function getCasesByDomain(domain: string) {
  if (domain === 'all') return UNIFIED_CLINICAL_CASES;
  return UNIFIED_CLINICAL_CASES.filter((c) => c.domain === domain);
}

/**
 * Get cases by education level
 */
export function getCasesByLevel(level: string) {
  if (level === 'all') return UNIFIED_CLINICAL_CASES;
  return UNIFIED_CLINICAL_CASES.filter((c) => c.level === level);
}

/**
 * Get case by ID
 */
export function getCaseById(id: string) {
  return UNIFIED_CLINICAL_CASES.find((c) => c.id === id);
}

/**
 * Get statistics
 */
export function getCaseStats() {
  const total = UNIFIED_CLINICAL_CASES.length;
  const byMode = {
    guided: UNIFIED_CLINICAL_CASES.filter((c) => c.mode === 'guided').length,
    scenario: UNIFIED_CLINICAL_CASES.filter((c) => c.mode === 'scenario').length,
  };
  const byDifficulty = {
    beginner: UNIFIED_CLINICAL_CASES.filter((c) => c.difficulty === 'beginner').length,
    intermediate: UNIFIED_CLINICAL_CASES.filter((c) => c.difficulty === 'intermediate').length,
    advanced: UNIFIED_CLINICAL_CASES.filter((c) => c.difficulty === 'advanced').length,
  };

  return { total, byMode, byDifficulty };
}
