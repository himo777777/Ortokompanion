/**
 * Step-by-Step Clinical Cases
 * Guided learning cases with structured clinical reasoning
 */

import { StepByStepCase } from '@/components/learning/StepByStepTutor';

export const STEP_BY_STEP_CASES: StepByStepCase[] = [
  {
    id: 'sbs-001-femur-fracture',
    title: 'Högenergiskada - Femurfraktur',
    domain: 'Trauma',
    difficulty: 'intermediate',
    initialPresentation:
      'En 45-årig man kommer till akuten efter en trafikolycka. Han klagar på svår smärta i höger lår och kan inte belasta benet.',
    learningObjectives: [
      'Identifiera kritiska anamnesuppgifter vid högenergiskador',
      'Utföra systematisk traumaundersökning enligt ATLS',
      'Planera adekvat initial utredning',
      'Välja lämplig behandlingsstrategi för femurfrakturer',
    ],
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
    domain: 'Fotkirurgi',
    difficulty: 'beginner',
    initialPresentation:
      'En 38-årig tidigare frisk man kommer till akuten efter att ha spelat badminton. Han beskriver att han kände ett "knäpp" i vaden och nu har svårt att gå på tå.',
    learningObjectives: [
      'Känna igen klassisk presentation av achillesruptur',
      'Utföra korrekt klinisk undersökning',
      'Förstå indikationer för konservativ vs. operativ behandling',
    ],
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
    domain: 'Pediatrik',
    difficulty: 'advanced',
    initialPresentation:
      'En 6-årig flicka kommer till akuten efter fall från gungan. Hon har kraftig svullnad och smärta över armbågen och håller armen i flexion. Modern är mycket orolig.',
    learningObjectives: [
      'Bedöma vaskulär status vid suprakondylära frakturer',
      'Känna till Gartland-klassifikationen',
      'Förstå akut handläggning och operationsindikationer',
      'Identifiera riskfaktorer för kompartmentsyndrom',
    ],
    steps: [
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
      {
        id: 'step-302-status',
        title: 'Akut Neurovaskulär Bedömning',
        type: 'status',
        question:
          'Beskriv hur du systematiskt bedömer neurovaskulär status hos detta skrämda barn. Vilka fynd är alarmerande?',
        hints: [
          'Tre nerver måste testas - vilka?',
          'Hur bedömer du cirkulation hos barn?',
          'Vilka "röda flaggor" måste du leta efter?',
        ],
        examples: [
          'N. radialis, medianus, ulnaris',
          'Kapillär återfyllnad och pulsar',
          'Tecken på kompartmentsyndrom',
          'Den "vita handen"',
        ],
        correctAnswer:
          'CIRKULATION: Kapillär återfyllnad (<2s), Radialpuls, Hudfärg och temperatur, "Pink vs White hand". NERVER: N. medianus (OK-tecken, tumgrepp), N. radialis (tumme upp, handled dorsiflexion), N. ulnaris (fingerabduktion). ALARMERANDE: Vit hand, ingen puls, kall hand, 5P:s (Pain, Pallor, Pulselessness, Paresthesias, Paralysis).',
        feedback:
          'Excellent bedömning! Den "vita handen" är en ABSOLUT akut indikation för omedelbar reposition och eventuellt kärlkirurgi. N. medianus är oftast skadad (15%), följt av n. radialis och n. ulnaris. Anterior interosseus nerve (AIN) -skada ger svag tumflexion utan känselnedsättning. Dokumentera alltid neurovaskulär status FÖRE och EFTER varje intervention!',
      },
      {
        id: 'step-303-investigation',
        title: 'Bilddiagnostik',
        type: 'investigation',
        question: 'Vilka röntgenbilder behöver du och vad letar du efter specifikt?',
        hints: [
          'Standardprojektioner för armbåge',
          'Specifika mätningar och linjer hos barn',
          'Jämför med friska sidan vid osäkerhet',
        ],
        examples: [
          'AP och lateral projektion',
          'Anterior humeral line',
          'Baumann vinkel',
          'Jämförande bilder',
        ],
        correctAnswer:
          'RTG: Armbåge AP + lateral. BEDÖM: (1) Anterior humeral line (ska gå genom mitt av capitellum), (2) Hourglass tecken (metadiafysär smalning), (3) Posteriort fettlager-tecken (elevation), (4) Gartland-klassifikation. Vid osäkerhet: Jämförande bilder av friska armbågen. Mät Baumann vinkel för rotationsfel.',
        feedback:
          'Perfekt! Anterior humeral line är kritisk - normalt går den genom mitten eller främre tredjedelen av capitellum. Posteriort fettlager-tecken ses vid alla armbågsfrakturer. Gartlands klassifikation styr behandling: Typ I (odislokerad) = gips, Typ II (dislokerad, posteriort cortex intakt) = ofta kirurgi, Typ III (helt dislokerad) = ALLTID kirurgi omedelbart!',
      },
      {
        id: 'step-304-diagnosis',
        title: 'Klassifikation',
        type: 'diagnosis',
        question:
          'Röntgen visar en Gartland typ III suprakondylär fraktur med posteriort displacement. Hur påverkar detta din handläggning?',
        hints: [
          'Vad innebär Gartland typ III?',
          'Hur akut är situationen?',
          'Vilka komplikationer riskerar detta barn?',
        ],
        examples: [
          'Definition av Gartland III',
          'Timing av operation',
          'Risk för kompartmentsyndrom',
          'Långsiktiga komplikationer',
        ],
        correctAnswer:
          'GARTLAND III: Helt dislokerad fraktur, inget periostalt kontakt. AKUITET: Akut operation (inom 12-24h, oftast samma dag), Vid vaskulär kompromiss: OMEDELBART! KOMPLIKATIONER: Kortfrist: Kärlskada, nervskada, kompartmentsyndrom, Volkmanns kontraktur. Långsiktig: Cubitus varus (10-15% risk), styvhet.',
        feedback:
          'Utmärkt förståelse! Gartland III är en ortopedisk akut situation hos barn. Omedelbar sluten reposition och perkutan pinning är standard. Öppen reposition vid: (1) Irreducibel fraktur, (2) Vaskulär exploration behövs, (3) Öppen fraktur. Postoperativt: tätt neurovaskulärt uppföljning första 24h för att upptäcka kompartmentsyndrom tidigt!',
      },
      {
        id: 'step-305-treatment',
        title: 'Behandlingsplan',
        type: 'treatment',
        question:
          'Vilken är din kompletta behandlingsplan för denna Gartland III fraktur från akutmottagningen till uppföljning?',
        hints: [
          'Omedelbar handläggning innan operation',
          'Kirurgisk teknik',
          'Postoperativ handläggning',
          'När tas pinnarna bort?',
        ],
        examples: [
          'Smärtlindring och immobilisering',
          'Preoperativ reposition',
          'Pinning-teknik',
          'Gipsning och uppföljning',
        ],
        correctAnswer:
          'AKUT: Smärtlindring, Upphöjd arm, Posteriort U-gips i 90° flexion (EJ mer - risk för kärlkompression). OP (akut samma dag): Sluten reposition under genomlysning, Perkutan pinning (2-3 laterala pinnar eller korsade), Kontroll av neurovaskulär status. POSTOP: U-gips 3-4v, Pinnarna EJ begravda, tas bort på mottagning efter 3-4v. UPPFÖLJNING: RTG v1, v3, v6, klinik v12.',
        feedback:
          'Perfekt behandlingsplan! Viktiga poäng: (1) Gips >90° flexion kan kompromittera cirkulation, (2) Laterala pinnar har lägre risk för ulnarisnerv-skada än korsade, men korsade ger bättre rotationsstabilitet vid mycket instabila frakturer, (3) Pinnar tas bort på mottagning utan narkos efter 3-4v - läkning går snabbt hos barn! Långtidsuppföljning viktigt för att upptäcka cubitus varus tidigt.',
      },
    ],
  },
];

/**
 * Get cases by difficulty level
 */
export function getCasesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced') {
  return STEP_BY_STEP_CASES.filter((c) => c.difficulty === difficulty);
}

/**
 * Get cases by domain
 */
export function getCasesByDomain(domain: string) {
  return STEP_BY_STEP_CASES.filter((c) => c.domain === domain);
}

/**
 * Get case by ID
 */
export function getCaseById(id: string) {
  return STEP_BY_STEP_CASES.find((c) => c.id === id);
}
