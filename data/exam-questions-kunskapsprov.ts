/**
 * Kunskapsprovet - Ortopediska Frågor
 *
 * Fokus på ortopediska kunskaper relevanta för Kunskapsprovet
 * Baserat på:
 * - Tidigare Kunskapsprov-frågor
 * - Socialstyrelsens målbeskrivning
 * - Svensk medicinskt basår-kurser
 * - Grundläggande klinisk medicin
 */

import { ExamQuestion } from '@/types/exam';

export const kunskapsprovQuestions: ExamQuestion[] = [
  // ANATOMI - HÖFT
  {
    id: 'kp-anat-001',
    examType: 'kunskapsprovet',
    domain: 'höft',
    difficulty: 'standard',
    question: 'Vilken struktur går INTE genom foramen ischiadicum majus?',
    options: [
      'N. ischiadicus',
      'N. gluteus superior',
      'A. glutea inferior',
      'N. obturatorius'
    ],
    correctAnswer: 'N. obturatorius',
    explanation: 'N. obturatorius går genom foramen obturatum, INTE foramen ischiadicum majus. Genom foramen ischiadicum majus går: n. ischiadicus, n. gluteus superior & inferior, a. & v. glutea superior & inferior, n. cutaneus femoris posterior, m. piriformis, a. pudenda interna och n. pudendus.',
    learningObjectives: [
      'Känna till anatomi kring höften',
      'Förstå nervpassager i bäckenet',
      'Veta vilka strukturer som går genom foramina'
    ],
    clinicalRelevance: 'Viktigt vid höftkirurgi och glutealregionens kirurgi att känna till nervernas förlopp för att undvika nervskador.',
    sources: [
      {
        type: 'guideline-based',
        reference: 'Gray\'s Anatomy, 41st Ed., Chapter 74'
      }
    ],
    references: [
      'Gray\'s Anatomy, 41st Ed., Chapter 74',
      'Netter\'s Atlas of Human Anatomy, 7th Ed., Plate 488',
      'Moore Clinically Oriented Anatomy, 8th Ed., Chapter 5'
    ],
    estimatedTime: 60,
    keywords: ['anatomi', 'höft', 'foramen', 'nerv'],
    relatedTopics: ['Anatomi', 'Nervförlopp', 'Bäcken'],
    socialstyrelseMål: ['MK1']
  },

  {
    id: 'kp-anat-002',
    examType: 'kunskapsprovet',
    domain: 'axel-armbåge',
    difficulty: 'standard',
    question: 'En patient har skadad n. axillaris efter axelluxation. Vilken funktion är  påverkad?',
    options: [
      'Armbågsflexion',
      'Axelabduktion',
      'Armbågsextension',
      'Handledsextension'
    ],
    correctAnswer: 'Axelabduktion',
    explanation: 'N. axillaris innerverar m. deltoideus (huvudansvarig för axelabduktion 15-90°) och m. teres minor. Skada ger försvagad/förlorad axelabduktion och nedsatt sensation över laterala överarmen ("regementsmärke"). Armbågsflexion = n. musculocutaneus, extension = n. radialis, handledsextension = n. radialis.',
    learningObjectives: [
      'Känna till n. axillaris funktion',
      'Veta muskelinnervation i axelregionen',
      'Kunna koppla nervskada till funktionsbortfall'
    ],
    clinicalRelevance: 'N. axillaris-skada är vanlig komplikation vid främre axelluxation (5-20%). Klinisk undersökning måste inkludera neurologi före och efter reposition.',
    sources: [
      {
        type: 'guideline-based',
        reference: 'Gray\'s Anatomy, 41st Ed., Chapter 48'
      }
    ],
    references: [
      'Gray\'s Anatomy, 41st Ed., Chapter 48',
      'Rockwood and Matsen: The Shoulder, 5th Ed., Chapter 12',
      'Netter\'s Atlas, Plate 420'
    ],
    estimatedTime: 60,
    keywords: ['n. axillaris', 'deltoideus', 'abduktion', 'axel'],
    relatedTopics: ['Neurologi', 'Axelskador', 'Muskelinnervation'],
    socialstyrelseMål: ['MK1', 'KF1']
  },

  // FYSIOLOGI - BEN
  {
    id: 'kp-physio-001',
    examType: 'kunskapsprovet',
    domain: 'trauma',
    difficulty: 'standard',
    question: 'Vilken cell är primärt ansvarig för benresorption?',
    options: [
      'Osteoblast',
      'Osteocyt',
      'Osteoklast',
      'Kondrocyt'
    ],
    correctAnswer: 'Osteoklast',
    explanation: 'Osteoklaster är multinukleära celler som resorberar (bryter ner) ben genom att utsöndra syra och enzymer. Osteoblaster bygger nytt ben. Osteocyter är mogna benceller inbäddade i benmatrix. Kondrocyter finns i brosk, inte ben.',
    learningObjectives: [
      'Förstå bencellernas funktioner',
      'Känna till benmetabolism',
      'Veta skillnad mellan osteoblast/klast/cyt'
    ],
    clinicalRelevance: 'Grundläggande för att förstå osteoporos, benfrakturer och benläkning. Osteoklastaktivitet är måltavla för osteoporosbehandling (bisfosfonater).',
    sources: [
      {
        type: 'guideline-based',
        reference: 'Guyton and Hall Textbook of Medical Physiology, 14th Ed.'
      }
    ],
    references: [
      'Guyton and Hall: Textbook of Medical Physiology, 14th Ed., Chapter 79',
      'Junqueira\'s Basic Histology, 15th Ed., Chapter 8',
      'NEJM. 2016;375:2055-2065 (Bone metabolism review)'
    ],
    estimatedTime: 45,
    keywords: ['osteoklast', 'ben', 'resorption', 'metabol ism'],
    relatedTopics: ['Benfysiologi', 'Osteoporos', 'Benläkning'],
    socialstyrelseMål: ['MK1']
  },

  // PATOFYSIOLOGI - FRAKTUR
  {
    id: 'kp-patho-001',
    examType: 'kunskapsprovet',
    domain: 'trauma',
    difficulty: 'standard',
    question: 'Vilken är den vanligaste orsaken till fettembolisyndrom?',
    options: [
      'Ribb frakturer',
      'Långa rörbensfrakturer (femur, tibia)',
      'Ryggkotfrakturer',
      'Höftfrakturer hos äldre'
    ],
    correctAnswer: 'Långa rörbensfrakturer (femur, tibia)',
    explanation: 'Fettembolisyndrom uppstår typiskt 24-72h efter frakturer i långa rörben (femur, tibia) där fettmärg frigörs. Klassisk triad: hypoxemi, neurologiska symtom (förvirring), petekier. Högre risk vid multipla frakturer. Tidig stabilisering av frakturer minskar risk.',
    learningObjectives: [
      'Känna till fettembolisyndrom',
      'Veta riskfaktorer och timing',
      'Kunna klassisk triad av symtom',
      'Förstå patofysiologi'
    ],
    clinicalRelevance: 'Fettembolisyndrom är livshotande komplikation vid trauma. Kräver intensivvård. Tidig frakturstabilisering är profylax.',
    sources: [
      {
        type: 'guideline-based',
        reference: 'Mellor A, Soni N. BMJ. 2001;322:1401-1404'
      }
    ],
    references: [
      'Mellor A, Soni N. Fat embolism. BMJ. 2001;322:1401-1404',
      'Lancet. 2009;374:1821-1831 (Fat embolism syndrome)',
      'J Orthop Trauma. 2019;33:S27-S30',
      'ATLS 10th Ed., Chapter 7'
    ],
    estimatedTime: 75,
    keywords: ['fettembolisyndrom', 'fraktur', 'femur', 'komplikation'],
    relatedTopics: ['Traumakomplikationer', 'Intensivvård', 'Patofysiologi'],
    socialstyrelseMål: ['MK2', 'MK3']
  },

  // FARMAKOLOGI - SMÄRTA
  {
    id: 'kp-pharm-001',
    examType: 'kunskapsprovet',
    domain: 'trauma',
    difficulty: 'standard',
    question: 'Vilken är den viktigaste biverkningen att informera om vid långtidsbehandling med NSAID hos en 70-årig patient?',
    options: [
      'Försämrad benmineralitet',
      'Gastrointestinal blödning',
      'Hjärtsvikt',
      'Leverpåverkan'
    ],
    correctAnswer: 'Gastrointestinal blödning',
    explanation: 'NSAID ökar risken för gastrointestinal blödning/ulcus kraftigt, speciellt hos äldre. Risk ökar med ålder, dos och behandlingslängd. Hos äldre (>70 år) och högriskpatienter bör NSAID undvikas eller ges med PPI-skydd. Även njurpåverkan och kardiovaskulära risker är viktiga.',
    learningObjectives: [
      'Känna till NSAID-biverkningar',
      'Förstå risker hos äldre',
      'Veta när PPI-skydd behövs',
      'Kunna välja säkrare alternativ'
    ],
    clinicalRelevance: 'NSAID är överförskrivna hos äldre. GI-blödning kan vara fatal. Som läkare måste man väga nytta mot risk och överväga paracetamol som säkrare alternativ.',
    sources: [
      {
        type: 'guideline-based',
        reference: 'Läkemedelsverket: NSAID - Behandlingsrekommendation (2023)'
      }
    ],
    references: [
      'Läkemedelsverket: NSAID - Behandlingsrekommendation (2023)',
      'Lancet. 2013;382:769-779 (NSAID cardiovascular and GI risks)',
      'BMJ. 2011;342:c7086 (Risks of NSAIDs)',
      'Socialstyrelsen: Indikatorer för god läkemedelsbehandling hos äldre (2017)'
    ],
    estimatedTime: 60,
    keywords: ['NSAID', 'biverkning', 'GI-blödning', 'äldre'],
    relatedTopics: ['Farmakologi', 'Geriatrik', 'Smärtbehandling'],
    socialstyrelseMål: ['MK4']
  },

  // KLINISK MEDICIN - DIAGNOSTIK
  {
    id: 'kp-dx-001',
    examType: 'kunskapsprovet',
    domain: 'hand-handled',
    difficulty: 'standard',
    question: 'En patient har nedsatt känsel i lillfinger och lillfingerhalvan av ringfingret. Vilken nerv är troligen skadad?',
    options: [
      'N. medianus',
      'N. radialis',
      'N. ulnaris',
      'N. musculocutaneus'
    ],
    correctAnswer: 'N. ulnaris',
    explanation: 'N. ulnaris innerverar känsel i lillfinger och ulnara halvan av ringfinger (både vola och dorsum). Också motorisk till mm. interossei, mm. lumbricales 3-4, m. adductor pollicis. Skada ger "klolhand" (claw hand). N. medianus = tumme, pek-, lång- och radiala halvan ringfinger. N. radialis = dorsum av tumme, pek- och långfinger.',
    learningObjectives: [
      'Känna till perifer nervdistribution i handen',
      'Kunna koppla sensibilitetsnedsättning till nervskada',
      'Veta motoriska funktioner för handnerver'
    ],
    clinicalRelevance: 'Nervskador i handen är vanliga vid trauma. Korrekt neurologisk undersökning är kritisk för diagnos och behandling.',
    sources: [
      {
        type: 'guideline-based',
        reference: 'Gray\'s Anatomy, 41st Ed., Chapter 50'
      }
    ],
    references: [
      'Gray\'s Anatomy, 41st Ed., Chapter 50',
      'Netter\'s Atlas, Plates 463-465',
      'Green\'s Operative Hand Surgery, 8th Ed., Chapter 29',
      'BMJ. 2014;348:g255 (Clinical examination of hand)'
    ],
    estimatedTime: 60,
    keywords: ['n. ulnaris', 'hand', 'känsel', 'lillfinger'],
    relatedTopics: ['Neurologi', 'Handanatomi', 'Klinisk undersökning'],
    socialstyrelseMål: ['MK2', 'KF2']
  },

  // RADIOLOGI
  {
    id: 'kp-radio-001',
    examType: 'kunskapsprovet',
    domain: 'knä',
    difficulty: 'standard',
    question: 'Vid misstänkt scaphoidfraktur är initial röntgen negativ. Vad är nästa steg om klinisk misstanke kvarstår?',
    options: [
      'Ny röntgen om 10-14 dagar',
      'MR omedelbart',
      'CT omedelbart',
      'Avvakta utan immobilisering'
    ],
    correctAnswer: 'Ny röntgen om 10-14 dagar',
    explanation: 'Vid misstänkt scaphoidfraktur med negativ initial röntgen: gipsa i scaphoidgips, ny röntgen efter 10-14 dagar när resorption gjort frakturen synlig. Alternativt kan MR eller CT göras akut om tillgängligt, men kostnadseffektivast är röntgenkontroll. ALDRIG avvakta utan immobilisering (risk för pseudartros).',
    learningObjectives: [
      'Känna till scaphoidfrakturers radiologi',
      'Förstå att frakturer kan vara ockulta initialt',
      'Veta handläggning vid misstänkt men ej verifierad fraktur',
      'Kunna rollen för olika bildmodaliteter'
    ],
    clinicalRelevance: 'Scaphoidfrakturer missas lätt och kan leda till avaskulär nekros och pseudartros om felbehandlade. Hög misstänksamhet och korrekt uppföljning är kritiskt.',
    sources: [
      {
        type: 'guideline-based',
        reference: 'Akuthandbok: Scaphoidfraktur (2023)'
      }
    ],
    references: [
      'Akuthandbok: Scaphoidfraktur (2023)',
      'BMJ. 2015;350:h988 (Scaphoid fracture management)',
      'Cochrane Database Syst Rev. 2015;9:CD010023',
      'Green\'s Hand Surgery, 8th Ed., Chapter 18'
    ],
    estimatedTime: 75,
    keywords: ['scaphoid', 'okult fraktur', 'röntgen', 'uppföljning'],
    relatedTopics: ['Radiologi', 'Handfrakturer', 'Diagnostik'],
    socialstyrelseMål: ['MK5', 'KF3']
  },

  // ORTOPEDI - BARN
  {
    id: 'kp-peds-001',
    examType: 'kunskapsprovet',
    domain: 'trauma',
    difficulty: 'challenging',
    question: 'Ett 3-årigt barn har akut vägran att använda armen efter att ha blivit upplyft i handen av en vuxen. Diagnos?',
    options: [
      'Colles-fraktur',
      'Subluxation av radiushuvudet ("barnbåge")',
      'Fraktur av clavicula',
      'Axelluxation'
    ],
    correctAnswer: 'Subluxation av radiushuvudet ("barnbåge")',
    explanation: 'Klassiskt "barnbåge" (nursemaid\'s elbow, radial head subluxation). Uppstår när barn (1-4 år) lyfts/dras i handen - ligamentum anulare glider över radiushuvudet. Barn vägrar använda armen, håller den pronerad och något flekterad. Behandling: snabb supination + flexion (känns "klick") → omedelbar förbättring. Ingen röntgen behövs vid typisk anamnes.',
    learningObjectives: [
      'Känna igen barnbåge kliniskt',
      'Förstå mekanismen',
      'Kunna repositionera',
      'Veta när röntgen inte behövs'
    ],
    clinicalRelevance: 'Mycket vanligt hos småbarn på akuten. Korrekt diagnos och reposition ger omedelbar bot. Felaktig hantering (röntgen, gips) är onödig.',
    sources: [
      {
        type: 'previous-exam',
        year: 2018,
        reference: 'Kunskapsprovet VT 2018'
      }
    ],
    references: [
      'Akuthandbok: Barnbåge (2023)',
      'Tachdjian Pediatric Orthopaedics, 5th Ed., Chapter 32',
      'Ann Emerg Med. 2008;51:696-697 (Radial head subluxation)',
      'Pediatrics. 2017;140:e20163349'
    ],
    estimatedTime: 75,
    keywords: ['barnbåge', 'radiushuvud', 'subluxation', 'barn'],
    relatedTopics: ['Barnortopedi', 'Akutmedicin', 'Reposition'],
    socialstyrelseMål: ['MK6', 'KF4']
  },

  // INFEKTION
  {
    id: 'kp-infect-001',
    examType: 'kunskapsprovet',
    domain: 'trauma',
    difficulty: 'standard',
    question: 'En patient har haft feber, smärta och rodnad över tibia i 1 vecka. CRP 150, LPK 15. Röntgen visar periosteal reaktion. Vilken diagnos är mest sannolik?',
    options: [
      'Djup ventrombos',
      'Osteomyelit',
      'Cellulit',
      'Kompartmentsyndrom'
    ],
    correctAnswer: 'Osteomyelit',
    explanation: 'Osteomyelit presenterar med feber, lokaliserad bensmärta, förhöjda infektionsparametrar. Periosteal reaktion på röntgen ses efter 10-14 dagar (tidigt tecken är normala röntgen). Vanligaste bakterie: Staphylococcus aureus. Kräver odling (blod, benprov) och långvarig antibiotikabehandling (4-6 veckor iv).',
    learningObjectives: [
      'Känna igen osteomyelit kliniskt',
      'Veta radiologiska fynd',
      'Förstå när antibiotika räcker vs kirurgi',
      'Kunna vanligaste patogener'
    ],
    clinicalRelevance: 'Osteomyelit är allvarlig infektion som kan leda till kronisk osteomyelit, amputation. Tidig diagnos och adekvat behandling är kritisk.',
    sources: [
      {
        type: 'guideline-based',
        reference: 'NEJM. 2004;350:1422-1429 (Osteomyelitis review)'
      }
    ],
    references: [
      'NEJM. 2004;350:1422-1429 (Osteomyelitis)',
      'Lancet. 2004;364:369-379 (Bone and joint infections)',
      'Akuthandbok: Osteomyelit (2023)',
      'Campbell Operative Orthopaedics, 13th Ed., Chapter 20'
    ],
    estimatedTime: 90,
    keywords: ['osteomyelit', 'infektion', 'periosteal', 'feber'],
    relatedTopics: ['Beninfektioner', 'Radiologi', 'Antibiotika'],
    socialstyrelseMål: ['MK7', 'KF5']
  },

  // REUMATOLOGI
  {
    id: 'kp-rheum-001',
    examType: 'kunskapsprovet',
    domain: 'hand-handled',
    difficulty: 'standard',
    question: 'En 55-årig kvinna har symmetrisk svullnad och ömhet i MCP- och PIP-leder bilateralt. Morgonstelhet >1 timme. Vad är mest sannolikt?',
    options: [
      'Artros',
      'Reumatoid artrit',
      'Psoriasisartrit',
      'Gikt'
    ],
    correctAnswer: 'Reumatoid artrit',
    explanation: 'Klassisk presentation av reumatoid artrit (RA): symmetrisk polyartrit i små leder (MCP, PIP), morgonstelhet >1h. Artros ger DIP-ledengagemang (Heberdens noder), inte MCP. Gikt är akut monoartrit. Psoriasisartrit kan vara asymmetrisk. RA kräver tidig DMARD-behandling för att förhindra leddestruktion.',
    learningObjectives: [
      'Känna igen reumatoid artrit',
      'Veta klassiska presentationen',
      'Kunna skilja från artros',
      'Förstå vikten av tidig behandling'
    ],
    clinicalRelevance: 'RA påverkar 1% av befolkningen. Tidig diagnos och behandling (DMARDs) förhindrar leddestruktion och funktionsnedsättning. Sent insatt behandling ger sämre prognos.',
    sources: [
      {
        type: 'guideline-based',
        reference: 'ACR/EULAR 2010 RA Classification Criteria'
      }
    ],
    references: [
      'Arthritis Rheum. 2010;62:2569-2581 (ACR/EULAR RA criteria)',
      'Lancet. 2016;388:2023-2038 (Rheumatoid arthritis)',
      'Svenska Reumatologiska Föreningens Vårdprogram RA (2023)',
      'NEJM. 2011;365:2205-2219 (RA treatment)'
    ],
    estimatedTime: 75,
    keywords: ['reumatoid artrit', 'RA', 'polyartrit', 'morgonstelhet'],
    relatedTopics: ['Reumatologi', 'Autoimmuna sjukdomar', 'Artrit'],
    socialstyrelseMål: ['MK8']
  },

  // ADDITIONAL KUNSKAPSPROV QUESTIONS

  // MORE ANATOMY
  {
    id: 'kp-anat-003',
    examType: 'kunskapsprovet',
    domain: 'knä',
    difficulty: 'standard',
    question: 'Vilken muskel är den kraftigaste knäextensoren?',
    options: [
      'M. vastus lateralis',
      'M. vastus medialis',
      'M. rectus femoris',
      'M. sartorius'
    ],
    correctAnswer: 'M. vastus lateralis',
    explanation: 'M. vastus lateralis är den största och kraftigaste delen av quadriceps femoris. Quadriceps består av 4 muskler: vastus lateralis, vastus medialis, vastus intermedius, rectus femoris. Alla insererar via patellarsena på tuberositas tibiae. Rectus femoris är enda tåhuvade (även höftflexor). Sartorius är höftflexor och knäflexor.',
    learningObjectives: [
      'Känna till quadriceps anatomi',
      'Veta de 4 delarna av quadriceps',
      'Förstå funktion (knäextension)',
      'Kunna skillnad mono- vs biartikul är muskel'
    ],
    clinicalRelevance: 'Quadriceps-svaghet är vanligt efter knäskador/operationer. Rehabilitering fokuserar ofta på vastus medialis obliquus (VMO) för patellastabilitet.',
    sources: [
      {
        type: 'guideline-based',
        reference: 'Gray\'s Anatomy, 41st Ed., Chapter 78'
      }
    ],
    references: [
      'Gray\'s Anatomy, 41st Ed., Chapter 78',
      'Netter\'s Atlas, Plate 490',
      'Moore Clinically Oriented Anatomy, 8th Ed., Chapter 5'
    ],
    estimatedTime: 45,
    keywords: ['quadriceps', 'vastus lateralis', 'knä', 'extension'],
    relatedTopics: ['Muskelanatomi', 'Knäbiomek anik', 'Quadriceps'],
    socialstyrelseMål: ['MK1']
  },

  {
    id: 'kp-anat-004',
    examType: 'kunskapsprovet',
    domain: 'fot-fotled',
    difficulty: 'standard',
    question: 'Vilken sena går bakom mediala malleolen?',
    options: [
      'M. tibialis anterior',
      'M. tibialis posterior',
      'M. extensor hallucis longus',
      'M. peroneus longus'
    ],
    correctAnswer: 'M. tibialis posterior',
    explanation: 'M. tibialis posterior går bakom mediala malleolen (mediala compartment). Viktigt för fotbågens stöd och fotinversion. Tib ialis posterior-tendinit/ruptur ger plattfot ("adult acquired flatfoot"). Tibialis anterior = framför fotleden (dorsiflexion). Peroneus longus/brevis = lateralt (fotevversion). Mnemonik: "Tom, Dick And Harry" (Tibialis posterior, Flexor Digitorum, Arteria tibialis posterior, Nervus tibialis, Flexor Hallucis).',
    learningObjectives: [
      'Känna till senförlopp kring fotleden',
      'Veta tibialis posterior funktion',
      'Förstå fotbågens anatomi',
      'Kunna mnemonik för mediala strukturer'
    ],
    clinicalRelevance: 'Tibialis posterior-dysfunktion leder till progressiv plattfot hos vuxna. Viktig diagnos att känna igen.',
    sources: [
      {
        type: 'guideline-based',
        reference: 'Gray\'s Anatomy, 41st Ed., Chapter 82'
      }
    ],
    references: [
      'Gray\'s Anatomy, 41st Ed., Chapter 82',
      'Netter\'s Atlas, Plate 518',
      'Foot Ankle Int. 2018;39:609-619 (Tibialis posterior dysfunction)'
    ],
    estimatedTime: 45,
    keywords: ['tibialis posterior', 'fotled', 'mediala malleolen', 'sen'],
    relatedTopics: ['Fotanatomi', 'Senförlopp', 'Fotbåge'],
    socialstyrelseMål: ['MK1']
  },

  // MORE PHYSIOLOGY
  {
    id: 'kp-physio-002',
    examType: 'kunskapsprovet',
    domain: 'trauma',
    difficulty: 'standard',
    question: 'Vilken fas av benläkning karakteriseras av bildning av mjukt kallus (fibrokartilaginöst)?',
    options: [
      'Inflammationsfasen',
      'Reparationsfasen',
      'Remodelleringsfasen',
      'Primär benläkning'
    ],
    correctAnswer: 'Reparationsfasen',
    explanation: 'Benläkning sker i 3 faser: (1) Inflammationsfas (hematom, inflammation, 1-7 dagar), (2) Reparationsfas (mjukt kallus av fibroblaster/kondrocyter → hårt kallus av osteoblaster, veckor-månader), (3) Remodelleringsfas (woven bone → lamellärt ben, månader-år). Primär benläkning sker vid stabila ORIF utan kallus.',
    learningObjectives: [
      'Förstå de 3 faserna av benläkning',
      'Veta skillnad primär vs sekundär läkning',
      'Känna till tidsperspektiv',
      'Kunna celltyper involverade'
    ],
    clinicalRelevance: 'Förståelse för benläkning är grundläggande för att bedöma frakturläkning och välja behandling (kirurgi vs konservativ).',
    sources: [
      {
        type: 'guideline-based',
        reference: 'JBJS. 2012;94:e103 (Fracture healing)'
      }
    ],
    references: [
      'JBJS. 2012;94:e103 (The biology of fracture healing)',
      'J Orthop Trauma. 2016;30:S8-S9',
      'Guyton & Hall: Medical Physiology, 14th Ed., Chapter 79'
    ],
    estimatedTime: 60,
    keywords: ['benläkning', 'kallus', 'reparation', 'fraktur'],
    relatedTopics: ['Benläkning', 'Frakturfysiologi', 'Kallus'],
    socialstyrelseMål: ['MK2']
  },

  {
    id: 'kp-physio-003',
    examType: 'kunskapsprovet',
    domain: 'trauma',
    difficulty: 'challenging',
    question: 'Vilket vitamin är essentiellt för kalciumabsorption i tarmen och därmed viktigt för benhälsa?',
    options: [
      'Vitamin A',
      'Vitamin B12',
      'Vitamin C',
      'Vitamin D'
    ],
    correctAnswer: 'Vitamin D',
    explanation: 'Vitamin D (kalciferol) är kritiskt för kalciumabsorption i tarmen. Vitamin D-brist → sekundär hyperparatyreoidism → ökad benresorption → osteoporos/osteomalaci. Vitamin D bildas i hud (solljus) och från kost. Aktiveras i lever (25-OH D) och njurar (1,25-OH D = kalcitriol, aktiv form). Vitamin C viktigt för kollagensyntesà Vitamin A för skelettillväxt.',
    learningObjectives: [
      'Förstå vitamin D:s roll i kalciummetabolism',
      'Veta konsekvenser av vitamin D-brist',
      'Känna till aktivering av vitamin D',
      'Kunna koppling till osteoporos'
    ],
    clinicalRelevance: 'Vitamin D-brist mycket vanligt, speciellt hos äldre och i Norden. Screening och substitution viktig del av osteoporosbehandling.',
    sources: [
      {
        type: 'guideline-based',
        reference: 'NEJM. 2007;357:266-281 (Vitamin D)'
      }
    ],
    references: [
      'NEJM. 2007;357:266-281 (Vitamin D deficiency)',
      'Lancet. 2014;383:146-155',
      'Guyton & Hall: Medical Physiology, 14th Ed., Chapter 79',
      'Socialstyrelsen: Osteoporosbehandling (2019)'
    ],
    estimatedTime: 60,
    keywords: ['vitamin D', 'kalcium', 'osteoporos', 'benmetabolism'],
    relatedTopics: ['Vitam iner', 'Benmetabolism', 'Osteoporos'],
    socialstyrelseMål: ['MK2']
  },

  // MORE PATHOPHYSIOLOGY
  {
    id: 'kp-patho-002',
    examType: 'kunskapsprovet',
    domain: 'rygg',
    difficulty: 'standard',
    question: 'Cauda equina-syndrom karakteriseras av alla UTOM:',
    options: [
      'Bilateral bensvaghet',
      'Sadel-anestesi',
      'Urin/avföringsretention',
      'Spastisk parapares'
    ],
    correctAnswer: 'Spastisk parapares',
    explanation: 'Cauda equina-syndrom = akut kompression av nervr ötterna i cauda equina (under L1-L2 där ryggmärgen slutar). Klassisk triad: (1) Bilateral radikulopati (smärta, svaghet, SLAPP pares), (2) Sadel-anestesi (S2-S5), (3) Blås-/tarmrubbning (retention). Spastisk parapares indikerar ryggmärgskompression (UMN), inte cauda equina (LMN). Cauda equina är kirurgisk akut!',
    learningObjectives: [
      'Känna igen cauda equina-syndrom',
      'Förstå skillnad cauda vs conus medullaris vs ryggmärg',
      'Veta UMN vs LMN-tecken',
      'Kunna att det är kirurgisk akut'
    ],
    clinicalRelevance: 'Cauda equina är akut kirurgisk indikation (dekompression inom 24-48h). Fördröjd behandling ger permanent neurologisk skada. Alla läkare måste känna igen detta!',
    sources: [
      {
        type: 'guideline-based',
        reference: 'Lancet. 2017;389:1299-1310'
      }
    ],
    references: [
      'Lancet. 2017;389:1299-1310 (Cauda equina syndrome)',
      'NEJM. 2017;376:1564-1571',
      'Akuthandbok: Cauda equina (2023)',
      'J Neurosurg Spine. 2016;24:209-214'
    ],
    estimatedTime: 75,
    keywords: ['cauda equina', 'sadel-anestesi', 'blåsretention', 'akut'],
    relatedTopics: ['Neurologiska akutfall', 'Ryggmärgskompression', 'Cauda equina'],
    socialstyrelseMål: ['MK3']
  },

  // MORE PHARMACOLOGY
  {
    id: 'kp-pharm-002',
    examType: 'kunskapsprovet',
    domain: 'trauma',
    difficulty: 'standard',
    question: 'Vilken biverkning är MEST specifik för bisfosfonater (t.ex. alendronat) vid osteoporosbehandling?',
    options: [
      'Esofagit',
      'Njursvikt',
      'Leverpåverkan',
      'Elektrolytrubbning'
    ],
    correctAnswer: 'Esofagit',
    explanation: 'Bisfosfonater (alendronat, risedronat, zolendronat) hämmar osteokl aster och minskar benresorption. Vanligaste biverkningen av perorala bisfosfonater är esofagit/gastrit. Därför måste patienten: ta på tom mage, stå/sitta upprätt 30 min efter, dricka fullt glas vatten. Sällsynta men allvarliga: osteonekros i käken (särskilt vid tandkirurgi), atypiska femurfrakturer (vid långvarig behandling >5 år).',
    learningObjectives: [
      'Känna till bisfosfonaters verkningssätt',
      'Veta vanliga biverkningar (esofagit)',
      'Kunna doseringsrekommendationer',
      'Känna till sällsynta men allvarliga biverkningar'
    ],
    clinicalRelevance: 'Bisfosfonater är förstahandsbehandling vid osteoporos. Korrekt dosering och patientinformation minskar biverkningar. Viktig kunskap för alla läkare.',
    sources: [
      {
        type: 'guideline-based',
        reference: 'Läkemedelsverket: Osteoporosbehandling (2023)'
      }
    ],
    references: [
      'Läkemedelsverket: Behandling av osteoporos (2023)',
      'NEJM. 2016;374:2096-2097 (Bisphosphonates)',
      'Lancet. 2015;386:1341-1348',
      'Socialstyrelsen: Nationella riktlinjer osteoporos (2019)'
    ],
    estimatedTime: 60,
    keywords: ['bisfosfonater', 'alendronat', 'esofagit', 'osteoporos'],
    relatedTopics: ['Osteoporosbehandling', 'Läkemedelsbiverkningar', 'Bisfosfonater'],
    socialstyrelseMål: ['MK4']
  },

  {
    id: 'kp-pharm-003',
    examType: 'kunskapsprovet',
    domain: 'trauma',
    difficulty: 'challenging',
    question: 'Tranexamsyra (Cyklokapron) används vid trauma för att:',
    options: [
      'Öka trombocytproduktion',
      'Hämma fibrinolys och minska blödning',
      'Öka koagulation via vitamin K',
      'Stimulera erytropoies'
    ],
    correctAnswer: 'Hämma fibrinolys och minska blödning',
    explanation: 'Tranexamsyra (TXA) är antifibrinolytikum: hämmar omvandling av plasminogen till plasmin → minskar nedbrytning av fibrin → minskar blödning. Används vid trauma (CRASH-2-studien visade minskad mortalitet om given inom 3h), postpartumblödning, kirurgi. Kontraindikationer: trombos-risk, kramper. Ger INTE ökad trombocyt/erytrocyt-produktion eller koagulation.',
    learningObjectives: [
      'Förstå tranexamsyras verkningssätt',
      'Känna till CRASH-2-studien',
      'Veta indikationer och timing (inom 3h)',
      'Kunna kontraindikationer'
    ],
    clinicalRelevance: 'TXA är livräddande vid massiv traumablödning. Ges rutinmässigt vid svår trauma på många akutmottagningar. WHO essentiell medicin.',
    sources: [
      {
        type: 'guideline-based',
        reference: 'Lancet. 2010;376:23-32 (CRASH-2)'
      }
    ],
    references: [
      'Lancet. 2010;376:23-32 (CRASH-2 trial)',
      'ATLS 10th Ed., Chapter 3',
      'Läkemedelsverket: Tranexamsyra vid trauma (2023)',
      'Cochrane Database Syst Rev. 2015;9:CD004896'
    ],
    estimatedTime: 75,
    keywords: ['tranexamsyra', 'TXA', 'fibrinolys', 'trauma'],
    relatedTopics: ['Traumafarmakologi', 'Blödningskontroll', 'CRASH-2'],
    socialstyrelseMål: ['MK4']
  },

  // MORE DIAGNOSTICS
  {
    id: 'kp-dx-002',
    examType: 'kunskapsprovet',
    domain: 'axel-armbåge',
    difficulty: 'standard',
    question: 'Drop arm test (patienten kan inte hålla armen abducerad 90° utan att den faller) indikerar skada på:',
    options: [
      'M. deltoideus',
      'Rotatorcuffen (supraspinatus)',
      'N. axillaris',
      'Långa bicepssenen'
    ],
    correctAnswer: 'Rotatorcuffen (supraspinatus)',
    explanation: 'Drop arm test är klassiskt test för rotatorcuffruptur (speciellt supraspinatus). Patient abducerar armen 90°, släpper sedan försiktigt - vid ruptur "faller" armen. Supraspinatus initierar och assisterar abduktion (deltoideus är huvudmuskel för 15-90° abduktion). N. axillaris-skada ger svaghet men inte specifikt "drop". Långa biceps-ruptur = "Popeye-deformitet".',
    learningObjectives: [
      'Kunna utföra drop arm test',
      'Förstå rotatorcuffens funktion',
      'Veta vilka muskler som abducerar axeln',
      'Känna till andra rotatorcuff-tester'
    ],
    clinicalRelevance: 'Rotatorcuffrupturer mycket vanliga hos äldre. Klinisk undersökning vägleder behov av MR och behandling.',
    sources: [
      {
        type: 'guideline-based',
        reference: 'JBJS. 2013;95:1920-1926 (Rotator cuff exam)'
      }
    ],
    references: [
      'JBJS. 2013;95:1920-1926 (Physical examination of rotator cuff)',
      'Am J Sports Med. 2012;40:2874-2884',
      'BMJ. 2013;347:f6570 (Shoulder examination)',
      'Rockwood & Matsen: The Shoulder, 5th Ed., Chapter 16'
    ],
    estimatedTime: 60,
    keywords: ['drop arm', 'rotatorcuff', 'supraspinatus', 'axel'],
    relatedTopics: ['Axelundersökning', 'Rotatorcuff', 'Kliniska tester'],
    socialstyrelseMål: ['MK2']
  },

  // MORE RADIOLOGY
  {
    id: 'kp-radio-002',
    examType: 'kunskapsprovet',
    domain: 'höft',
    difficulty: 'standard',
    question: 'Shenton\'s linje på höftröntgen används för att bedöma:',
    options: [
      'Collumfraktur',
      'Höftluxation',
      'Artros',
      'Avaskulär nekros'
    ],
    correctAnswer: 'Höftluxation',
    explanation: 'Shenton\'s linje är en kontinuerlig kurva längs mediala femurhalsen och överkantenav foramen obturatum. Bruten linje indikerar höftluxation eller subluxation. Används speciellt för att bedöma DDH (developmental dysplasia of the hip) hos barn. Andra viktiga linjer på höftröntgen: Hilgenreiner\'s linje, Perkin\'s linje, acetabular index.',
    learningObjectives: [
      'Känna till Shenton\'s linje',
      'Förstå dess användning vid höftluxation/DDH',
      'Veta andra viktiga röntgenlinjer i höften',
      'Kunna bedöma normal vs abnorm höft-röntgen'
    ],
    clinicalRelevance: 'Shenton\'s linje är grundläggande för att bedöma höften på röntgen. Alla läkare bör kunna identifiera och tolka den.',
    sources: [
      {
        type: 'guideline-based',
        reference: 'Tachdjian Pediatric Orthopaedics, 5th Ed., Chapter 28'
      }
    ],
    references: [
      'Tachdjian Pediatric Orthopaedics, 5th Ed., Chapter 28',
      'Pediatr Radiol. 2016;46:1195-1205 (Hip imaging)',
      'J Pediatr Orthop. 2015;35:617-622',
      'Netter\'s Atlas, Plate 487'
    ],
    estimatedTime: 60,
    keywords: ['Shenton', 'höftröntgen', 'luxation', 'DDH'],
    relatedTopics: ['Radiologi', 'Höftdiagnostik', 'DDH'],
    socialstyrelseMål: ['MK5']
  },

  // MORE CLINICAL MEDICINE
  {
    id: 'kp-clin-001',
    examType: 'kunskapsprovet',
    domain: 'trauma',
    difficulty: 'standard',
    question: 'Vilken är den vanligaste frakturen hos barn?',
    options: [
      'Suprakondylär humerusfraktur',
      'Distal radiusfraktur (buckle/torus)',
      'Tibiafraktur',
      'Femurfraktur'
    ],
    correctAnswer: 'Distal radiusfraktur (buckle/torus)',
    explanation: 'Distal radiusfraktur är den absolut vanligaste barnfrakturen (40-50% av alla barnfrakturer). Buckle/torus-fraktur (kompressionsfraktur av cortex) vanligast, följt av greenstick (inkomplett fraktur). Mekanism: fall på utsträckt hand (FOOSH). Suprakondylära humerusfrakturer är vanligaste armbågsfraktur men totalt mindre vanliga än radius.',
    learningObjectives: [
      'Veta vanligaste barnfrakturer',
      'Känna till frakturtyper hos barn (buckle, greenstick)',
      'Förstå att barn har andra frakturmönster än vuxna',
      'Veta mekanismer för vanliga barnfrakturer'
    ],
    clinicalRelevance: 'Barnfrakturer skiljer sig från vuxna pga tillväxtzoner. Kännedom om vanliga typer och behandling är viktigt för alla läkare.',
    sources: [
      {
        type: 'guideline-based',
        reference: 'Tachdjian Pediatric Orthopaedics, 5th Ed.'
      }
    ],
    references: [
      'Tachdjian Pediatric Orthopaedics, 5th Ed., Chapter 31',
      'J Pediatr Orthop. 2013;33:221-226',
      'BMJ. 2016;352:i1824 (Childhood fractures)',
      'Lancet. 2016;387:1645-1656'
    ],
    estimatedTime: 45,
    keywords: ['barnfraktur', 'buckle', 'radius', 'vanligaste'],
    relatedTopics: ['Barnfrakturer', 'Epidemiologi', 'Distal radius'],
    socialstyrelseMål: ['MK5']
  }
];

export const kunskapsprovQuestionsByCategory = {
  anatomy: kunskapsprovQuestions.filter(q => q.keywords.includes('anatomi')),
  physiology: kunskapsprovQuestions.filter(q => q.keywords.includes('fysiologi') || q.keywords.includes('metabol')),
  pharmacology: kunskapsprovQuestions.filter(q => q.keywords.includes('NSAID') || q.keywords.includes('farmakologi')),
  diagnostics: kunskapsprovQuestions.filter(q => q.keywords.includes('diagnos') || q.keywords.includes('röntgen')),
  pediatrics: kunskapsprovQuestions.filter(q => q.keywords.includes('barn')),
  infections: kunskapsprovQuestions.filter(q => q.keywords.includes('infektion')),
  rheumatology: kunskapsprovQuestions.filter(q => q.keywords.includes('artrit')),
};
