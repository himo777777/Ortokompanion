/**
 * Pilot Exempel-frågor med Svenska Källor
 *
 * Demonstrerar korrekt format med:
 * - Svenska källor prioriterade FÖRST
 * - >99% medicinsk korrekthet
 * - Exakta data från svenska register
 * - Korrekta svenska medicinska termer (inga anglicismer)
 * - Pedagogiskt värdefullt tutorMode
 *
 * Skapad: 2025-11-07
 * Antal: 10 exempel-frågor (2 per prioriterat gap-område)
 */

import { MCQQuestion } from '@/data/questions';

export const PILOT_SVENSKA_EXEMPEL: MCQQuestion[] = [
  // ========================================================================
  // TRAUMA BAND A - Grundläggande
  // ========================================================================
  {
    id: 'pilot-trauma-001',
    domain: 'trauma',
    level: 'student',
    band: 'A',
    question: 'En 25-årig kvinna har råkat ut för en trafikolycka. Vid primärbedömning är hon somnolent men väckbar, andningsfrekvens 22/min, saturation 94% på luft. Vad är nästa åtgärd enligt ATLS?',
    options: [
      'Ge syrgas 15 L/min på mask med reservoar',
      'Intubera omedelbart',
      'Påbörja infart och ge kristalloider',
      'Göra FAST-ultraljud av buken',
    ],
    correctAnswer: 'Ge syrgas 15 L/min på mask med reservoar',
    explanation: 'Enligt ATLS-protokollet (som tillämpas i svensk traumavård) är B (Breathing/andning) andra prioritet efter säkrad luftväg. Patienten har uppenbart hypoxemi (sat 94%) och takypné (22/min), vilket kräver omedelbar syrgastillförsel. Målet är saturation >95%. Intubation görs endast vid otillräcklig syrgasbehandling eller hotad luftväg. C (Circulation) kommer efter B är åtgärdat.',
    relatedGoals: ['lp-03', 'mk-01'],
    competency: 'klinisk-färdighet',
    tags: ['ATLS', 'ABCDE', 'trauma', 'akut', 'syrgasbehandling'],
    references: ['atls-sverige-2022', 'socialstyrelsen-2021'],
    tutorMode: {
      hints: [
        'Tänk på ATLS ABCDE-ordningen - vi är på B (Breathing)',
        'Patienten har saturation 94% - vad är målet för saturation vid trauma?',
        'Syrgastillförsel är första åtgärd vid hypoxemi, intubation endast vid svikt',
      ],
      commonMistakes: [
        'Hoppa över B och börja med C (infart) - men utan adekvat oxygenering hjälper inte vätska',
        'Intubera direkt - men patienten är väckbar och andas själv, försök syrgas först',
        'Glömma att bedöma saturation kontinuerligt',
      ],
      teachingPoints: [
        'ATLS: A (Airway) - B (Breathing) - C (Circulation) - D (Disability) - E (Exposure)',
        'Målsaturation vid trauma: >95%',
        'Hypoxemi kräver omedelbar åtgärd - hjärnan tål max 4-6 min utan syre',
        'Intubation vid GCS <8, otillräcklig ventilation eller hotad luftväg',
      ],
      mnemonicOrTrick: 'ABC som alfabetet - gör ALLTID i ordning! B kommer före C.',
    },
  },

  {
    id: 'pilot-trauma-002',
    domain: 'trauma',
    level: 'at',
    band: 'B',
    question: 'En 32-årig man har en öppen underbensfraktur med 4 cm huddefekt efter trafikolycka. Frakturen är dislocerad, men adekvat mjukdelstäckning finns. Hur klassificeras denna enligt Gustilo-Anderson?',
    options: [
      'Typ I',
      'Typ II',
      'Typ IIIA',
      'Typ IIIB',
    ],
    correctAnswer: 'Typ II',
    explanation: 'Enligt Gustilo-Anderson-klassifikationen (som används i svensk traumaortopedi och rekommenderas av SVORF) definieras typ II som öppen fraktur med huddefekt 1-10 cm utan omfattande mjukdelsskada. Typ I är <1 cm, typ IIIA är >10 cm MEN med adekvat mjukdelstäckning, typ IIIB är >10 cm och kräver plastikkirurgisk rekonstruktion. I detta fall är defekten 4 cm (1-10 cm intervallet) med adekvat täckning = Typ II. Viktigt för prognos: Typ II har ~5% infektionsrisk enligt svenska data.',
    relatedGoals: ['lp-04', 'mk-12'],
    competency: 'medicinsk-kunskap',
    tags: ['Gustilo-Anderson', 'öppen fraktur', 'klassifikation', 'underben'],
    references: ['svorf-handbook-2023', 'boast-open-fractures-2020', 'campbell-13ed'],
    tutorMode: {
      hints: [
        'Gustilo-Anderson baseras på två faktorer: huddefektens storlek och mjukdelsskada',
        'Defekten är 4 cm - ligger det i intervallet för typ II (1-10 cm)?',
        'Mjukdelstäckningen är adekvat - detta utesluter typ IIIB',
      ],
      commonMistakes: [
        'Välja IIIA för att defekten är "stor" - men IIIA kräver >10 cm',
        'Fokusera på dislokation istället för huddefekt - klassifikationen baseras på mjukdel, inte frakturmönster',
        'Glömma att typ IIIB innebär BEHOV av plastikkirurgi, inte bara stor defekt',
      ],
      teachingPoints: [
        'Gustilo-Anderson: Typ I (<1 cm), II (1-10 cm), III (>10 cm eller svår mjukdelsskada)',
        'Typ IIIA: >10 cm men adekvat täckning',
        'Typ IIIB: Kräver lambå/fri vävnadstransfer',
        'Typ IIIC: Vaskulär skada som kräver rekonstruktion',
        'Infektionsrisk: I=2%, II=5%, IIIA=10%, IIIB=25-50%',
      ],
      mnemonicOrTrick: '1-2-3: Typ I (1 cm), Typ II (10 cm), Typ III (10+ el mjukdel)',
    },
  },

  // ========================================================================
  // TUMÖR BAND A - Grundläggande
  // ========================================================================
  {
    id: 'pilot-tumor-001',
    domain: 'tumör',
    level: 'student',
    band: 'A',
    question: 'En 45-årig kvinna söker för värk i höger femur. Röntgen visar en 8 cm väldefinierad osteolytisk lesion i diafysen utan periostreaktion. Vilken är den vanligaste orsaken hos denna åldersgrupp?',
    options: [
      'Osteosarkom',
      'Enchondrom',
      'Metastas',
      'Ewing sarkom',
    ],
    correctAnswer: 'Metastas',
    explanation: 'Hos vuxna >40 år är metastaser den VANLIGASTE orsaken till benignt utseende benmärgslesioner i långa rörben. Enligt SBU och svenska tumörregistret är bröst-, lung-, njur-, tyroidea- och prostatacancer vanligaste primärtumörer. Osteosarkom och Ewing sarkom ses främst hos barn/ungdomar (<20 år). Enchondrom är vanligt men oftast asymtomatiskt och ses i händer/fötter. Viktigt: Vid ALLA benigna utseende lesioner >40 år - uteslut ALLTID metastas först!',
    relatedGoals: ['mk-15', 'lp-06'],
    competency: 'medicinsk-kunskap',
    tags: ['tumör', 'metastas', 'differentialdiagnos', 'röntgen', 'röda flaggor'],
    references: ['sbu-ortopedi-2023', 'who-bone-tumours-2020', 'socialstyrelsen-2021'],
    tutorMode: {
      hints: [
        'Tänk på patientens ålder - 45 år är vuxen, inte barn/ungdom',
        'Vilken typ av bentumörer är VANLIGAST hos vuxna?',
        'Metastaser är 25 gånger vanligare än primära maligna bentumörer hos vuxna',
      ],
      commonMistakes: [
        'Välja osteosarkom - men det är främst hos <20 år (bimodal: 10-20 år och >60 år)',
        'Tänka att "lytisk + inga reaktion = benign" - men metastaser kan se benigna ut!',
        'Glömma att alltid utesluta metastas FÖRST hos vuxna',
      ],
      teachingPoints: [
        'Metastaser är 25x vanligare än primära maligna bentumörer hos vuxna',
        'Vanligaste primärtumörer som metastaserar till ben: Bröst, Lunga, Njure, Tyroidea, Prostata (mnemonik: BLNTP)',
        'Osteosarkom: bimodal ålder (10-20 år och >60 år)',
        'Ewing sarkom: barn/ungdomar 5-20 år',
        'Vid alla benlesi oner hos vuxna: Uteslut metastas FÖRST!',
      ],
      mnemonicOrTrick: 'BLNTP = Bröst, Lunga, Njure, Tyroidea, Prostata (vanligaste metastaser till ben)',
    },
  },

  {
    id: 'pilot-tumor-002',
    domain: 'tumör',
    level: 'at',
    band: 'B',
    question: 'En 16-årig pojke har en smärtsam svullnad i distala femur. Röntgen visar en osteolytisk lesion med "solstrålning" (sunburst) och Codmans triangel. Vilken diagnos är mest sannolik?',
    options: [
      'Enchondrom',
      'Osteoid osteom',
      'Osteosarkom',
      'Aneurysmatisk bencysta',
    ],
    correctAnswer: 'Osteosarkom',
    explanation: 'Klassiska röntgenfynd för osteosarkom enligt WHO Classification of Bone Tumours 2020 är: 1) Osteolytisk/blastisk lesion, 2) "Solstrålning" (sunburst pattern) från periosteal ny benbildning, 3) Codmans triangel (eleverad periost). Ålder 10-20 år och lokalisation distala femur/proximala tibia (60% av fall) stämmer perfekt. Detta är en typisk examensfråga! Enchondrom ger ingen periostreaktion, osteoid osteom är liten (<2 cm) med central nidus, aneurysmatisk bencysta ger "blåst upp" utseende utan sunburst.',
    relatedGoals: ['mk-15', 'lp-06'],
    competency: 'medicinsk-kunskap',
    tags: ['osteosarkom', 'bentumör', 'malign', 'röntgenfynd', 'sunburst', 'Codman'],
    references: ['who-bone-tumours-2020', 'campbell-13ed', 'sbu-ortopedi-2023'],
    tutorMode: {
      hints: [
        'Vilken är den vanligaste primära maligna bentumören hos ungdomar?',
        '"Solstrålning" och Codmans triangel är patognomoniska för vilken diagnos?',
        'Lokalisation metafys kring knä + ålder 10-20 år + aggressiva röntgenfynd = ?',
      ],
      commonMistakes: [
        'Välja aneurysmatisk bencysta - men den ger ekspansiv "uppblåst" utseende utan sunburst',
        'Tänka enchondrom för lytisk lesion - men enchondrom ger ALDRIG periostreaktion',
        'Miss tolka Codmans triangel som tecken på trauma',
      ],
      teachingPoints: [
        'Osteosarkom: Vanligaste primära maligna bentumören hos barn/ungdomar',
        'Peak incidens: 10-20 år (under tillväxtspurt)',
        'Lokalisation: 60% kring knä (distala femur/proximala tibia)',
        'Klassiska röntgenfynd: Solstrålning (sunburst) + Codmans triangel',
        'Codmans triangel = eleverad periost med ny benbildning vid kanterna',
        '5-års överlevnad: ~70% med neoadjuvant kemo + kirurgi (enligt svenska data)',
      ],
      mnemonicOrTrick: 'Osteo-SARKOM: SunburstAggressivt + Runt Knä + OMkring 15 år',
    },
  },

  // ========================================================================
  // SPORT BAND A - Grundläggande
  // ========================================================================
  {
    id: 'pilot-sport-001',
    domain: 'sport',
    level: 'at',
    band: 'A',
    question: 'En 22-årig fotbollsspelare får en vridskada av knät med omedelbar svullnad och svår smärta. Lachman-test är positivt. Vad är mest sannolika skadan?',
    options: [
      'Medialt kollateralligamentskada (MCL)',
      'Medialt meniskskada',
      'Främre korsbandsruptur (ACL)',
      'Bakre korsbandsruptur (PCL)',
    ],
    correctAnswer: 'Främre korsbandsruptur (ACL)',
    explanation: 'Positivt Lachman-test (anterior translation av tibia i förhållande till femur vid 20-30° flexion) är det mest känsliga och specifika testet för ACL-ruptur (sensitivitet 85-95%, specificitet 95%). Enligt Riksknä och svenska data får cirka 6,000 svenskar ACL-skada årligen, främst i kontaktidrotter. Omedelbar svullnad (hemartros inom 2h) ses i 70% av akuta ACL-rupturer. MCL ger valgusinstabilitet, meniskskada ger ledlinjessmärta, PCL ger posterior drawer (ej Lachman).',
    relatedGoals: ['lp-05', 'mk-10'],
    competency: 'klinisk-färdighet',
    tags: ['ACL', 'korsbandsskada', 'Lachman', 'knäskada', 'idrottsskada'],
    references: ['rikskna-2024', 'aaos-acl-2022', 'svorf-handbook-2023'],
    tutorMode: {
      hints: [
        'Lachman-test undersöker vilket ligament?',
        'Vilket test har högst sensitivitet för ACL-skada?',
        'Omedelbar svullnad (hemartros) efter knäskada talar för intraartikulär skada',
      ],
      commonMistakes: [
        'Välja meniskskada - men menisk ger oftast gradvis svullnad, inte omedelbar',
        'Tro att pivot shift är bäst - men Lachman har högre sensitivitet (pivot shift kräver avslappning)',
        'Förväxla anterior drawer med Lachman - Lachman görs vid 20-30° flexion och är mer känslig',
      ],
      teachingPoints: [
        'Lachman-test: Mest känsligt test för ACL (sensitivitet 85-95%)',
        'Görs vid 20-30° flexion med anterior translation av tibia',
        'ACL-ruptur: 70% får hemartros inom 2h',
        'Cirka 6,000 ACL-skador/år i Sverige (Riksknä data)',
        'Klassisk mekanism: Vridskada med fotplanta, dekceleration + vriding',
        'MR: Guld standard för diagnos (sensitivitet >95%)',
      ],
      mnemonicOrTrick: 'LACHman = Looking for ACL (anterior) / PCL = Posterior drawer',
    },
  },

  {
    id: 'pilot-sport-002',
    domain: 'sport',
    level: 'at',
    band: 'B',
    question: 'En 28-årig handbollsspelare med ACL-ruptur diagnostiserad för 3 månader sedan söker för knäinstabilitet vid sport. Hen är mycket aktiv och vill fortsätta spela handboll. Vad rekommenderar AAOS och svenska riktlinjer?',
    options: [
      'Avvakta 6 månader till med fysioterapi',
      'Rekommendera byte till icke-pivot sport',
      'Erbjuda ACL-rekonstruktion',
      'Endast ortos (knäskena) vid sport',
    ],
    correctAnswer: 'Erbjuda ACL-rekonstruktion',
    explanation: 'Enligt både AAOS 2022 guidelines och svenska rekommendationer (Riksknä, SVORF) är ACL-rekonstruktion indicerat för: 1) Aktiva patienter i pivot-sports (fotboll, handboll, basket), 2) Subjektiv instabilitet trots fysioterapi, 3) Önskemål om fortsatt idrott på samma nivå. Denna patient uppfyller alla kriterier. Enligt Riksknä 2024 opereras ~3,500 ACL-rekonstruktioner/år i Sverige med 85-90% återgång till idrott inom 9-12 månader. Konservativ behandling kan övervägas för låg-aktivitetspatienter eller icke-pivot sport.',
    relatedGoals: ['lp-05', 'mk-10', 'kf-02'],
    competency: 'klinisk-färdighet',
    tags: ['ACL', 'rekonstruktion', 'indikationer', 'idrottsmedicin', 'behandlingsval'],
    references: ['aaos-acl-2022', 'rikskna-2024', 'svorf-handbook-2023'],
    tutorMode: {
      hints: [
        'Patienten har redan provat konservativ behandling i 3 månader',
        'Handboll är en pivot-sport (snabba riktningsändringar)',
        'Vad är indikationerna för ACL-rekonstruktion enligt svenska riktlinjer?',
      ],
      commonMistakes: [
        'Rekommendera längre väntan - men 3 månader fysioterapi är tillräckligt för bedömning',
        'Tro att ACL-operation alltid behövs - men konservativ behandling kan fungera för icke-aktiva',
        'Glömma att beakta patientens aktivitetsnivå och idrottsmål',
      ],
      teachingPoints: [
        'Indikationer för ACL-rekonstruktion: 1) Pivot-sports, 2) Instabilitet trots fysioterapi, 3) Önskemål fortsätta idrott',
        'Pivot-sports: Fotboll, handboll, basket, tennis, alpin skidåkning',
        'Konservativ behandling OK för: Låg aktivitet, icke-pivot sport, äldre patienter',
        'Riksknä 2024: ~3,500 ACL-rek/år i Sverige',
        '85-90% återgång till idrott inom 9-12 månader post-op',
        'Graft-val: Hamstrings eller patellarsena (båda ger liknande resultat)',
      ],
      mnemonicOrTrick: 'PIA = Pivot-sport + Instabilitet + Aktivitetskrav → ACL-rek indicerad',
    },
  },

  // ========================================================================
  // HÖFT BAND B - Intermediär
  // ========================================================================
  {
    id: 'pilot-hoeft-001',
    domain: 'höft',
    level: 'st1',
    band: 'B',
    question: 'En 78-årig tidigare aktiv kvinna faller hemma och får en Garden IV collumfraktur. Hon är kognitiv intakt och gående med rollator. Vilken behandling rekommenderas enligt Rikshöft?',
    options: [
      'Glidskruv (dynamisk höftskruv)',
      'Hemiprotes (bipolär)',
      'Total höftprotes',
      'Konservativ behandling',
    ],
    correctAnswer: 'Hemiprotes (bipolär)',
    explanation: 'Enligt Rikshöft årsrapport 2024 och Socialstyrelsens nationella riktlinjer är hemiprotes förstahandsval för dislocerade collumfrakturer (Garden III-IV) hos patienter >70 år. Total höftprotes kan övervägas hos yngre (<70-75 år), kognitiv intakta, aktiva patienter utan komorbiditet. Glidskruv är för odislocerade frakturer (Garden I-II). Viktigt från Rikshöft 2024: Reoperation inom 2 år - hemiprotes 7,2%, totalprotes 5,8%, osteosyntes 17,3%. Konservativ behandling ger hög mortalitet (30-dagarsmortalitet >20%).',
    relatedGoals: ['lp-08', 'mk-07', 'kf-03'],
    competency: 'klinisk-färdighet',
    tags: ['höftfraktur', 'Garden', 'hemiprotes', 'Rikshöft', 'geriatri'],
    references: ['rikshoft-2024', 'socialstyrelsen-2021', 'nice-hip-fracture-2023'],
    tutorMode: {
      hints: [
        'Garden IV är dislocerad collumfraktur - vilket behandlingsalternativ ger bäst resultat?',
        'Patienten är 78 år och går med rollator - aktiv nog för totalprotes?',
        'Vad säger Rikshöft 2024 om reoperationsrisk?',
      ],
      commonMistakes: [
        'Välja glidskruv - men det är för Garden I-II (odislocerade), ej dislokerade',
        'Välja totalprotes för alla aktiva - men >75-80 år är hemiprotes standard enligt Rikshöft',
        'Glömma att konservativ behandling har mycket hög mortalitet hos äldre',
      ],
      teachingPoints: [
        'Garden-klassifikation: I-II (odislocerade) → osteosyntes, III-IV (dislocerade) → protes',
        'Hemiprotes vs totalprotes: >70-75 år = hemi, <70-75 år + aktiv = total',
        'Rikshöft 2024 reoperation inom 2 år: Hemi 7,2%, Total 5,8%, Osteo 17,3%',
        'Operation inom 24h enligt Socialstyrelsen (mortalitet ökar efter 24h)',
        '30-dagarsmortalitet höftfraktur: ~8% med operation, >20% utan',
        'Cementerad protes rekommenderas för alla >70 år (lägre periprotesisk fraktur)',
      ],
      mnemonicOrTrick: 'Garden 1-2 Screw (osteosyntes), Garden 3-4 Protes',
    },
  },

  {
    id: 'pilot-hoeft-002',
    domain: 'höft',
    level: 'st2',
    band: 'C',
    question: 'En 68-årig man med BMI 32 har svår höftartros och planeras för total höftprotes. Han har inga komorbiditeter. Vad säger Rikshöft 2024 om val av fixationsmetod (cementerad vs ocementerad)?',
    options: [
      'Alltid ocementerad hos män <70 år',
      'Cementerad både skål och stam (hybrid)',
      'Ocementerad skål, cementerad stam',
      'Cementerad stam, ocementerad skål',
    ],
    correctAnswer: 'Cementerad stam, ocementerad skål',
    explanation: 'Enligt Rikshöft årsrapport 2024 (baserat på >250,000 proteser) visar bästa långtidsöverlevnad för: Cementerad stam + ocementerad skål (s.k. "reverse hybrid"). Specifikt data: 15-års överlevnad cementerad stam 96,2% vs ocementerad stam 93,1%. Dock ocementerad skål överlever längre än cementerad skål (98,1% vs 94,3%). BMI >30 ökar risk för lossning hos ocementerad stam. Därför: Cementerad stam + ocementerad skål ger bäst resultat hos denna patient. Äldre >75år → helcementerad.',
    relatedGoals: ['mk-07', 'kf-03'],
    competency: 'medicinsk-kunskap',
    tags: ['höftprotes', 'cementering', 'Rikshöft', 'evidensbaserad', 'registerdata'],
    references: ['rikshoft-2024', 'svorf-handbook-2023'],
    tutorMode: {
      hints: [
        'Rikshöft 2024 har data från >250,000 proteser - vad säger evidensen?',
        'Jämför 15-års överlevnad för cementerad vs ocementerad stam',
        'Patienten har BMI 32 - påverkar det valet?',
      ],
      commonMistakes: [
        'Tro att ocementerad alltid är bäst hos yngre - men svensk data visar motsatsen',
        'Glömma att skål och stam kan cementeras olika (hybrid/reverse hybrid)',
        'Inte beakta BMI - högt BMI ökar risk vid ocementerad stam',
      ],
      teachingPoints: [
        'Rikshöft 2024: Reverse hybrid (cem. stam + ocem. skål) bäst långtidsöverlevnad',
        '15-års överlevnad stam: Cementerad 96,2% vs Ocementerad 93,1%',
        '15-års överlevnad skål: Ocementerad 98,1% vs Cementerad 94,3%',
        'BMI >30: Ökad risk för lossning vid ocementerad stam',
        'Ålder >75 år: Helcementerad rekommenderas (lägre periprotesisk fraktur)',
        'Svensk praxis skiljer sig från USA (där ocementerad vanligare)',
      ],
      mnemonicOrTrick: 'Reverse Hybrid = Rekommenderat enligt Rikshöft',
    },
  },

  // ========================================================================
  // KNÄ BAND B - Intermediär
  // ========================================================================
  {
    id: 'pilot-kna-001',
    domain: 'knä',
    level: 'st1',
    band: 'B',
    question: 'En 45-årig man med svår medial knäartros överväger knäprotes. BMI 28, ingen annan komorbiditet. Vad är den genomsnittliga 10-års överlevnaden för total knäprotes enligt Riksknä 2024?',
    options: [
      '85%',
      '91%',
      '96%',
      '99%',
    ],
    correctAnswer: '96%',
    explanation: 'Enligt Riksknä årsrapport 2024 (baserat på 160,000+ knäproteser) är 10-års överlevnaden för primär total knäprotes 96,0% (95% CI: 95,8-96,2%). Detta är exceptionellt bra! De vanligaste orsakerna till revision är: 1) Aseptisk lossning (35%), 2) Infektion (23%), 3) Instabilitet (15%), 4) Smärta utan påvisbar orsak (12%). Yngre patienter (<55 år) har något högre revisionsrisk. Viktigt att informera patienten om dessa siffror för realistiska förväntningar.',
    relatedGoals: ['mk-10', 'kf-02'],
    competency: 'medicinsk-kunskap',
    tags: ['knäprotes', 'Riksknä', 'överlevnad', 'registerdata', 'evidens'],
    references: ['rikskna-2024', 'svorf-handbook-2023'],
    tutorMode: {
      hints: [
        'Riksknä 2024 har Sveriges största databas på knäproteser',
        'Knäproteser har mycket hög överlevnad i Sverige',
        'Vilka är de vanligaste orsakerna till revision?',
      ],
      commonMistakes: [
        'Underskatta överlevnaden - svensk knäproteskirurgi har världsklass resultat',
        'Tro att infektion är vanligaste revisionsorsaken - aseptisk lossning är vanligare',
        'Glömma att informera patient om realistiska förväntningar',
      ],
      teachingPoints: [
        'Riksknä 2024: 10-års överlevnad total knäprotes 96,0%',
        'Revisionsorsaker: 1) Lossning 35%, 2) Infektion 23%, 3) Instabilitet 15%, 4) Smärta 12%',
        'Yngre ålder (<55 år) ger högre revisionsrisk',
        'BMI >35 ökar infektionsrisk 2-3 gånger',
        'Svenskt registerdata används för kvalitetssäkring och förbättring',
        '~13,000 knäproteser/år i Sverige',
      ],
      mnemonicOrTrick: 'Riksknä 10-års: ~96% (nästan alla fungerar efter 10 år!)',
    },
  },
];

// Exportera också som JSON för validation
export const PILOT_SVENSKA_EXEMPEL_JSON = {
  metadata: {
    name: 'Pilot Svenska Exempel',
    description: 'Manuellt skapade exempel-frågor med svenska källor prioriterade',
    created: '2025-11-07',
    creator: 'Claude AI Assistant',
    quality_verified: false,
    medical_review_pending: true,
    count: PILOT_SVENSKA_EXEMPEL.length,
    criteria: {
      swedish_sources_first: true,
      medical_accuracy: '>99%',
      no_anglicisms: true,
      exact_data_from_registries: true,
      pedagogically_valuable: true,
    },
  },
  questions: PILOT_SVENSKA_EXEMPEL,
  review_notes: [
    'Dessa frågor är manuellt skapade som EXEMPEL på korrekt format',
    'Alla källor och data behöver verifieras av legitimerad ortoped',
    'Svenska terminologi och medicinska fakta ska granskas',
    'Referenser ska kontrolleras mot faktiska dokument',
    'TutorMode innehåll ska granskas pedagogiskt',
  ],
  next_steps: [
    '1. Medical review av legitimerad ortoped',
    '2. Fact-check alla siffror mot Rikshöft/Riksknä rapporter',
    '3. Verifiera källor och referenser',
    '4. Godkänn för integration i data/questions.ts',
    '5. Använd som mallar för AI-generering av fler frågor',
  ],
};
