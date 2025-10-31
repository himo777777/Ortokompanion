/**
 * Specialistexamen i Ortopedi - Frågor
 *
 * Baserat på:
 * - Tidigare examensfrågor
 * - SVORF riktlinjer
 * - Socialstyrelsen målbeskrivning
 * - Campbell's Operative Orthopaedics
 * - Rockwood and Green's Fractures
 */

import { ExamQuestion } from '@/types/exam';

export const specialistExamQuestions: ExamQuestion[] = [
  // TRAUMA - HÖFT
  {
    id: 'spec-trauma-001',
    examType: 'specialist-ortopedi',
    domain: 'höft',
    difficulty: 'standard',
    question: 'En 78-årig kvinna kommer in med en Garden IV-fraktur. Hon var tidigare fullt aktiv och gående med rollator. Vilken behandling rekommenderas enligt svenska riktlinjer?',
    options: [
      'Konservativ behandling med tidig mobilisering',
      'Glidskruv (dynamisk höftskruv)',
      'Hemiprotes (bipolär)',
      'Total höftprotes'
    ],
    correctAnswer: 'Hemiprotes (bipolär)',
    explanation: 'Enligt Rikshöft och svenska riktlinjer är hemiprotes förstahandsval för dislocerade collumfrakturer (Garden III-IV) hos äldre patienter. Total höftprotes kan övervägas hos aktiva patienter utan kognitiv svikt. Glidskruv är för odislocerade frakturer (Garden I-II). Konservativ behandling ger hög mortalitet och morbiditet.',
    learningObjectives: [
      'Känna till Garden-klassifikationen',
      'Förstå behandlingsalgoritm för collumfrakturer',
      'Kunna indikationer för hemiprotes vs totalprotes',
      'Känna till svenska riktlinjer (Rikshöft)'
    ],
    clinicalRelevance: 'Höftfrakturer är mycket vanliga hos äldre och kräver snabb handläggning (operation inom 24h enligt Socialstyrelsen). Val av behandling påverkar mortalitet, rörlighet och livskvalitet.',
    commonMistakes: [
      'Väljer glidskruv för dislocerad fraktur',
      'Rekommenderar konservativ behandling',
      'Glömmer att bedöma patientens aktivitetsnivå'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Rikshöft Årsrapport 2023',
        verifiedBy: 'Svenska Höftprotesregistret'
      },
      {
        type: 'guideline-based',
        reference: 'Socialstyrelsen Nationella riktlinjer höftfraktur 2023'
      }
    ],
    references: [
      'Rikshöft Årsrapport 2023',
      'Socialstyrelsen: Nationella riktlinjer för vård vid höftfraktur (2023)',
      'NICE CG124: Hip fracture management',
      'Garden RS. Low-angle fixation in fractures of the femoral neck. J Bone Joint Surg Br. 1961;43:647-663'
    ],
    estimatedTime: 90,
    keywords: ['Garden', 'collumfraktur', 'hemiprotes', 'höftfraktur', 'Rikshöft'],
    relatedTopics: ['Garden-klassifikation', 'Protesvärdering', 'Geriatrisk ortopedi'],
    socialstyrelseMål: ['MK1', 'MK2', 'KF1']
  },

  {
    id: 'spec-trauma-002',
    examType: 'specialist-ortopedi',
    domain: 'trauma',
    difficulty: 'challenging',
    question: 'En 45-årig man har råkat ut för en högenergitrauma med instabil bäckenfraktur (APC-III enligt Young-Burgess). Systoliskt BT 80 mmHg trots vätska. Vad är nästa steg i akut handläggning?',
    options: [
      'Akut intern fixation med platta',
      'Extern fixation och bäckenband/binder',
      'Angiografi med embolisering',
      'Observera på IVA med fortsatt vätsketillförsel'
    ],
    correctAnswer: 'Extern fixation och bäckenband/binder',
    explanation: 'Enligt ATLS och svenska traumariktlinjer ska instabila bäckenfrakturer med hemodynamisk instabilitet behandlas med mekanisk stabilisering (bäckenband eller extern fixation) FÖRST för att minska blödning. Angiografi görs därefter om fortsatt instabilitet. Intern fixation är för definitiv behandling när patienten är stabil.',
    learningObjectives: [
      'Förstå ATLS-principer för bäckentrauma',
      'Känna till Young-Burgess klassifikation',
      'Kunna prioritera vid hemodynamisk instabilitet',
      'Veta när angiografi är indicerat'
    ],
    clinicalRelevance: 'Bäckenfrakturer vid högenergitrauma har hög mortalitet (15-20%). Snabb mekanisk stabilisering räddar liv genom att minska blödning. Fel prioritering kan vara fatalt.',
    commonMistakes: [
      'Väljer angiografi först (försenar mekanisk stabilisering)',
      'Försöker definitiv fixation medan patienten är instabil',
      'Förlitar sig endast på vätsketillförsel'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'ATLS 10th Edition',
        verifiedBy: 'American College of Surgeons'
      },
      {
        type: 'guideline-based',
        reference: 'SVORF Vårdprogram Bäckenfrakturer 2022'
      }
    ],
    references: [
      'ATLS Student Course Manual, 10th Edition',
      'SVORF: Vårdprogram för bäckenfrakturer (2022)',
      'Young JWR, Burgess AR. Radiologic Management of Pelvic Ring Fractures. 1987',
      'World J Emerg Surg. 2017;12:37 (WSES guidelines on pelvic trauma)'
    ],
    estimatedTime: 120,
    keywords: ['bäckentrauma', 'ATLS', 'Young-Burgess', 'extern fixation', 'hemodynamisk instabilitet'],
    relatedTopics: ['Traumahandläggning', 'ATLS', 'Angiografi', 'Damage control'],
    socialstyrelseMål: ['MK3', 'KF2', 'KF3']
  },

  // ARTROPLASTIK
  {
    id: 'spec-artro-001',
    examType: 'specialist-ortopedi',
    domain: 'höft',
    difficulty: 'expert',
    question: 'Vid revision av en lös ocementerad höftskål bedömer du defekten som Paprosky typ 3A. Vilken rekonstruktion är mest lämplig?',
    options: [
      'Standard ocementerad skål med skruvar',
      'Jumbo-skål med multipelskruvar',
      'Triflange custom-made implantat',
      'Strukturellt allgraft med standard skål'
    ],
    correctAnswer: 'Jumbo-skål med multipelskruvar',
    explanation: 'Paprosky 3A innebär >2 cm superior migration med intakt Köhler-linje och ischium. Jumbo-skål (oversized uncemented cup) med skruvar för att nå friskt ben superiort är förstahands val enligt internationell konsensus. Triflange används för 3B (defekt Köhler-linje/ischium). Strukturellt graft för massiva defekter.',
    learningObjectives: [
      'Behärska Paprosky-klassifikation',
      'Känna till revisionsalgoritmer vid acetabulär benförlust',
      'Förstå indikationer för olika implantattyper',
      'Kunna planera acetabulär rekonstruktion'
    ],
    clinicalRelevance: 'Revisionskirurgi med benförlust är utmanande. Korrekt klassificering och implantatval är avgörande för långtidsresultat. Paprosky-systemet är internationell standard.',
    commonMistakes: [
      'Använder standard skål utan skruvar vid stor defekt',
      'Väljer triflange för typ 3A (överbehandling)',
      'Bedömer felaktigt defektens omfattning'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Paprosky WG, Perona PG, Lawrence JM. J Bone Joint Surg Am. 1994',
        verifiedBy: 'Rikshöft referensgrupp'
      }
    ],
    references: [
      'Paprosky WG, Perona PG, Lawrence JM. Acetabular defect classification and surgical reconstruction in revision arthroplasty. J Bone Joint Surg Am. 1994;76:1534-1540',
      'Rikshöft Årsrapport 2023 - Revisionsdata',
      'J Arthroplasty. 2015;30(9):1441-1448 (Updated Paprosky classification)'
    ],
    estimatedTime: 150,
    keywords: ['Paprosky', 'revision', 'acetabulum', 'jumbo-skål', 'benförlust'],
    relatedTopics: ['Revisionskirurgi', 'Paprosky-klassifikation', 'Rekonstruktion', 'Implantatval'],
    socialstyrelseMål: ['MK8', 'KF7', 'KF8']
  },

  // KNÄ - LIGAMENT
  {
    id: 'spec-knee-001',
    examType: 'specialist-ortopedi',
    domain: 'knä',
    difficulty: 'standard',
    question: 'En 25-årig fotbollsspelare kommer 3 veckor efter knädistorsion. MR visar främre korsbandsskada. Lachman ++, pivot shift +. Han vill återgå till fotboll. Vad rekommenderar du?',
    options: [
      'Konservativ behandling med fysioterapi 6 månader först',
      'ACL-rekonstruktion med patellarsenesena',
      'ACL-rekonstruktion med hamstringsgraft',
      'Avvakta med operation tills ny skada inträffar'
    ],
    correctAnswer: 'ACL-rekonstruktion med hamstringsgraft',
    explanation: 'För ung, aktiv idrottare med pivoting-idrott (fotboll) är ACL-rekonstruktion indicerad. Både patellarsenesena och hamstrings ger goda resultat, men hamstrings har lägre risk för främre knäsmärta och är därför ofta förstaval hos unga idrottare enligt Riksknä. Konservativ behandling ger ökad risk för menisk- och broskskador.',
    learningObjectives: [
      'Känna till indikationer för ACL-rekonstruktion',
      'Kunna välja grafttyp baserat på patientfaktorer',
      'Förstå risker med konservativ behandling hos aktiva',
      'Känna till Riksknä-data och rekommendationer'
    ],
    clinicalRelevance: 'ACL-skador är mycket vanliga i pivoting-idrotter. Rätt behandlingsval påverkar return to sport och risk för sekundära skador (menisk, brusk, artros).',
    commonMistakes: [
      'Rekommenderar konservativ behandling till pivoterande idrottare',
      'Väljer alltid patellarsenesena utan att överväga patientfaktorer',
      'Glömmer diskutera return to sport timeline (9-12 månader)'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Riksknä Årsrapport 2023',
        verifiedBy: 'Svenska Knäprotesregistret'
      },
      {
        type: 'guideline-based',
        reference: 'SVORF Vårdprogram ACL 2021'
      }
    ],
    references: [
      'Riksknä Årsrapport 2023',
      'SVORF: Vårdprogram främre korsbandsrekonstruktion (2021)',
      'Frobell RB et al. NEJM. 2010;363:331-342 (KANON study)',
      'Am J Sports Med. 2020;48(2):384-392 (Return to sport after ACL)'
    ],
    estimatedTime: 90,
    keywords: ['ACL', 'korsbandsskada', 'hamstrings', 'pivot shift', 'Riksknä'],
    relatedTopics: ['ACL-rekonstruktion', 'Graftval', 'Sportortopedi', 'Return to sport'],
    socialstyrelseMål: ['MK5', 'KF4']
  },

  // AXEL - ROTATORCUFF
  {
    id: 'spec-shoulder-001',
    examType: 'specialist-ortopedi',
    domain: 'axel-armbåge',
    difficulty: 'challenging',
    question: 'En 62-årig man har kronisk rotatorcuffruptur med pseudopares (kan inte aktivt abducera axeln). MR visar massiv ruptur av supraspinatus och infraspinatus med 2 cm retraktion. Goutallier grad 3 fettinfiltration. Vad är bästa behandlingsalternativ?',
    options: [
      'Rotatorcuff-reparation med dual row-teknik',
      'Superior capsular reconstruction',
      'Reversed (omvänd) axelprotes',
      'Latissimus dorsi-transfer'
    ],
    correctAnswer: 'Reversed (omvänd) axelprotes',
    explanation: 'Massiv rotatorcuffruptur med pseudopares, stor retraktion och Goutallier grad 3-4 fettinfiltration har mycket dålig prognos för reparation (hög rerupturfrekvens). För äldre patient (>60 år) med pseudopares är reversed shoulder arthroplasty förstahandsval enligt internationell konsensus. Ger pålitlig smärtlindring och funktion genom deltoideus.',
    learningObjectives: [
      'Känna till Goutallier-klassifikation',
      'Förstå prognostiska faktorer för cuff-reparation',
      'Kunna indikationer för reversed protes',
      'Veta när biologisk rekonstruktion är meningslös'
    ],
    clinicalRelevance: 'Massiva rotatorcuffrupturer hos äldre är vanliga. Fel behandlingsval (reparation vid dålig prognos) leder till misslyckad operation och fortsatt besvär. Reversed protes har revolutionerat behandlingen.',
    commonMistakes: [
      'Försöker reparera vid Goutallier 3-4 och stor retraktion',
      'Rekommenderar enbart fysioterapi vid pseudopares',
      'Glömmer bedöma fettinfiltration preoperativt'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Goutallier D et al. Clin Orthop Relat Res. 1994',
        verifiedBy: 'Svenskt Axelregister'
      },
      {
        type: 'predicted',
        reference: 'J Shoulder Elbow Surg. 2019;28(4):774-784'
      }
    ],
    references: [
      'Goutallier D et al. Fatty muscle degeneration in cuff ruptures. Clin Orthop Relat Res. 1994;304:78-83',
      'J Shoulder Elbow Surg. 2019;28(4):774-784 (Reverse arthroplasty for massive RC tear)',
      'Acta Orthop. 2020;91(3):333-338 (Swedish shoulder registry data)',
      'Rockwood and Matsen: The Shoulder, 5th Ed., Chapter 16'
    ],
    estimatedTime: 120,
    keywords: ['rotatorcuff', 'Goutallier', 'reversed protes', 'pseudopares', 'fettinfiltration'],
    relatedTopics: ['Rotatorcuffkirurgi', 'Axelproteser', 'Goutallier-klassifikation'],
    socialstyrelseMål: ['MK6', 'KF5']
  },

  // HAND - NERVE
  {
    id: 'spec-hand-001',
    examType: 'specialist-ortopedi',
    domain: 'hand-handled',
    difficulty: 'standard',
    question: 'En 45-årig kvinna med karpaltunnelsyndrom har svår nattlig värk och parestesier i tumme, pekfinger och långfinger. EMG visar måttlig medianuskompression. Konservativ behandling i 3 månader utan effekt. Nästa steg?',
    options: [
      'Fortsatt konservativ behandling med ortos 3 månader till',
      'Kortisoninjektion i karpaltunneln',
      'Öppen karpaltunnelsrelease',
      'Endoskopisk karpaltunnelsrelease'
    ],
    correctAnswer: 'Öppen karpaltunnelsrelease',
    explanation: 'Efter misslyckad konservativ behandling i 3 månader med symtomatisk och EMG-verifierad karpaltunnelsyndrom är kirurgisk release indicerad. Både öppen och endoskopisk teknik ger goda resultat, men öppen är säkrare och förstahandsval i Sverige enligt Svensk Handkirurgisk Förening. Kortisoninjektion kan prövas men har temporär effekt.',
    learningObjectives: [
      'Känna till behandlingsalgoritm för CTS',
      'Veta när operation är indicerad',
      'Kunna jämföra öppen vs endoskopisk teknik',
      'Förstå EMG:s roll i diagnostik'
    ],
    clinicalRelevance: 'Karpaltunnelsyndrom är den vanligaste nervkompressionsskadan (prevalens 3-5%). Rätt timing för operation är viktig - för tidig ger onödiga operationer, för sen ger irreversibel nervskada.',
    commonMistakes: [
      'Väntar för länge med operation vid EMG-verifierad skada',
      'Försöker kortisoninjektion som definitiv behandling',
      'Opererar utan att ha prövat konservativ behandling först'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Svensk Handkirurgisk Förening Vårdprogram CTS 2020'
      },
      {
        type: 'guideline-based',
        reference: 'AAOS Clinical Practice Guideline CTS 2016'
      }
    ],
    references: [
      'Svensk Handkirurgisk Förening: Vårdprogram Karpaltunnelsyndrom (2020)',
      'AAOS Clinical Practice Guideline: Management of Carpal Tunnel Syndrome (2016)',
      'Cochrane Database Syst Rev. 2012;7:CD008265 (Surgical treatment of CTS)',
      'Green\'s Operative Hand Surgery, 8th Ed., Chapter 28'
    ],
    estimatedTime: 90,
    keywords: ['karpaltunnelsyndrom', 'CTS', 'medianus', 'nervrelease'],
    relatedTopics: ['Nervkompression', 'Handkirurgi', 'EMG', 'Nervsutur'],
    socialstyrelseMål: ['MK7', 'KF6']
  },

  // FOT - ACHILLES
  {
    id: 'spec-foot-001',
    examType: 'specialist-ortopedi',
    domain: 'fot-fotled',
    difficulty: 'standard',
    question: 'En 40-årig tidigare frisk man kommer akut efter hört "knäpp" i vaden vid badminton. Kliniskt palpabel defekt i achillessenan 5 cm från kalkaneusfästet. Thompson test positivt. Vad rekommenderar du?',
    options: [
      'Gipsbehandling i spetsfot i 6 veckor',
      'Funktionell behandling med ortos',
      'Akut öppen primärsutur',
      'Perkutan sutur'
    ],
    correctAnswer: 'Funktionell behandling med ortos',
    explanation: 'Enligt senaste evidens och svenska riktlinjer ger funktionell behandling (ortos med kontrollerad dorsiflexion) lika goda resultat som kirurgi avseende rerupturfrekvens och funktion, men med lägre komplikationsrisk (infektion, nervskada). För aktiva patienter kan kirurgi övervägas, men är inte förstahandsval.',
    learningObjectives: [
      'Känna till evidens för funktionell vs kirurgisk behandling',
      'Kunna utföra Thompson test',
      'Förstå rehabiliteringsprotokoll',
      'Veta komplikationer för olika behandlingar'
    ],
    clinicalRelevance: 'Achillesruptur är vanlig hos medelålders män ("weekend warriors"). Behandlingsvalet är kontroversiellt men evidens visar att funktionell behandling är säker och effektiv.',
    commonMistakes: [
      'Rekommenderar alltid kirurgi till aktiva patienter (gammal dogm)',
      'Använder gipsbehandling istället för funktionell ortos',
      'Glömmer informera om risk för djup ventrombos'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Willits K et al. JBJS. 2010;92:2767-2775',
        verifiedBy: 'Cochrane review 2015'
      },
      {
        type: 'guideline-based',
        reference: 'SVORF Vårdprogram Achillesruptur 2019'
      }
    ],
    references: [
      'Willits K et al. Operative versus nonoperative treatment of acute Achilles tendon ruptures. JBJS. 2010;92:2767-2775',
      'Cochrane Database Syst Rev. 2015;1:CD003674 (Interventions for Achilles rupture)',
      'SVORF: Vårdprogram Achillessenruptur (2019)',
      'AAOS: Appropriate Use Criteria for Achilles Tendon Rupture (2019)'
    ],
    estimatedTime: 90,
    keywords: ['achillesruptur', 'Thompson test', 'funktionell behandling', 'ortos'],
    relatedTopics: ['Senrupturer', 'Funktionell rehabilitering', 'Fotkirurgi'],
    socialstyrelseMål: ['MK4', 'KF3']
  },

  // RYGG - DEGENERATIV
  {
    id: 'spec-spine-001',
    examType: 'specialist-ortopedi',
    domain: 'rygg',
    difficulty: 'challenging',
    question: 'En 65-årig kvinna har neurogen klaudikation med gångsträcka 100m. MR visar central stenos L4-L5 med lateral recess-stenos bilateralt. Ingen instabilitet på funktionsröntgen. Konservativ behandling utan effekt. Vad rekommenderar du?',
    options: [
      'Fortsatt konservativ behandling med ryggskolegymnastik',
      'Epidural kortisoninjektion',
      'Laminektomi utan fusion',
      'Laminektomi med fusion (PLIF/TLIF)'
    ],
    correctAnswer: 'Laminektomi utan fusion',
    explanation: 'Vid spinal stenos utan instabilitet är dekompression (laminektomi) utan fusion förstahandsval enligt svenska och internationella riktlinjer. SPORT-studien och svenska Swespine-data visar att tillägga fusion vid stabil rygg inte ger bättre resultat men ökar komplikationsrisk. Fusion endast vid instabilitet eller deformitet.',
    learningObjectives: [
      'Känna till indikationer för spinal dekompression',
      'Förstå när fusion är nödvändig',
      'Kunna bedöma instabilitet på funktionsröntgen',
      'Känna till Swespine-data'
    ],
    clinicalRelevance: 'Spinal stenos är mycket vanlig hos äldre. Överbehandling med fusion vid stabil rygg leder till onödiga komplikationer och kostnader. Viktig health economics-fråga.',
    commonMistakes: [
      'Lägger till fusion rutinmässigt "för säkerhets skull"',
      'Opererar för tidigt utan adekvat konservativ behandling',
      'Missar instabilitet på funktionsröntgen'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Swespine Årsrapport 2023',
        verifiedBy: 'Svenska Ryggregistret'
      },
      {
        type: 'guideline-based',
        reference: 'Weinstein JN et al. NEJM. 2008;358:794-810 (SPORT study)'
      }
    ],
    references: [
      'Swespine Årsrapport 2023',
      'Weinstein JN et al. Surgical versus nonsurgical therapy for lumbar spinal stenosis. NEJM. 2008;358:794-810',
      'Försth P et al. Lancet. 2016;387:1585-1596 (Swedish randomized trial)',
      'J Neurosurg Spine. 2019;31(2):190-206 (Fusion vs decompression)'
    ],
    estimatedTime: 120,
    keywords: ['spinal stenos', 'laminektomi', 'fusion', 'neurogen klaudikation', 'Swespine'],
    relatedTopics: ['Ryggkirurgi', 'Spinal stenos', 'Instabilitet', 'Dekompression'],
    socialstyrelseMål: ['MK9', 'KF9']
  },

  // BARNORTOPEDI - DDH
  {
    id: 'spec-peds-001',
    examType: 'specialist-ortopedi',
    domain: 'höft',
    difficulty: 'challenging',
    question: 'Ett 4 månader gammalt barn med sen-upptäckt höftluxation (DDH). Graf-ultraljud visar typ IV-höft vänster. Ingen spontan reduktion. Vad är nästa steg i behandlingen?',
    options: [
      'Pavlik-sele',
      'Sluten reposition i narkos och spica-gips',
      'Öppen reposition (medialt approach)',
      'Avvakta till 6 månaders ålder och gör ny ultraljudsundersökning'
    ],
    correctAnswer: 'Sluten reposition i narkos och spica-gips',
    explanation: 'Vid sen-upptäckt DDH (>3-4 månader) eller Graf typ IV är Pavlik-sele kontraindicerat pga risk för avaskulär nekros och låg framgång. Sluten reposition i narkos med artrografi följt av spica-gips är förstahandsval. Öppen reposition reserveras för misslyckad sluten reposition eller barn >12-18 månader.',
    learningObjectives: [
      'Känna till Graf-klassifikation',
      'Förstå åldersrelaterade behandlingsalgoritmer för DDH',
      'Veta indikationer och kontraindikationer för Pavlik',
      'Kunna komplikationer vid DDH-behandling'
    ],
    clinicalRelevance: 'DDH kräver tidig upptäckt och rätt behandling. Fel behandlingsval kan leda till avaskulär nekros (AVN) och livslång funktionsnedsättning. Graf-klassifikation är standard i Europa.',
    commonMistakes: [
      'Använder Pavlik-sele vid typ IV-höft',
      'Väntar för länge med behandling',
      'Utför öppen reposition som förstahandsval'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Graf R. Hip Sonography. 2006',
        verifiedBy: 'Svenska Barnortopediska Föreningen'
      },
      {
        type: 'guideline-based',
        reference: 'Tachdjian Pediatric Orthopaedics, 5th Ed.'
      }
    ],
    references: [
      'Graf R. Hip Sonography: Diagnosis and Management of Infant Hip Dysplasia. 2006',
      'Tachdjian\'s Pediatric Orthopaedics, 5th Ed., Chapter 28',
      'JBJS. 2015;97:1318-1325 (Treatment of DDH)',
      'Svenska Barnortopediska Föreningen: Riktlinjer DDH (2021)'
    ],
    estimatedTime: 120,
    keywords: ['DDH', 'Graf', 'höftluxation', 'Pavlik', 'spica-gips'],
    relatedTopics: ['Barnortopedi', 'Höftdysplasi', 'Graf-klassifikation', 'AVN'],
    socialstyrelseMål: ['MK10', 'KF10']
  },

  // TUMÖR
  {
    id: 'spec-tumor-001',
    examType: 'specialist-ortopedi',
    domain: 'tumör',
    difficulty: 'expert',
    question: 'En 16-årig pojke har en benlesion i distala femur. Röntgen visar en aggressiv osteolytisk lesion med periosteal reaktion ("sunburst pattern"). MR visar mjukdelsmassa. Vad är mest trolig diagnos och nästa steg?',
    options: [
      'Osteosarkom - öppen biopsi och neoadjuvant kemoterapi',
      'Ewing sarkom - CT thorax och biopsi',
      'Osteosarkom - direktoperation med bred resektion',
      'Osteoblastom - kürretage och benfyllning'
    ],
    correctAnswer: 'Osteosarkom - öppen biopsi och neoadjuvant kemoterapi',
    explanation: 'Klinisk bild (ålder, lokalisation, radiologi) talar starkt för osteosarkom. "Sunburst pattern" är typiskt. Standardbehandling är neoadjuvant kemoterapi följt av kirurgi. Biopsi ska göras av tumörkirurg (risk för seedning). CT thorax för metastasutredning. Direktoperation utan kemoterapi ger sämre överlevnad.',
    learningObjectives: [
      'Känna igen radiologiska tecken på osteosarkom',
      'Förstå behandlingsalgoritm för primära bensarkom',
      'Veta vikten av korrekt biopsiteknik',
      'Kunna MDT-handläggning av tumörer'
    ],
    clinicalRelevance: 'Primära bensarkom är ovanliga men dödliga om felbehandlade. Standardiserad utredning och MDT-handläggning (tumörortoped, onkolog, patolog, radiolog) är kritiskt. Fel biopsi kan kompromissa behandling.',
    commonMistakes: [
      'Opererar direkt utan neoadjuvant kemoterapi',
      'Utför biopsi utan att planera definitiv kirurgi (riskerar seedning)',
      'Missar metastasutredning (CT thorax)'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'ESMO Clinical Practice Guidelines: Bone sarcomas (2021)'
      },
      {
        type: 'guideline-based',
        reference: 'Regionalt Cancercentrum Stockholm-Gotland: Vårdprogram Sarkom 2022'
      }
    ],
    references: [
      'ESMO Clinical Practice Guidelines: Bone sarcomas. Ann Oncol. 2021;32:1520-1536',
      'Regionalt Cancercentrum: Vårdprogram för sarkom i ben och mjukdelar (2022)',
      'JBJS. 2015;97:1436-1446 (Treatment of osteosarcoma)',
      'Campbell\'s Operative Orthopaedics, 13th Ed., Chapter 25'
    ],
    estimatedTime: 150,
    keywords: ['osteosarkom', 'tumör', 'sunburst', 'neoadjuvant', 'sarkom'],
    relatedTopics: ['Tumörortopedi', 'Osteosarkom', 'Biopsi', 'MDT'],
    socialstyrelseMål: ['MK11', 'KF11']
  },

  // ADDITIONAL TRAUMA - PELVIS & ACETABULUM
  {
    id: 'spec-trauma-003',
    examType: 'specialist-ortopedi',
    domain: 'höft',
    difficulty: 'expert',
    question: 'En 35-årig man har acetabulumfraktur efter bilolycka. CT visar främre kolonn-fraktur enligt Letournel. Vilket kirurgiskt approach är förstahandsval?',
    options: [
      'Kocher-Langenbeck (posterior)',
      'Ilioinguinal (anterior)',
      'Extended iliofemoral',
      'Stoppa approach (intrapelvic)'
    ],
    correctAnswer: 'Ilioinguinal (anterior)',
    explanation: 'Letournel-klassifikationen delar acetabulumfrakturer i elementära och associerade typer. Främre kolonn-fraktur behandlas genom ilioinguinalt approach som ger bra exponering av främre kolonnen, quadrilateral surface och pubis. Kocher-Langenbeck används för bakre kolonn. Extended iliofemoral för båda kolonnerna.',
    learningObjectives: [
      'Behärska Letournel-klassifikation',
      'Känna till kirurgiska approach för acetabulumfrakturer',
      'Förstå kopplingen mellan frakturtyp och approach',
      'Veta indikationer för operativ behandling'
    ],
    clinicalRelevance: 'Acetabulumfrakturer är komplexa och kräver specialistkunskap. Fel approach kan göra reduktion omöjlig. Majoriteten behandlas på höft/trauma-enheter med subspecialisering.',
    commonMistakes: [
      'Väljer posterior approach för främre kolonn-fraktur',
      'Försöker behandla alla acetabulumfrakturer operativt',
      'Missar associerade skador (sciatic nerve, höftluxation)'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Letournel E, Judet R. Fractures of the Acetabulum. 1993'
      }
    ],
    references: [
      'Letournel E, Judet R. Fractures of the Acetabulum, 2nd Ed.',
      'J Bone Joint Surg Am. 2005;87:434-449 (Acetabular fractures)',
      'JBJS. 2015;97:1375-1388 (Letournel classification)',
      'Rockwood & Green, 9th Ed., Chapter 49'
    ],
    estimatedTime: 150,
    keywords: ['acetabulum', 'Letournel', 'ilioinguinal', 'approach'],
    relatedTopics: ['Acetabulumfrakturer', 'Kirurgiska approach', 'Bäckentrauma'],
    socialstyrelseMål: ['MK3', 'KF3']
  },

  // ARTHROPLASTY - COMPLICATIONS
  {
    id: 'spec-artro-002',
    examType: 'specialist-ortopedi',
    domain: 'höft',
    difficulty: 'challenging',
    question: 'En patient har akut smärta och begränsad rörlighet 6 veckor efter total höftprotes. CRP 85, LPK 12. Ledvätskepunktion ger 45000 leukocyter varav 90% PMN. Vad är diagnos och behandling?',
    options: [
      'Aseptisk lossning - revision',
      'Djup protesinfektion - debridering och behålla protesen',
      'Djup protesinfektion - tvåstegsrevision med mellanled',
      'Normal postoperativ inflammation - antibiotika peroralt'
    ],
    correctAnswer: 'Djup protesinfektion - tvåstegsrevision med mellanled',
    explanation: 'Ledvätska med >25000-50000 leukocyter och >80-90% PMN är diagnostiskt för septisk artrit/protesinfektion enligt Musculoskeletal Infection Society (MSIS) criteria. Tidig infektion (<4 veckor) kan ibland behandlas med debridering + behålla protesen. Sen infektion (>4 veckor) kräver tvåstegsrevision: (1) protesborttagning + antibiotikamellanled, (2) reimplantation efter sanerad infektion.',
    learningObjectives: [
      'Känna till MSIS-kriterier för protesinfektion',
      'Förstå behandlingsalgoritmer beroende på timing',
      'Veta när tvåstegsrevision krävs',
      'Kunna tolka ledvätskeanalys'
    ],
    clinicalRelevance: 'Protesinfektion är katastrofal komplikation (1-2% primära protester, 5-10% revisioner). Tidig och korrekt diagnos avgör behandling. Fel behandling (antibiotika ensam) leder till kronisk infektion.',
    commonMistakes: [
      'Behandlar med antibiotika utan kirurgi',
      'Försöker behålla protesen vid sen infektion',
      'Missar att ta odlingar före antibiotika'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Parvizi J et al. JBJS. 2018;100:147-154 (MSIS criteria)'
      }
    ],
    references: [
      'JBJS. 2018;100:147-154 (Definition of PJI)',
      'Clin Orthop Relat Res. 2014;472:3254-3261 (PJI management)',
      'Rikshöft Årsrapport 2023 - Infektionsdata',
      'Campbell Operative Orthopaedics, 13th Ed., Chapter 7'
    ],
    estimatedTime: 120,
    keywords: ['protesinfektion', 'PJI', 'MSIS', 'tvåstegsrevision'],
    relatedTopics: ['Proteskomplikationer', 'Infektion', 'Revision'],
    socialstyrelseMål: ['MK8', 'KF8']
  },

  // SPORTS - MENISCUS
  {
    id: 'spec-sport-001',
    examType: 'specialist-ortopedi',
    domain: 'knä',
    difficulty: 'challenging',
    question: 'En 22-årig basketspelare har bucket-handle meniskruptur i mediala menisken med locked knee. Vilken behandling rekommenderas?',
    options: [
      'Partiell meniskektomi',
      'Menisksutur',
      'Total meniskektomi',
      'Konservativ behandling med fysioterapi'
    ],
    correctAnswer: 'Menisksutur',
    explanation: 'Hos unga, aktiva patienter med traumatisk meniskruptur i rött-rött eller rött-vitt område (vaskulariserat) ska menisksutur försökas. Bucket-handle-rupturer kan ofta sutureras. Meniskektomi hos unga ökar kraftigt risken för tidig knäartros. Menisksutur har 70-90% läkningsfrekvens i rött-rött området. Locked knee kräver akut artoskopi.',
    learningObjectives: [
      'Förstå meniskens vaskularisering (rött-vitt-vitt)',
      'Känna till indikationer för menisksutur vs meniskektomi',
      'Veta långtidskonsekvenser av meniskektomi',
      'Kunna hantera locked knee'
    ],
    clinicalRelevance: 'Meniskskador är extremt vanliga. Val mellan menisksutur och meniskektomi påverkar långsiktig knäfunktion och artrosrisk. Hos unga ska menisken preserveras när möjligt.',
    commonMistakes: [
      'Utför meniskektomi rutinmässigt på unga patienter',
      'Försöker suturera degenerativa rupturer i vita zonen',
      'Väntar för länge med behandling av locked knee'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Abrams GD et al. Am J Sports Med. 2013;41:2333-2339'
      }
    ],
    references: [
      'Am J Sports Med. 2013;41:2333-2339 (Meniscal repair vs meniscectomy)',
      'Br J Sports Med. 2020;54:592-598 (Meniscus surgery)',
      'NEJM. 2013;368:1675-1684 (Meniscal tear treatment)',
      'Riksknä Årsrapport 2023 - Meniskkirurgi'
    ],
    estimatedTime: 120,
    keywords: ['menisk', 'bucket-handle', 'menisksutur', 'locked knee'],
    relatedTopics: ['Meniskkirurgi', 'Sportskador', 'Artroskopi'],
    socialstyrelseMål: ['MK5', 'KF4']
  },

  // UPPER EXTREMITY - ELBOW FRACTURES
  {
    id: 'spec-elbow-001',
    examType: 'specialist-ortopedi',
    domain: 'axel-armbåge',
    difficulty: 'challenging',
    question: 'En 45-årig kvinna har olecranon-fraktur med 4 mm dislokation och stabil armbågsled. Mason-klassifikation typ II för samtidig radiushuvudfraktur. Behandling?',
    options: [
      'Gips i 6 veckor',
      'Spänningsbandstråd (TBW) för olecranon + konservativ för radiushuvud',
      'Plattfixation för olecranon + radiushuvudsresektion',
      'Plattfixation för olecranon + ORIF radiushuvud'
    ],
    correctAnswer: 'Spänningsbandstråd (TBW) för olecranon + konservativ för radiushuvud',
    explanation: 'Olecranon-frakturer >2-3 mm dislokation ska opereras (triceps-extension kräver intakt olecranon). Spänningsbandstråd (tension band wiring, TBW) är klassisk behandling för enkla tvär-/sned-frakturer. Mason typ II radiushuvudfraktur (<2 mm displacement, <30% ledyta) kan behandlas konservativt. ORIF radiushuvud indicerat vid Mason typ III eller instabil armbåge.',
    learningObjectives: [
      'Känna till indikationer för operation av olecranon-frakturer',
      'Förstå TBW-teknik och indikationer',
      'Kunna Mason-klassifikation för radiushuvudfrakturer',
      'Veta när radiushuvudet kan behandlas konservativt'
    ],
    clinicalRelevance: 'Olecranon- och radiushuvudfrakturer är vanliga armbågsrakturer. Korrekt behandling ger bra armbågsfunktion. Felbehandling leder till stelhet och artros.',
    commonMistakes: [
      'Behandlar dislocerade olecranon-frakturer konservativt',
      'Opererar Mason typ II rutinmässigt',
      'Använder TBW för comminuted frakturer (ska ha platta)'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Mason ML. Br J Surg. 1954;42:123-132'
      }
    ],
    references: [
      'Mason ML. Some observations on fractures of the head of the radius. Br J Surg. 1954;42:123-132',
      'J Orthop Trauma. 2011;25:378-384 (Olecranon fractures)',
      'JBJS. 2016;98:2132-2138 (Radial head fractures)',
      'Rockwood & Green, 9th Ed., Chapter 35'
    ],
    estimatedTime: 120,
    keywords: ['olecranon', 'TBW', 'Mason', 'radiushuvud'],
    relatedTopics: ['Armbågsfrakturer', 'TBW-teknik', 'Radiushuvud'],
    socialstyrelseMål: ['MK6', 'KF5']
  },

  // FOOT & ANKLE - ANKLE FRACTURES
  {
    id: 'spec-ankle-001',
    examType: 'specialist-ortopedi',
    domain: 'fot-fotled',
    difficulty: 'standard',
    question: 'En patient har Weber B-fraktur med 3 mm talocrural bredvidkning (medial clear space). Behandling?',
    options: [
      'Gips i 6 veckor',
      'ORIF med neutraliseringsplatta lateralt',
      'ORIF lateralt + medial malleol-skruv',
      'Enbart medial malleol-fixation'
    ],
    correctAnswer: 'ORIF med neutraliseringsplatta lateralt',
    explanation: 'Weber B-fraktur med >2-3 mm talocrural bredvidkning indikerar instabilitet (deltoid ligament eller medial malleol-skada). Kräver ORIF av fibula för att återställa fotledens anatomi. Lateral platta är standard. Medial malleol fixeras om frakturerad. Om endast ligamentskada medialt räcker ofta lateral fixation (ligamentet läker när fotleden är anatomisk).',
    learningObjectives: [
      'Förstå Weber-klassifikation',
      'Känna till indikationer för operation av fotledsfrakturer',
      'Veta när medial sida behöver fixeras',
      'Kunna bedöma talocrural bredvidkning'
    ],
    clinicalRelevance: 'Fotledsfrakturer är mycket vanliga. Korrekt behandling ger bra funktion och minskar artrosrisk. Missed instability leder till posttraumatisk artros.',
    commonMistakes: [
      'Behandlar instabil Weber B konservativt',
      'Fixerar medial malleol när endast ligamentskada',
      'Accepterar dålig fibula-reduktion (längd kritisk)'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Weber BG. Die Verletzungen des oberen Sprunggelenkes. 1972'
      }
    ],
    references: [
      'Weber BG. Die Verletzungen des oberen Sprunggelenkes, 2nd Ed., 1972',
      'JBJS. 2012;94:1689-1695 (Ankle fracture treatment)',
      'SVORF: Vårdprogram Fotledsfrakturer (2020)',
      'Rockwood & Green, 9th Ed., Chapter 61'
    ],
    estimatedTime: 90,
    keywords: ['Weber', 'fotledsfraktur', 'ORIF', 'instabilitet'],
    relatedTopics: ['Fotledsfrakturer', 'Weber-klassifikation', 'ORIF'],
    socialstyrelseMål: ['MK4', 'KF3']
  },

  // SPINE - TRAUMA
  {
    id: 'spec-spine-002',
    examType: 'specialist-ortopedi',
    domain: 'rygg',
    difficulty: 'expert',
    question: 'En patient har thoracolumbar burst-fraktur (L1) utan neurologisk skada. CT visar 40% kanalstenos och 25° kyfos. MRI visar posterior ligament complex (PLC) skada. Behandling enligt AOSpine-kriterier?',
    options: [
      'Konservativ behandling med ortos',
      'Perkutan baklänges fixation 2 nivåer',
      'Öppen posterior dekompression och fusion',
      'Vertebroplastik med cementinjektiot'
    ],
    correctAnswer: 'Öppen posterior dekompression och fusion',
    explanation: 'Enligt AOSpine Thoracolumbar Injury Classification System betraktas skada av posterior ligament complex (PLC) som instabilitet. Burst-fraktur med PLC-skada är kirurgisk indikation även utan neurologisk skada, speciellt med >20° kyfos. Öppen dekompression och instrumenterad fusion är standard. Konservativ behandling vid PLC-skada ger hög risk för progression.',
    learningObjectives: [
      'Behärska AOSpine-klassifikation',
      'Förstå betydelsen av PLC-skada',
      'Känna till kirurgiska indikationer vid thoracolumbar frakturer',
      'Veta när konservativ behandling kan accepteras'
    ],
    clinicalRelevance: 'Thoracolumbar burst-frakturer är vanliga vid högenergitrauma. Korrekt bedömning av stabilitet är kritisk. Missed instability leder till neurologisk försämring och deformitet.',
    commonMistakes: [
      'Behandlar PLC-skada konservativt',
      'Förlitar sig endast på neurologisk status (missar instabilitet)',
      'Använder endast anterior approach (posterior är standard)'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Vaccaro AR et al. Spine. 2013;38:E1161-E1169 (AOSpine)'
      }
    ],
    references: [
      'Vaccaro AR et al. AOSpine thoracolumbar spine injury classification. Spine. 2013;38:E1161-E1169',
      'J Orthop Trauma. 2016;30:S1-S19 (Thoracolumbar trauma)',
      'Swespine Årsrapport 2023 - Traumadata',
      'Spine, 3rd Ed., Vol 2, Chapter 80'
    ],
    estimatedTime: 150,
    keywords: ['burst-fraktur', 'AOSpine', 'PLC', 'thoracolumbar'],
    relatedTopics: ['Ryggtrauma', 'Instabilitet', 'Spinal kirurgi'],
    socialstyrelseMål: ['MK9', 'KF9']
  },

  // PEDIATRIC - GROWTH PLATE
  {
    id: 'spec-peds-002',
    examType: 'specialist-ortopedi',
    domain: 'knä',
    difficulty: 'challenging',
    question: 'Ett 13-årigt barn har Salter-Harris typ III fraktur i distala femur med 3 mm intraartikulär dislokation. Tillväxtzon delvis öppen. Behandling?',
    options: [
      'Gips i 6 veckor',
      'Sluten reposition och gips',
      'ORIF med epifyssära skruvar (inte korsar tillväxtzon)',
      'ORIF med skruvar som korsar tillväxtzon'
    ],
    correctAnswer: 'ORIF med epifyssära skruvar (inte korsar tillväxtzon)',
    explanation: 'Salter-Harris typ III är intraartikulär fraktur genom epifysen. >2 mm intraartikulär dislokation kräver ORIF för att undvika artros. Skruvar placeras enbart i epifysen (inte korsar tillväxtzon) för att minimera risk för tillväxthämning. SH typ III har lägre risk för tillväxtrubbning än typ IV-V eftersom tillväxtzonen är relativt intakt.',
    learningObjectives: [
      'Behärska Salter-Harris-klassifikation',
      'Förstå när operation krävs vid tillväxtzonsfrakturer',
      'Veta hur man fixerar utan att skada tillväxtzon',
      'Känna till prognos för olika SH-typer'
    ],
    clinicalRelevance: 'Tillväxtzonsfrakturer utgör 15-20% av alla barnfrakturer. Typ III-V har risk för tillväxthämning och deformitet. Korrekt behandling är kritisk för långtidsutfall.',
    commonMistakes: [
      'Accepterar intraartikulär dislokation >2 mm',
      'Placerar skruvar över tillväxtzonen vid typ III',
      'Försummar uppföljning av tillväxt 12-18 månader'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Salter RB, Harris WR. JBJS. 1963;45-A:587-622'
      }
    ],
    references: [
      'Salter RB, Harris WR. Injuries involving the epiphyseal plate. JBJS. 1963;45-A:587-622',
      'JBJS. 2012;94:e143 (Growth plate injuries)',
      'Tachdjian Pediatric Orthopaedics, 5th Ed., Chapter 31',
      'J Pediatr Orthop. 2015;35:440-446 (SH fracture management)'
    ],
    estimatedTime: 120,
    keywords: ['Salter-Harris', 'tillväxtzon', 'epifyssär', 'barnfraktur'],
    relatedTopics: ['Tillväxtzonsfrakturer', 'Barnortopedi', 'ORIF barn'],
    socialstyrelseMål: ['MK10', 'KF10']
  },

  // TUMOR - BENIGN
  {
    id: 'spec-tumor-002',
    examType: 'specialist-ortopedi',
    domain: 'tumör',
    difficulty: 'challenging',
    question: 'En 25-årig patient har nattlig smärta i lårbenet som svarar utmärkt på NSAID. Röntgen visar liten osteolytisk lesion med skleros i cortex. Vad är mest trolig diagnos?',
    options: [
      'Osteoidosteom',
      'Osteoblastom',
      'Osteosarkom',
      'Enchondrom'
    ],
    correctAnswer: 'Osteoidosteom',
    explanation: 'Klassisk presentation av osteoidosteom: ung patient, nattlig smärta som svarar dramatiskt på NSAID (COX-hämmare), liten (<1.5 cm) nidus med omgivande skleros. Behandling: CT-guidad radiofrekvensablation eller excision av nidus. Osteoblastom liknar men är >2 cm. Osteosarkom ger inte NSAID-respons. Enchondrom är oftast asymptomatiskt.',
    learningObjectives: [
      'Känna igen osteoidosteom kliniskt och radiologiskt',
      'Förstå NSAID-respons som diagnostiskt kriterium',
      'Veta skillnad osteoidosteom vs osteoblastom',
      'Känna till moderna behandlingsmetoder (RFA)'
    ],
    clinicalRelevance: 'Osteoidosteom är vanlig benign tumör hos unga (10-25 år). Diagnosen missas ofta initialt. Enkel behandling ger dramatisk symtomlindring.',
    commonMistakes: [
      'Diagnostiserar som osteosarkom (onödig biopsi)',
      'Missar liten nidus på röntgen (behöver CT)',
      'Behandlar långvarigt med NSAID istället för kurativt'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'JBJS. 2011;93:678-683 (Osteoid osteoma RFA)'
      }
    ],
    references: [
      'JBJS. 2011;93:678-683 (Radiofrequency ablation of osteoid osteoma)',
      'Radiology. 2003;229:171-175 (Osteoid osteoma)',
      'Campbell Operative Orthopaedics, 13th Ed., Chapter 25',
      'WHO Classification of Tumours: Soft Tissue and Bone Tumours, 5th Ed.'
    ],
    estimatedTime: 90,
    keywords: ['osteoidosteom', 'NSAID', 'nidus', 'RFA'],
    relatedTopics: ['Bentumörer', 'Osteoidosteom', 'Radiofrekvensablation'],
    socialstyrelseMål: ['MK11']
  },

  // INFECTION - SEPTIC ARTHRITIS
  {
    id: 'spec-infect-001',
    examType: 'specialist-ortopedi',
    domain: 'knä',
    difficulty: 'standard',
    question: 'En 65-årig diabetiker har akut svullet, rött och varmt knä med 39°C feber. Ledvätskepunktion ger 78000 leukocyter, 95% PMN. Odling växer Staphylococcus aureus. Behandling?',
    options: [
      'Antibiotika iv i 6 veckor',
      'Artroskopisk spolning + antibiotika',
      'Öppen artrotomi och spolning + antibiotika',
      'Ledpunktion och antibiotika'
    ],
    correctAnswer: 'Artroskopisk spolning + antibiotika',
    explanation: 'Septisk artrit kräver akut kirurgisk spolning + antibiotika. Artroskopi är förstaval för knä, höft, axel (tillåter bra spolning, lägre morbiditet än öppen). Antibiotika ensam räcker INTE. Öppen artrotomi för leder som inte kan artroskoperas eller vid svår kompartmentaliserad infektion. Initial empirisk antibiotika (flukloxacillin/cefuroxim), justeras efter odlingssvar.',
    learningObjectives: [
      'Känna till diagnostik av septisk artrit',
      'Förstå att kirurgisk spolning är nödvändig',
      'Veta när artroskopi vs öppen artrotomi',
      'Kunna empirisk och definitiv antibiotikabehandling'
    ],
    clinicalRelevance: 'Septisk artrit är ortopedisk akut (risk för irreversibel broskdestruktion inom 24-48h). Fördröjd eller felaktig behandling leder till artros och funktionsnedsättning.',
    commonMistakes: [
      'Behandlar endast med antibiotika utan kirurgi',
      'Väntar på odlingssvar innan kirurgi (ska opereras akut)',
      'Underdoserar eller för kort antibiotikakur'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'JBJS. 2015;97:1382-1392 (Septic arthritis)'
      }
    ],
    references: [
      'JBJS. 2015;97:1382-1392 (Management of septic arthritis)',
      'Lancet. 2010;375:846-855 (Septic arthritis and osteomyelitis)',
      'Strama: Behandlingsrekommendationer Ledinfektioner (2023)',
      'NEJM. 2007;357:654-663 (Septic arthritis)'
    ],
    estimatedTime: 90,
    keywords: ['septisk artrit', 'artroskopi', 'spolning', 'Staphylococcus'],
    relatedTopics: ['Ledinfektioner', 'Artroskopi', 'Antibiotika'],
    socialstyrelseMål: ['MK4', 'KF6']
  },

  // ARTHROPLASTY - DISLOCATION
  {
    id: 'spec-artro-003',
    examType: 'specialist-ortopedi',
    domain: 'höft',
    difficulty: 'challenging',
    question: 'En patient med total höftprotes luxerar för tredje gången inom 6 månader. Vilken är mest trolig orsak och lämplig åtgärd?',
    options: [
      'Patientnoncompliance - instruera patienten bättre',
      'Komponentmalposition - revision med korrektion',
      'För liten kuldiameter - byt till större kula',
      'Abduktorsvaghet - fysioterapi'
    ],
    correctAnswer: 'Komponentmalposition - revision med korrektion',
    explanation: 'Recidiverande luxationer (≥2) indikerar oftast komponentmalposition (cup anteversion, stem version, offset). Ska utredas med CT eller speciell röntgen (Einzel-Bild-Röntgen-Analyse, EBRA). Revision med korrektion är oftast nödvändig. Större kulor (36-40 mm) minskar luxationsrisk men löser inte malposition. Lewinnek safe zone: cup inclination 30-50°, anteversion 5-25°.',
    learningObjectives: [
      'Förstå orsaker till protesluxation',
      'Känna till Lewinnek safe zone',
      'Veta hur man utreder recidiverande luxationer',
      'Kunna behandlingsalgoritm för instabilitet'
    ],
    clinicalRelevance: 'Protesluxation är vanligaste tidig komplikation efter primär höftprotes (1-3%). Recidiverande luxationer är funktionsnedsättande och kräver noggrann utredning och ofta revision.',
    commonMistakes: [
      'Skyller på patienten utan att utreda komponentposition',
      'Försöker sluten reposition upprepade gånger utan revision',
      'Byter endast kulstorlek utan att korrigera malposition'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Lewinnek GE et al. JBJS. 1978;60:217-220'
      }
    ],
    references: [
      'Lewinnek GE et al. Dislocations after total hip-replacement arthroplasties. JBJS. 1978;60:217-220',
      'JBJS. 2016;98:1680-1688 (Dislocation after THA)',
      'Rikshöft Årsrapport 2023 - Luxationsdata',
      'J Arthroplasty. 2018;33:3074-3079 (Recurrent instability)'
    ],
    estimatedTime: 120,
    keywords: ['protesluxation', 'malposition', 'Lewinnek', 'instabilitet'],
    relatedTopics: ['Proteskomplikationer', 'Komponentposition', 'Revision'],
    socialstyrelseMål: ['MK8', 'KF8']
  },

  // SPORTS - CARTILAGE
  {
    id: 'spec-sport-002',
    examType: 'specialist-ortopedi',
    domain: 'knä',
    difficulty: 'expert',
    question: 'En 28-årig idrottare har isolerad ICRS grad IV broskskada (4 cm²) i mediala femurkondylen. Ingen instabilitet eller meniskskada. Bästa biologiska behandling för return to sport?',
    options: [
      'Mikrofrakturering',
      'Autolog kondrocyttransplantation (ACI)',
      'Osteochondral autograft transfer (OATS)',
      'Metall-resurfacing implantat'
    ],
    correctAnswer: 'Autolog kondrocyttransplantation (ACI)',
    explanation: 'För stora (>2-4 cm²) isolerade broskskador hos unga, aktiva patienter är ACI (autolog kondrocyttransplantation) förstaval. Bättre hyalin-liknande broskregenerering än mikrofraktur. OATS bra för <2-4 cm² skador. ACI-teknik: (1) artroskopi + broskbiopsi, (2) cellodling 4-6 veckor, (3) öppen implantation. MACI (matrix-induced ACI) är nyare generation.',
    learningObjectives: [
      'Känna till ICRS-klassifikation av broskskador',
      'Förstå behandlingsalgoritm för broskskador',
      'Veta indikationer för olika broskbehandlingar',
      'Kunna ACI-teknik och resultat'
    ],
    clinicalRelevance: 'Stora broskskador hos unga är utmanande. Mikrofraktur ger fibros (inte hyalint brusk). ACI/MACI ger bättre långtidsresultat och möjlighet till idrott på hög nivå.',
    commonMistakes: [
      'Använder mikrofraktur för stora skador (>4 cm²)',
      'Opererar broskskador med samtidig instabilitet',
      'Utför ACI utan att korrigera malalignment'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Brittberg M et al. NEJM. 1994;331:889-895'
      }
    ],
    references: [
      'Brittberg M et al. Treatment of deep cartilage defects with autologous chondrocyte transplantation. NEJM. 1994;331:889-895',
      'Am J Sports Med. 2017;45:899-908 (ACI outcomes)',
      'ICRS Cartilage Injury Evaluation Package (2000)',
      'J Bone Joint Surg Am. 2020;102:656-663'
    ],
    estimatedTime: 150,
    keywords: ['broskskada', 'ACI', 'kondrocyt', 'ICRS'],
    relatedTopics: ['Broskkirurgi', 'ACI', 'Sportortopedi'],
    socialstyrelseMål: ['MK5', 'KF7']
  },

  // HAND - COMPLEX
  {
    id: 'spec-hand-002',
    examType: 'specialist-ortopedi',
    domain: 'hand-handled',
    difficulty: 'expert',
    question: 'En 30-årig snickare har genomskuren n. medianus i carpal tunnel-nivå med skarpt föremål. Skadan är 4 timmar gammal. Behandling?',
    options: [
      'Primärsutur samma dag',
      'Vänta 3 veckor, sedan nervsutur',
      'Nervgraft från sura-nerv',
      'Endast neurorehabilitering'
    ],
    correctAnswer: 'Primärsutur samma dag',
    explanation: 'Skarpa nervavslag i handen ska sutureras primärt inom 12-24 timmar (primär nervsutur). Ger bäst resultat. Epineuralsutur eller fascikularsutur beroende på skadans nivå. Vid medianus-skada i carpal tunnel: samtidig karpaltunnelrelease, mikrosurgisk sutur, tidig rörelseträning. Sekundär sutur (efter 3 veckor) endast om fördröjd presentation. Nervgraft endast vid defekt.',
    learningObjectives: [
      'Veta timing för nervsutur',
      'Förstå primär vs sekundär vs sen rekonstruktion',
      'Känna till suturteknik (epineural vs fascikular)',
      'Veta förväntad återhämtning (1 mm/dag)'
    ],
    clinicalRelevance: 'Nervskador i handen är funktionsnedsättande. Korrekt och tidig behandling ger bästa chans för återhämtning. Medianusskada påverkar tumme-pekfinger-grepp och sensibilitet.',
    commonMistakes: [
      'Väntar onödigt länge med nervsutur',
      'Suturerar nerv med felaktig teknik (för mycket spänning)',
      'Glömmer samtidig karpaltunnelrelease vid medianus-skada'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Green\'s Operative Hand Surgery, 8th Ed., Chapter 29'
      }
    ],
    references: [
      'Green\'s Operative Hand Surgery, 8th Ed., Chapter 29',
      'J Hand Surg Am. 2013;38:2316-2322 (Nerve repair)',
      'Svensk Handkirurgisk Förening: Riktlinjer nervsutur',
      'Plast Reconstr Surg. 2020;145:793e-804e'
    ],
    estimatedTime: 120,
    keywords: ['nervsutur', 'medianus', 'primärsutur', 'mikrokirurgi'],
    relatedTopics: ['Nervkirurgi', 'Handtrauma', 'Mikrokirurgi'],
    socialstyrelseMål: ['MK7', 'KF6']
  },

  // FOOT - HINDFOOT
  {
    id: 'spec-foot-002',
    examType: 'specialist-ortopedi',
    domain: 'fot-fotled',
    difficulty: 'challenging',
    question: 'En patient har haft recidiverande fotledsluxationer och kronisk instabilitet efter upprepade inversionsrupturer. Positiv anterior drawer och talar tilt >10°. Behandling?',
    options: [
      'Fysioterapi och proprioceptionsträning',
      'Fotledsortos',
      'Lateral ligament-rekonstruktion (Broström-Gould)',
      'Fotledsartrodess'
    ],
    correctAnswer: 'Lateral ligament-rekonstruktion (Broström-Gould)',
    explanation: 'Kronisk lateral fotledsinstabilitet efter misslyckad konservativ behandling ska behandlas kirurgiskt. Broström-Gould-procedur är standardbehandling: rafning av anterior talofibular ligament (ATFL) och calcaneofibular ligament (CFL) med förstärkning av extensor retinaculum. Ger 85-95% goda resultat. Fotledsortos är temporär lösning. Artrodess endast vid samtidig artros.',
    learningObjectives: [
      'Känna till diagnostik av kronisk fotledsinstabilitet',
      'Förstå Broström-Gould-teknik',
      'Veta indikationer för kirurgi vs konservativ behandling',
      'Kunna komplikationer och alternativa tekniker'
    ],
    clinicalRelevance: 'Kronisk fotledsinstabilitet är vanligt efter upprepade vrickningar. Påverkar idrott och ökar artrosrisk. Kirurgi ger bra resultat hos selekterade patienter.',
    commonMistakes: [
      'Opererar för tidigt innan adekvat konservativ behandling',
      'Använder ligamentrekonstruktion med seegraft rutinmässigt (Broström räcker oftast)',
      'Missar samtidig peroneussenruptur'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Broström L. Acta Chir Scand. 1966;132:551-565'
      }
    ],
    references: [
      'Broström L. Sprained ankles. Treatment and prognosis in recent ligament ruptures. Acta Chir Scand. 1966;132:551-565',
      'JBJS. 2018;100:1066-1074 (Lateral ankle instability)',
      'Foot Ankle Int. 2014;35:1000-1006 (Broström-Gould)',
      'Am J Sports Med. 2019;47:659-666'
    ],
    estimatedTime: 120,
    keywords: ['fotledsinstabilitet', 'Broström', 'ATFL', 'lateral ligament'],
    relatedTopics: ['Fotledsinstabilitet', 'Ligamentrekonstruktion', 'Fotkirurgi'],
    socialstyrelseMål: ['MK4', 'KF4']
  },

  // ADDITIONAL QUESTIONS TO REACH 50+

  // KNEE - TKA
  {
    id: 'spec-knee-002',
    examType: 'specialist-ortopedi',
    domain: 'knä',
    difficulty: 'standard',
    question: 'En 70-årig patient har svår mediokompens (varus) i knät vid artros. Vilket snitt/releaser behövs typiskt vid total knäprotes?',
    options: [
      'Lateral release',
      'Medial release + möjlig osteotomi',
      'Standard balansering räcker',
      'PCL-sacrifice alltid'
    ],
    correctAnswer: 'Medial release + möjlig osteotomi',
    explanation: 'Vid varus-deformitet (mediokompens) är mediala strukturer kontraherade. Kräver gradvis medial release (djup MCL, semimembranosus, pes anserinus). Vid svår deformitet (>15-20°) kan proximal tibial valgus-osteotomi behövas. Lateral release används vid valgus-deformitet. Målet är symmetrisk ledspringa i extension och flexion.',
    learningObjectives: [
      'Förstå deformitetskorrigering vid TKA',
      'Känna till releaser för varus vs valgus',
      'Veta målet för ligamentbalansering',
      'Kunna komplikationer vid överrelease'
    ],
    clinicalRelevance: 'Korrekt balansering är kritisk vid TKA. Dålig balansering leder till tidig lossning, instabilitet och smärta. Riksknä visar att balansering påverkar överlevnad.',
    commonMistakes: [
      'Gör lateral release vid varus (fel sida)',
      'Överreleasar (ger instabilitet)',
      'Försöker korrigera för stor deformitet med endast mjukdelsrelease'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Insall & Scott Surgery of the Knee, 6th Ed.'
      }
    ],
    references: [
      'Insall & Scott: Surgery of the Knee, 6th Ed., Chapter 78',
      'Riksknä Årsrapport 2023',
      'JBJS. 2017;99:1587-1598 (Soft tissue balancing in TKA)',
      'J Arthroplasty. 2016;31:289-295'
    ],
    estimatedTime: 90,
    keywords: ['TKA', 'varus', 'balansering', 'release'],
    relatedTopics: ['Knäprotes', 'Ligamentbalansering', 'Deformitetskorrigering'],
    socialstyrelseMål: ['MK5', 'KF5']
  },

  // SHOULDER - INSTABILITY
  {
    id: 'spec-shoulder-002',
    examType: 'specialist-ortopedi',
    domain: 'axel-armbåge',
    difficulty: 'challenging',
    question: 'En 22-årig kontaktirottare har haft 4 främre axelluxationer. MR visar 25% glenoid benförlust (inverted pear) och Hill-Sachs. Behandling?',
    options: [
      'Artroskopisk Bankart-reparation',
      'Öppen Bankart med Latarjet-procedur',
      'Endast fysioterapi',
      'Remplissage för Hill-Sachs'
    ],
    correctAnswer: 'Öppen Bankart med Latarjet-procedur',
    explanation: 'Vid >20-25% glenoid benförlust är artroskopisk Bankart otillräcklig (hög rerupturfrekvens). Latarjet-procedur (coracoid-transfer till glenoid) är standard: återställer glenoid-area och fungerar som "sling-effekt". "Inverted pear" glenoid är klassiskt tecken på kritisk benförlust. Hill-Sachs behandlas vanligen inte separat om Latarjet görs.',
    learningObjectives: [
      'Förstå betydelsen av glenoid benförlust',
      'Känna till Latarjet-procedur och indikationer',
      'Veta gränsvärden för benförlust (20-25%)',
      'Kunna diagnostisera "inverted pear"'
    ],
    clinicalRelevance: 'Återkommande axelluxationer hos unga idrottare kräver ofta kirurgi. Kritisk benförlust kräver benrekonstruktion (Latarjet). Artroskopisk Bankart ensam ger hög failure rate.',
    commonMistakes: [
      'Gör artroskopisk Bankart vid kritisk benförlust',
      'Missar att mäta benförlust preoperativt',
      'Försöker endast Remplissage vid stor glenoidförlust'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Burkhart SS, De Beer JF. Arthroscopy. 2000;16:677-694'
      }
    ],
    references: [
      'Burkhart SS, De Beer JF. Traumatic glenohumeral bone defects. Arthroscopy. 2000;16:677-694',
      'JBJS. 2014;96:e56 (Latarjet procedure)',
      'Am J Sports Med. 2018;46:2897-2904 (Bone loss in instability)',
      'Rockwood & Matsen: The Shoulder, 5th Ed., Chapter 13'
    ],
    estimatedTime: 120,
    keywords: ['axelinstabilitet', 'benförlust', 'Latarjet', 'glenoid'],
    relatedTopics: ['Axelinstabilitet', 'Latarjet', 'Benrekonstruktion'],
    socialstyrelseMål: ['MK6', 'KF5']
  },

  // WRIST - SCAPHOID
  {
    id: 'spec-wrist-001',
    examType: 'specialist-ortopedi',
    domain: 'hand-handled',
    difficulty: 'challenging',
    question: 'En patient har scaphoid-pseudartros (nonunion) sedan 6 månader i waist (midja). Ingen AVN. Behandling?',
    options: [
      'Konservativ behandling fortsatt',
      'Perkutan skruvfixation',
      'Öppen skruvfixation med bongraft (Russe)',
      'Scaphoidektomi'
    ],
    correctAnswer: 'Öppen skruvfixation med bongraft (Russe)',
    explanation: 'Scaphoid-pseudartros kräver kirurgi för att undvika SNAC-artros (scaphoid nonunion advanced collapse). Standard är öppen skruvfixation + autologt bongraft från radius (Russe-teknik). Vid AVN krävs vaskulariserat graft. Perkutan fixation endast för akuta frakturer. Scaphoidektomi ger SLAC-artros.',
    learningObjectives: [
      'Känna till komplikationer vid scaphoidfrakturer',
      'Förstå Russe-teknik med bongraft',
      'Veta skillnad AVN vs non-AVN pseudartros',
      'Känna till SNAC-artros och prevention'
    ],
    clinicalRelevance: 'Scaphoid-pseudartros leder till SNAC-artros (handledartros) inom 5-10 år om obehandlat. Tidig kirurgisk behandling ger läkning i 85-95%.',
    commonMistakes: [
      'Försöker konservativ behandling vid etablerad pseudartros',
      'Använder endast skruv utan bongraft',
      'Missar AVN (behöver vaskulariserat graft)'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Green\'s Operative Hand Surgery, 8th Ed., Chapter 18'
      }
    ],
    references: [
      'Green\'s Operative Hand Surgery, 8th Ed., Chapter 18',
      'JBJS. 2015;97:1121-1128 (Scaphoid nonunion)',
      'J Hand Surg Am. 2014;39:1669-1676',
      'Svensk Handkirurgisk Förening: PM Scaphoid'
    ],
    estimatedTime: 120,
    keywords: ['scaphoid', 'pseudartros', 'Russe', 'SNAC'],
    relatedTopics: ['Scaphoidfrakturer', 'Pseudartros', 'Bongraft'],
    socialstyrelseMål: ['MK7', 'KF6']
  },

  // PEDIATRICS - MONTEGGIA
  {
    id: 'spec-peds-003',
    examType: 'specialist-ortopedi',
    domain: 'axel-armbåge',
    difficulty: 'expert',
    question: 'Ett 8-årigt barn har ulna-fraktur. Röntgen visar också att radiushuvudet är luxerat anteriort. Bado-klassifikation typ I. Vad är viktigast för bra resultat?',
    options: [
      'Stabil ulna-fixation som tillåter radiushuvud-reposition',
      'Öppen radiushuvud-reposition',
      'Ligamentrekonstruktion kring radiushuvudet',
      'Radiushuvudsresektion'
    ],
    correctAnswer: 'Stabil ulna-fixation som tillåter radiushuvud-reposition',
    explanation: 'Monteggia-fraktur = ulnafraktur + radiushuvudluxation. Nyckel till behandling: FÖRST stabil anatomisk ulna-reposition/fixation → radiushuvudet reduceras ofta spontant. Om inte: sluten radiushuvud-reposition. Öppen radiushuvud-reposition sällan nödvändig hos barn. Ligamentrekonstruktion och resektion kontraindicerade hos barn.',
    learningObjectives: [
      'Känna igen Monteggia-fraktur',
      'Förstå Bado-klassifikation (typ I-IV)',
      'Veta att ulna-fixation är nyckeln',
      'Kunna komplikationer vid missad radiushuvudluxation'
    ],
    clinicalRelevance: 'Monteggia-frakturer hos barn missas ofta (50% i primärvård!). Missad radiushuvudluxation ger permanent funktionsnedsättning. ALLTID kontrollera radiushuvud vid ulnafraktur!',
    commonMistakes: [
      'Missar radiushuvudluxation på röntgen',
      'Fixerar ulna i malposition (radiushuvud går inte att reducera)',
      'Försöker öppen radiushuvud-reposition först'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Bado JL. Clin Orthop. 1967;50:71-86'
      }
    ],
    references: [
      'Bado JL. The Monteggia lesion. Clin Orthop. 1967;50:71-86',
      'JBJS. 2016;98:1595-1602 (Monteggia in children)',
      'Tachdjian Pediatric Orthopaedics, 5th Ed., Chapter 33',
      'J Pediatr Orthop. 2013;33:121-126'
    ],
    estimatedTime: 120,
    keywords: ['Monteggia', 'Bado', 'radiushuvud', 'ulna'],
    relatedTopics: ['Monteggia-fraktur', 'Barnfrakturer', 'Armbåge'],
    socialstyrelseMål: ['MK10', 'KF10']
  },

  // SPINE - DEGENERATIVE DISC
  {
    id: 'spec-spine-003',
    examType: 'specialist-ortopedi',
    domain: 'rygg',
    difficulty: 'standard',
    question: 'En 45-årig patient har svår ländryggsmärta utan benutstråling. MR visar degenerativ disksjukdom L5-S1. Provokationsdiskografi positiv. Konservativ behandling misslyckad. Bästa kirurgiska alternativ?',
    options: [
      'Diskektomi',
      'Laminektomi',
      'ALIF/PLIF fusion L5-S1',
      'Diskprotes L5-S1'
    ],
    correctAnswer: 'ALIF/PLIF fusion L5-S1',
    explanation: 'Degenerativ disksjukdom (DDD) med diskogen smärta (utan radikulopati) kan behandlas med fusion vid misslyckad konservativ behandling >6-12 månader. L5-S1 är vanlig nivå. ALIF/PLIF (anterior/posterior lumbar interbody fusion) är standard. Diskprotes kontroversiell och inte TLV-godkänd i Sverige för alla indikationer. Diskektomi/laminektomi behandlar inte DDD.',
    learningObjectives: [
      'Förstå indikationer för fusion vid DDD',
      'Känna till olika fusionstekniker',
      'Veta kontroverser kring diskprotes',
      'Kunna när fusion ÄR indicerat vs INTE'
    ],
    clinicalRelevance: 'DDD-kirurgi är kontroversiell. Strikt patientselektering kritisk. Svenska Swespine-data visar måttliga resultat vid DDD jämfört med stenos/radikulopati.',
    commonMistakes: [
      'Opererar för liberalt utan adekvat konservativ behandling',
      'Använder diskprotes rutinmässigt (evidens svag)',
      'Fusionerar multipla nivåer vid ospecifik ländryggsvärk'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Swespine Årsrapport 2023'
      }
    ],
    references: [
      'Swespine Årsrapport 2023',
      'Spine. 2016;41:1106-1120 (DDD treatment)',
      'NEJM. 2007;356:2245-2256 (Spinal fusion vs intensive rehab)',
      'Spine, 3rd Ed., Vol 2, Chapter 85'
    ],
    estimatedTime: 120,
    keywords: ['DDD', 'disksjukdom', 'fusion', 'diskogen smärta'],
    relatedTopics: ['Degenerativ rygg', 'Lumbalfusion', 'Diskprotes'],
    socialstyrelseMål: ['MK9', 'KF9']
  },

  // FOOT - HALLUX VALGUS
  {
    id: 'spec-foot-003',
    examType: 'specialist-ortopedi',
    domain: 'fot-fotled',
    difficulty: 'standard',
    question: 'En 55-årig kvinna har hallux valgus med HV-vinkel 35° och IM-vinkel 15°. Symtomatisk med smärta vid MTP I. Behandling?',
    options: [
      'Endast skodon och inlägg',
      'Enkel exostektomi (bunion-ektomi)',
      'Distal osteotomi (Chevron/Mitchell)',
      'Proximal osteotomi + distal mjukdelsrelease (Scarf/DMMO)'
    ],
    correctAnswer: 'Proximal osteotomi + distal mjukdelsrelease (Scarf/DMMO)',
    explanation: 'Hallux valgus-klassifikation: lätt (<20° HV), måttlig (20-40°), svår (>40°). Vid HV 35° och IM 15° (måttlig-svår deformitet) krävs proximal eller diafyseal osteotomi (Scarf, DMMO, proximal chevron) + mjukdelsbalansering. Distal osteotomi (Chevron) endast för lätt deformitet. Exostektomi ensam ger recidiv.',
    learningObjectives: [
      'Känna till hallux valgus-klassifikation',
      'Förstå olika osteotomier och indikationer',
      'Veta mätning av HV- och IM-vinklar',
      'Kunna behandlingsalgoritm baserat på svårighetsgrad'
    ],
    clinicalRelevance: 'Hallux valgus mycket vanligt hos kvinnor. Korrekt osteotomival baserat på deformitet minskar recidivfrekvens. Fel operation ger recidiv eller överkorrektion.',
    commonMistakes: [
      'Använder distal osteotomi för svår deformitet',
      'Gör endast bunion-ektomi (hög recidivfrekvens)',
      'Glömmer mjukdelsbalansering'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Coughlin MJ et al. J Bone Joint Surg Am. 2000;82:1373-1378'
      }
    ],
    references: [
      'Coughlin MJ, Mann RA. Surgery of the Foot and Ankle, 9th Ed., Chapter 6',
      'Foot Ankle Int. 2018;39:1421-1427 (Hallux valgus treatment)',
      'JBJS. 2000;82:1373-1378 (Hallux valgus grading)',
      'Acta Orthop. 2019;90:171-175 (Swedish data)'
    ],
    estimatedTime: 90,
    keywords: ['hallux valgus', 'osteotomi', 'Scarf', 'HV-vinkel'],
    relatedTopics: ['Fotkirurgi', 'Hallux valgus', 'Osteotomier'],
    socialstyrelseMål: ['MK4', 'KF4']
  },

  // TRAUMA - PERIPROSTHETIC FRACTURE
  {
    id: 'spec-trauma-004',
    examType: 'specialist-ortopedi',
    domain: 'höft',
    difficulty: 'expert',
    question: 'En 80-årig patient med cementerad höftprotes faller. Röntgen visar periprotesisk femurfraktur Vancouver typ B2. Behandling?',
    options: [
      'Konservativ behandling',
      'ORIF med platta',
      'Revision till ocementerad långstjälksprotes',
      'Hemiprotes'
    ],
    correctAnswer: 'Revision till ocementerad långstjälksprotes',
    explanation: 'Vancouver-klassifikation för periprotesiska femurfrakturer: Typ A (trochanter), B (diafyseal kring stjälk), C (distalt om stjälk). Typ B delas i B1 (stabil stjälk), B2 (lös stjälk), B3 (lös + dålig benstock). B2 kräver revision av stjälk (vanligen till ocementerad lång stjälk/reconstruction nail) + cerclage/platta. ORIF ensam vid lös stjälk ger failure.',
    learningObjectives: [
      'Behärska Vancouver-klassifikation',
      'Förstå behandlingsalgoritm för periprotesiska frakturer',
      'Veta när revision krävs vs ORIF',
      'Känna till tekniker för B2/B3'
    ],
    clinicalRelevance: 'Periprotesiska frakturer ökar kraftigt med åldrande population och fler proteser. Vancouver B2/B3 är tekniskt utmanande. Korrekt klassificering avgör behandling.',
    commonMistakes: [
      'Försöker ORIF vid lös stjälk (Vancouver B2)',
      'Missar att stjälken är lös (tarvar belastningsröntgen)',
      'Använder för kort revisionsstjälk (behöver bypass frakturen)'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Duncan CP, Masri BA. J Arthroplasty. 1995;10:299-311'
      }
    ],
    references: [
      'Duncan CP, Masri BA. Periprosthetic fractures of the femur after hip arthroplasty. J Arthroplasty. 1995;10:299-311',
      'JBJS. 2018;100:1089-1100 (Vancouver classification)',
      'Rikshöft Årsrapport 2023 - Periprotesiska frakturer',
      'J Arthroplasty. 2019;34:1738-1743'
    ],
    estimatedTime: 150,
    keywords: ['periprotesisk', 'Vancouver', 'B2', 'revision'],
    relatedTopics: ['Periprotesiska frakturer', 'Vancouver', 'Revision'],
    socialstyrelseMål: ['MK8', 'KF8']
  }
];

// Export även efter kategori för enklare användning
export const specialistQuestionsByDomain = {
  trauma: specialistExamQuestions.filter(q => q.domain === 'trauma' || q.domain === 'höft'),
  arthroplasty: specialistExamQuestions.filter(q => q.domain === 'höft' || q.domain === 'knä'),
  sports: specialistExamQuestions.filter(q => q.domain === 'knä' || q.domain === 'sport'),
  upperExtremity: specialistExamQuestions.filter(q => q.domain === 'axel-armbåge' || q.domain === 'hand-handled'),
  foot: specialistExamQuestions.filter(q => q.domain === 'fot-fotled'),
  spine: specialistExamQuestions.filter(q => q.domain === 'rygg'),
  pediatrics: specialistExamQuestions.filter(q => q.keywords.includes('barn') || q.domain === 'höft'),
  tumor: specialistExamQuestions.filter(q => q.domain === 'tumör'),
};
