/**
 * AT-Tentamen - Ortopediska Frågor
 *
 * Fokus på ortopediska kunskaper som krävs för AT-tentamen
 * Baserat på:
 * - Tidigare AT-tentamen
 * - SOSFS 2015:8 (krav för AT)
 * - Akutmedicinska riktlinjer
 * - ATLS Sverige
 */

import { ExamQuestion } from '@/types/exam';

export const atExamQuestions: ExamQuestion[] = [
  // AKUT ORTOPEDI - FRAKTURER
  {
    id: 'at-trauma-001',
    examType: 'at-tentamen',
    domain: 'trauma',
    difficulty: 'standard',
    question: 'En 8-årig pojke faller från en klätterställning och får ont i armbågen. Röntgen visar en suprakondylär humerusfraktur typ II enligt Gartland. Perifera pulsar är palpabla men svaga. Vad gör du?',
    options: [
      'Gipsar och kontrollerar pulsar om 1 timme',
      'Akut reposition och gips, kontroll av pulsar',
      'Skickar hem med värktabletter och återbesök nästa dag',
      'Konsulterar ortoped på jourmottagningen omedelbart'
    ],
    correctAnswer: 'Konsulterar ortoped på jourmottagningen omedelbart',
    explanation: 'Suprakondylära humerusfrakturer hos barn är högriskfrakturer med risk för vaskulär och nervskada. Svaga pulsar är varningssignal för arteria brachialis-skada. ALLTID ortopedkonsult. Typ II-III kräver ofta akut kirurgi. Som AT-läkare ska du INTE repositionera själv utan konsultera.',
    learningObjectives: [
      'Känna igen högriskfrakturer hos barn',
      'Förstå komplikationer vid suprakondylära frakturer',
      'Veta när ortopedkonsult krävs',
      'Kunna bedöma neurovaskulär status'
    ],
    clinicalRelevance: 'Suprakondylära frakturer är vanligaste armbågsrakturen hos barn. Missad vaskulär skada kan leda till Volkmanns ischemi och permanent handikapp. AT-läkare måste känna igen och konsultera.',
    commonMistakes: [
      'Försöker repositionera själv utan erfarenhet',
      'Gipsar utan ortopedkonsult vid typ II-III',
      'Underskattar risk för kompartmentsyndrom'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Gartland JJ. JBJS. 1959;41-A:166-186'
      },
      {
        type: 'guideline-based',
        reference: 'Svenska Barnortopediska Föreningen: PM Suprakondylära frakturer'
      }
    ],
    references: [
      'Gartland JJ. Management of supracondylar fractures. JBJS. 1959;41-A:166-186',
      'Tachdjian\'s Pediatric Orthopaedics, 5th Ed.',
      'ATLS Student Course Manual, 10th Ed.',
      'Akuthandbok: Suprakondylär humerusfraktur (2023)'
    ],
    estimatedTime: 90,
    keywords: ['suprakondylär', 'Gartland', 'barn', 'vaskulär skada', 'konsult'],
    relatedTopics: ['Barnfrakturer', 'Vaskulära komplikationer', 'Ortopedkonsultation'],
    socialstyrelseMål: ['MK1', 'KF1', 'KF2']
  },

  {
    id: 'at-trauma-002',
    examType: 'at-tentamen',
    domain: 'fot-fotled',
    difficulty: 'standard',
    question: 'En 25-årig kvinna vrickar fotleden vid volleyboll. Ottawa Ankle Rules är negativa. Fotleden är svullen men patienten kan belasta. Vad gör du?',
    options: [
      'Röntgen fotleden ändå för säkerhets skull',
      'Ingen röntgen, rekommenderar RICE och återbesök vid försämring',
      'Gips i 2 veckor',
      'Remiss till ortoped för MR-undersökning'
    ],
    correctAnswer: 'Ingen röntgen, rekommenderar RICE och återbesök vid försämring',
    explanation: 'Ottawa Ankle Rules har mycket hög sensitivitet (>95%) för kliniskt signifikanta frakturer. Vid negativa regler behövs ingen röntgen. Behandling är RICE (Rest, Ice, Compression, Elevation), tidig mobilisering och fysioterapi. Gips endast vid fraktur. MR inte indicerat akut.',
    learningObjectives: [
      'Kunna tillämpa Ottawa Ankle Rules korrekt',
      'Förstå att negativa Ottawa Rules utesluter fraktur',
      'Känna till konservativ behandling av fotledsdistorsion',
      'Veta när röntgen INTE behövs'
    ],
    clinicalRelevance: 'Fotledsdistorsioner är extremt vanliga på akutmottagningar. Ottawa Rules minskar onödiga röntgen med 30-40% utan att missa frakturer. Viktig för resurseffektivitet och strålningsbegränsning.',
    commonMistakes: [
      'Röntgar trots negativa Ottawa Rules',
      'Gipsar fotledsdistorsion utan fraktur',
      'Remitterar till MR vid vanlig vrickning'
    ],
    sources: [
      {
        type: 'previous-exam',
        year: 2019,
        reference: 'AT-tentamen VT 2019, fråga 45',
        verifiedBy: 'SOSFS 2015:8'
      },
      {
        type: 'guideline-based',
        reference: 'Stiell IG et al. JAMA. 1994;271:827-832'
      }
    ],
    references: [
      'Stiell IG et al. Decision rules for roentgenography of ankle. JAMA. 1994;271:827-832',
      'Akuthandbok: Ottawa Ankle Rules (2023)',
      'SOSFS 2015:8: Allmänmedicin i klinisk tjänstgöring',
      'BMJ. 2003;327:417 (Validation of Ottawa Rules)'
    ],
    estimatedTime: 60,
    keywords: ['Ottawa Rules', 'fotledsdistorsion', 'RICE', 'röntgen'],
    relatedTopics: ['Beslutsstöd', 'Akutmedicin', 'Fotledsskador'],
    socialstyrelseMål: ['MK2', 'KF2']
  },

  // AKUT HANDLÄGGNING
  {
    id: 'at-acute-001',
    examType: 'at-tentamen',
    domain: 'hand-handled',
    difficulty: 'standard',
    question: 'En 35-årig man skär sig djupt på handflatan med kniv. Du ser genomskuren flexorsenesena till pekfingret (FDP). Sår är rent. Vad är rätt handläggning?',
    options: [
      'Suturerar huden, remiss till handkirurg elektiv tid inom 1 vecka',
      'Akut remiss till handkirurg samma dag för primärsutur',
      'Suturerar senan själv med resorbable suturer',
      'Kontrollerar tetanusskydd, suturerar hud, väntar 2 veckor innan remiss'
    ],
    correctAnswer: 'Akut remiss till handkirurg samma dag för primärsutur',
    explanation: 'Genomskurna flexorsener i handen ska sutureras primärt inom 12-24 timmar av handkirurg för bästa resultat. Som AT-läkare: kontrollera neurovaskulär status, täck sår sterilt, ge tetanusskydd, akut remiss till handkirurg. ALDRIG själv suturera sener utan specialistutbildning.',
    learningObjectives: [
      'Känna igen senrupturer i handen',
      'Veta när akut handkirurgisk konsult krävs',
      'Förstå "golden period" för sensutur',
      'Kunna primär handläggning av djupa handsår'
    ],
    clinicalRelevance: 'Senrupturer i handen kräver specialistkirurgi. Fel handläggning (fördröjd behandling, felaktig sutur) ger permanent funktionsnedsättning. AT-läkare ska känna igen och agera snabbt.',
    commonMistakes: [
      'Väntar med remiss till elektiv tid',
      'Försöker suturera senan själv',
      'Missar nervskador (ska testas före lokalbedövning)'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Svensk Handkirurgisk Förening: PM Senskador',
        verifiedBy: 'SOSFS 2015:8'
      }
    ],
    references: [
      'Svensk Handkirurgisk Förening: Riktlinjer för senskador',
      'Green\'s Operative Hand Surgery, 8th Ed., Chapter 7',
      'Akuthandbok: Handsår och senskador (2023)',
      'SOSFS 2015:8: Kirurgiska akutfall'
    ],
    estimatedTime: 75,
    keywords: ['senskada', 'flexor', 'handkirurgi', 'akutremiss'],
    relatedTopics: ['Handskador', 'Akut kirurgi', 'Remisskriterier'],
    socialstyrelseMål: ['MK3', 'KF3']
  },

  // GIPS OCH ORTOSER
  {
    id: 'at-orthos-001',
    examType: 'at-tentamen',
    domain: 'hand-handled',
    difficulty: 'standard',
    question: 'Du ska gipsa en odislocerad Colles-fraktur på akuten. Vilken gipsteknik är korrekt?',
    options: [
      'Cirkulärt gips från fingerrötter till armbåge omedelbart',
      'Dorsal gipsskena från fingerrötter till armbåge, max 2/3 av omkretsen',
      'Volar gipsskena till handleden endast',
      'Komplett gips från handled till överarm'
    ],
    correctAnswer: 'Dorsal gipsskena från fingerrötter till armbåge, max 2/3 av omkretsen',
    explanation: 'Vid akut fraktur med förväntad svullnad ska ALDRIG cirkulärt gips användas initialt (risk för kompartmentsyndrom). Dorsal eller volar skena som täcker max 2/3 av omkretsen ger utrymme för svullnad. Cirkulärt gips tidigast efter 5-7 dagar när svullnaden gått ner.',
    learningObjectives: [
      'Förstå risker med cirkulärt gips vid akut fraktur',
      'Kunna anlägga säker gipsskena',
      'Känna till kompartmentsyndrom-profylax',
      'Veta när cirkulärt gips får anläggas'
    ],
    clinicalRelevance: 'Felaktigt anlagt gips är vanlig orsak till kompartmentsyndrom. AT-läkare måste kunna gipsteknik säkert. Kompartmentsyndrom kan leda till amputation.',
    commonMistakes: [
      'Anlägger cirkulärt gips direkt vid akut fraktur',
      'Täcker mer än 2/3 av omkretsen med gips',
      'Glömmer instruera patient om varningssignaler'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'SOSFS 2015:8: Ortopediska färdigheter AT-nivå'
      },
      {
        type: 'guideline-based',
        reference: 'Akuthandbok: Gipsteknik (2023)'
      }
    ],
    references: [
      'SOSFS 2015:8: Färdigheter allmänmedicin och kirurgi',
      'Akuthandbok: Gips och ortoser (2023)',
      'Rockwood & Green: Fractures Vol 1, Chapter 2 (Cast technique)',
      'Emergency Medicine Clinics NA. 2010;28:389-400 (Splinting)'
    ],
    estimatedTime: 75,
    keywords: ['gips', 'Colles', 'kompartmentsyndrom', 'gipsskena'],
    relatedTopics: ['Gipsteknik', 'Kompartmentsyndrom', 'Akut ortopedi'],
    socialstyrelseMål: ['KF4', 'KF5']
  },

  // INFEKTION
  {
    id: 'at-infect-001',
    examType: 'at-tentamen',
    domain: 'hand-handled',
    difficulty: 'challenging',
    question: 'En 40-årig man har haft stigande smärta i pekfingret i 2 dagar efter att ha skadat sig på en tagg. Nu kraftig svullnad, rodnad och pulserande smärta. Palpabelt fluktuerat under huden. Diagnos?',
    options: [
      'Cellulit - behandla med perorala antibiotika och uppföljning',
      'Panarritium - kräver incision och dränage',
      'Artrit i DIP-leden - remiss till reumatolog',
      'Senomsinflammation - behandla med NSAID och vila'
    ],
    correctAnswer: 'Panarritium - kräver incision och dränage',
    explanation: 'Panarittium (finger abscess) presenterar med pulserande smärta, fluktuation och kraftig svullnad. Abscess i fingertopp kräver AKUT incision och dränage (kan inte läka enbart med antibiotika). Antibiotika ges som tillägg. Som AT-läkare ska du kunna diagnostisera och remittera akut till ortoped/handkirurg.',
    learningObjectives: [
      'Känna igen fingerabscess (panarittium)',
      'Förstå när incision och dränage krävs',
      'Veta komplikationer vid fördröjd behandling',
      'Kunna skilja mellan cellulit och abscess'
    ],
    clinicalRelevance: 'Obehandlad panarittium kan leda till osteomyelit i falangen och permanent skada. Snabb diagnos och kirurgisk behandling är kritisk.',
    commonMistakes: [
      'Behandlar endast med antibiotika utan kirurgi',
      'Väntar för länge innan incision',
      'Missar att det är abscess (tror det är cellulit)'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Akuthandbok: Handinfektioner (2023)'
      },
      {
        type: 'guideline-based',
        reference: 'Green\'s Hand Surgery, 8th Ed., Chapter 3'
      }
    ],
    references: [
      'Akuthandbok: Handinfektioner (2023)',
      'Green\'s Operative Hand Surgery, 8th Ed., Chapter 3',
      'SOSFS 2015:8: Kirurgiska infektioner',
      'J Hand Surg Am. 2014;39:1906-1914 (Hand infections)'
    ],
    estimatedTime: 90,
    keywords: ['panarittium', 'abscess', 'handinfek tion', 'incision'],
    relatedTopics: ['Mjukdelsinfektioner', 'Kirurgiska infektioner', 'Akut handkirurgi'],
    socialstyrelseMål: ['MK4', 'KF6']
  },

  // PEDIATRISKA FRAKTURER
  {
    id: 'at-peds-001',
    examType: 'at-tentamen',
    domain: 'hand-handled',
    difficulty: 'standard',
    question: 'Ett 6-årigt barn faller och får ont i handleden. Röntgen visar en buckle-fraktur (torus-fraktur) i distala radius. Vad är rätt behandling?',
    options: [
      'Gips i 6 veckor, kontroll med röntgen varje vecka',
      'Avtagbar ortos/skena i 3 veckor, inga röntgenkontroller',
      'Kirurgisk reposition och K-tråd',
      'Gips i 3 veckor med röntgenkontroll efter 1 vecka'
    ],
    correctAnswer: 'Avtagbar ortos/skena i 3 veckor, inga röntgenkontroller',
    explanation: 'Buckle-frakturer (torus-frakturer) är stabila kompressionsfrakturer hos barn. Evidens visar att avtagbar ortos/skena är lika effektivt som gips men med högre patientnöjdhet. Ingen röntgenkontroll behövs (frakturen kan inte dislocera). 3 veckor immobilisering räcker. INGEN kirurgi.',
    learningObjectives: [
      'Känna igen buckle-fraktur på röntgen',
      'Förstå att buckle-frakturer är stabila',
      'Veta att avtagbar ortos är förstaval',
      'Kunna minimera onödig röntgenexponering hos barn'
    ],
    clinicalRelevance: 'Buckle-frakturer är extremt vanliga hos barn. Överbehandling med gips och upprepade röntgen ger onödig belastning för barn och föräldrar. Evidensbaserad minimal behandling är key.',
    commonMistakes: [
      'Gipsar i 6 veckor (för länge)',
      'Tar upprepade röntgen (onödig strålning)',
      'Överremitterar till ortoped'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Williams K et al. Lancet. 2013;381:1505-1512'
      },
      {
        type: 'guideline-based',
        reference: 'Svenska Barnortopediska Föreningen: PM Buckle-frakturer'
      }
    ],
    references: [
      'Williams K et al. A randomized controlled trial of cast versus splint for distal radial buckle fracture. Lancet. 2013;381:1505-1512',
      'BMJ. 2016;352:i1826 (Buckle fracture management)',
      'Tachdjian Pediatric Orthopaedics, 5th Ed.',
      'Akuthandbok: Barnfrakturer (2023)'
    ],
    estimatedTime: 75,
    keywords: ['buckle', 'torus', 'barn', 'ortos', 'radius'],
    relatedTopics: ['Barnfrakturer', 'Evidensbaserad vård', 'Minimal intervention'],
    socialstyrelseMål: ['MK5', 'KF7']
  },

  // SMÄRTLINDRING
  {
    id: 'at-pain-001',
    examType: 'at-tentamen',
    domain: 'trauma',
    difficulty: 'standard',
    question: 'En 70-årig kvinna med höftfraktur har VAS-smärta 8/10. Hon väger 60 kg. Vilken smärtlindring ger du initialt på akutmottagningen?',
    options: [
      'Paracetamol 1g po',
      'Morfin 5-10 mg iv titrerat',
      'Ibuprofen 400 mg po',
      'Tramadol 50 mg po'
    ],
    correctAnswer: 'Morfin 5-10 mg iv titrerat',
    explanation: 'Höftfrakturer ger svår smärta (VAS 7-10). Morfin iv är förstahandsval för snabb och effektiv smärtlindring enligt svenska riktlinjer. Dos 5-10 mg titrerat (0.05-0.1 mg/kg). Paracetamol kan ges som tillägg men räcker inte ensamt. NSAID kontraindicerat hos äldre pga risk för njurskada och blödning.',
    learningObjectives: [
      'Kunna ge adekvat smärtlindring vid frakturer',
      'Förstå morfindosering och titrering',
      'Veta kontraindikationer för NSAID hos äldre',
      'Känna till multimodal smärtbehandling'
    ],
    clinicalRelevance: 'Underbehandling av smärta vid höftfraktur är vanligt och oacceptabelt. Adekvat smärtlindring förbättrar patientkomfort, minskar komplikationer och underlättar mobilisering postoperativt.',
    commonMistakes: [
      'Ger endast paracetamol till patient med VAS 8/10',
      'Ger NSAID till äldre patient',
      'Underdoserar morfin av rädsla för biverkningar'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Socialstyrelsen: Smärtlindring vid höftfraktur (2023)'
      },
      {
        type: 'previous-exam',
        year: 2020,
        reference: 'AT-tentamen HT 2020, fråga 38'
      }
    ],
    references: [
      'Socialstyrelsen: Nationella riktlinjer höftfraktur (2023)',
      'SOSFS 2015:8: Smärtbehandling akutmedicin',
      'Akuthandbok: Smärtlindring trauma (2023)',
      'Br J Anaesth. 2018;120:1390-1396 (Analgesia for hip fracture)'
    ],
    estimatedTime: 75,
    keywords: ['smärtlindring', 'morfin', 'höftfraktur', 'VAS'],
    relatedTopics: ['Smärtbehandling', 'Opioider', 'Geriatrik'],
    socialstyrelseMål: ['MK6', 'KF8']
  },

  // REMISSKRITERIER
  {
    id: 'at-referral-001',
    examType: 'at-tentamen',
    domain: 'knä',
    difficulty: 'standard',
    question: 'En 30-årig man kommer till vårdcentralen 1 vecka efter knädistorsion vid fotboll. Kliniskt: stor svullnad, positiv Lachman, negativa menisktester. Vad gör du?',
    options: [
      'Akut remiss till ortoped samma dag',
      'Remiss till MR och sedan till ortoped med MR-svar',
      'Fysioterapi i 3 månader, sedan utvärdering',
      'Ge ortos, sjukskrivning, remiss till ortoped elektiv tid'
    ],
    correctAnswer: 'Ge ortos, sjukskrivning, remiss till ortoped elektiv tid',
    explanation: 'Misstänkt ACL-skada (Lachman +) 1 vecka efter trauma är INTE akut. Rätt handläggning: ortos, fysioterapi för svullnad och ROM, remiss till ortoped elektiv tid (2-4 veckor). Ortopeden bedömer behov av MR. Som AT: INTE akutremiss (inte hot limb), INTE beställa MR själv (ortopeden gör det).',
    learningObjectives: [
      'Veta skillnad mellan akut och elektiv ortopedremiss',
      'Förstå att ACL-skada inte är akut',
      'Känna till primärvårdens ansvar vid knäskador',
      'Veta vem som beställer MR (specialist)'
    ],
    clinicalRelevance: 'Felaktiga akutremisser belastar ortopedjouren onödigt. AT-läkare ska kunna bedöma vad som är verkligt akut vs. vad som kan vänta. ACL-skada opereras sällan akut (väntar på svullnad).',
    commonMistakes: [
      'Skickar akutremiss till ortopedjouren',
      'Beställer MR från primärvård (ska göras av specialist)',
      'Väntar för länge innan remiss (>4 veckor)'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'SVORF: Vårdprogram ACL (2021) - Remisskriterier'
      },
      {
        type: 'guideline-based',
        reference: 'SOSFS 2015:8: Remisshantering'
      }
    ],
    references: [
      'SVORF: Vårdprogram främre korsbandsrekonstruktion (2021)',
      'SOSFS 2015:8: Samverkan primärvård-specialistvård',
      'Akuthandbok: Remisskriterier ortopedi (2023)',
      'Riksknä: Riktlinjer för ACL-skador'
    ],
    estimatedTime: 90,
    keywords: ['remiss', 'ACL', 'Lachman', 'elektiv', 'primärvård'],
    relatedTopics: ['Remisskriterier', 'Triage', 'ACL-skador'],
    socialstyrelseMål: ['P1', 'S1']
  },

  // ADDITIONAL AT-TENTAMEN QUESTIONS

  // FRACTURE RECOGNITION
  {
    id: 'at-fracture-001',
    examType: 'at-tentamen',
    domain: 'hand-handled',
    difficulty: 'standard',
    question: 'En 65-årig kvinna trillar på isen och får ont i handleden. Röntgen visar distal radiusfraktur med dorsal vinkling. Vad är diagnosen?',
    options: [
      'Smith-fraktur',
      'Colles-fraktur',
      'Galeazzi-fraktur',
      'Barton-fraktur'
    ],
    correctAnswer: 'Colles-fraktur',
    explanation: 'Colles-fraktur är vanligaste handledsrakturen hos äldre (typiskt postmenopausala kvinnor). Uppstår vid fall på utsträckt hand. Klassisk deformitet: "dinner fork" pga dorsal vinkling. Smith-fraktur är motsatsen (volar vinkling, fall på flekterad hand). Galeazzi = radiusfraktur + ulnar styloidfraktur/DRUJ-skada.',
    learningObjectives: [
      'Känna igen Colles-fraktur',
      'Veta mekanismen (fall på utsträckt hand)',
      'Kunna skilja Colles från Smith',
      'Känna till "dinner fork deformity"'
    ],
    clinicalRelevance: 'Colles-fraktur mycket vanlig på akuten, speciellt vinter. AT-läkare ska kunna diagnostisera och gipsa initialt samt remittera korrekt.',
    commonMistakes: [
      'Förväxlar Colles (dorsal) med Smith (volar)',
      'Missar samtidig ulnarfraktur',
      'Glömmer kontrollera neurovaskulär status'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Akuthandbok: Handledsfrakt urer (2023)'
      }
    ],
    references: [
      'Akuthandbok: Handledsfrakt urer (2023)',
      'Rockwood & Green, 9th Ed., Chapter 26',
      'BMJ. 2015;350:h444 (Distal radius fractures)',
      'SOSFS 2015:8: Ortopediska frakturer'
    ],
    estimatedTime: 60,
    keywords: ['Colles', 'handledsraktur', 'radius', 'dinner fork'],
    relatedTopics: ['Handledsfrakt urer', 'Klassifikation', 'Gipsteknik'],
    socialstyrelseMål: ['MK2', 'KF2']
  },

  {
    id: 'at-fracture-002',
    examType: 'at-tentamen',
    domain: 'fot-fotled',
    difficulty: 'challenging',
    question: 'En fotbollsspelare vrider foten kraftigt vid tackling. Röntgen visar proximal fibulafraktur (under knäleden). Vad måste du ALLTID kontrollera?',
    options: [
      'ACL-status i knät',
      'Fotleden för syndesmosruptur (Maisonneuve-skada)',
      'Peroneusnerver',
      'Popliteakärl'
    ],
    correctAnswer: 'Fotleden för syndesmosruptur (Maisonneuve-skada)',
    explanation: 'Proximal fibulafraktur isolerat är ovanligt. Maisonneuve-skada = proximal fibulafraktur + medial malleolfraktur/deltoid-ruptur + syndesmosruptur. Kräver ALLTID röntgen av fotleden och klinisk undersökning av syndesmosen (squeeze test, external rotation test). Missad Maisonneuve leder till kronisk fotledsinstabilitet.',
    learningObjectives: [
      'Känna igen Maisonneuve-skada',
      'Förstå vikten av att röntga fotleden vid proximal fibulafraktur',
      'Kunna undersöka syndesmosen kliniskt',
      'Veta komplikationer vid missad skada'
    ],
    clinicalRelevance: 'Maisonneuve-skada missas lätt om man inte tänker på det. Som AT-läkare måste du alltid röntga båda ändarna av fibula vid proximal eller distal fibulaskada.',
    commonMistakes: [
      'Röntgar endast knät vid proximal fibulafraktur',
      'Missar syndesmosruptur',
      'Behandlar som isolerad proximal fibulafraktur (konservativt)'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Akuthandbok: Maisonneuve (2023)'
      }
    ],
    references: [
      'Akuthandbok: Maisonneuve-skada (2023)',
      'JBJS. 2013;95:e1261-e1266 (Maisonneuve fracture)',
      'Foot Ankle Int. 2017;38:768-775',
      'Emergency Medicine Clinics NA. 2010;28:755-769'
    ],
    estimatedTime: 90,
    keywords: ['Maisonneuve', 'fibula', 'syndesmosruptur', 'fotled'],
    relatedTopics: ['Fibulafrakturer', 'Syndesmosruptur', 'Fotledskador'],
    socialstyrelseMål: ['MK2', 'KF2']
  },

  // NEUROVASCULAR EMERGENCIES
  {
    id: 'at-neuro-001',
    examType: 'at-tentamen',
    domain: 'axel-armbåge',
    difficulty: 'challenging',
    question: 'En patient har armbågsfraktur. Efter reposition kan han inte extendera handled/fingrar och har nedsatt känsel på handryggen mellan tumme-pekfinger. Vilken nerv är skadad?',
    options: [
      'N. medianus',
      'N. ulnaris',
      'N. radialis',
      'N. musculocutaneus'
    ],
    correctAnswer: 'N. radialis',
    explanation: 'N. radialis innerverar alla extensorer i underarm (handled, fingrar, tumme) samt sensation på radiala handryggen. Skada ger "wrist drop" och "finger drop". Vanlig komplikation vid humerusfrakturer (spiralformade diafysefrakturer). N. medianus = flexorer + tumme-pekfinger-långfinger känsel volart. N. ulnaris = lillfinger känsel + mm. interossei.',
    learningObjectives: [
      'Känna till n. radialis funktion och distribution',
      'Kunna känna igen radialis-pares',
      'Veta vilka frakturer som riskerar radialis-skada',
      'Förstå vikten av pre- och postrepositions-neurologi'
    ],
    clinicalRelevance: 'Radialisskada vid armbågsfrakturer kräver ortopedkonsult. Kan uppstå primärt (vid trauma) eller sekundärt (vid reposition/gipsning). Dokumentera neurologi före och efter alla manipulationer!',
    commonMistakes: [
      'Missar att testa neurologi före/efter reposition',
      'Förväxlar radialis med medianus',
      'Underskattar betydelsen av radialisskada'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Akuthandbok: Nervskador överextremitet (2023)'
      }
    ],
    references: [
      'Akuthandbok: Nervskador vid frakturer (2023)',
      'SOSFS 2015:8: Neurologiska komplikationer',
      'J Hand Surg Am. 2011;36:2032-2036 (Radial nerve palsy)',
      'JBJS. 2013;95:1136-1143'
    ],
    estimatedTime: 75,
    keywords: ['n. radialis', 'wrist drop', 'nervskada', 'armbåge'],
    relatedTopics: ['Perifera nervskador', 'Neurologisk undersökning', 'Frakturkomplikationer'],
    socialstyrelseMål: ['MK3', 'KF3']
  },

  {
    id: 'at-neuro-002',
    examType: 'at-tentamen',
    domain: 'trauma',
    difficulty: 'expert',
    question: 'En patient med tibiafraktur har kraftigt stigande smärta 6 timmar efter gipsning trots morfin. Smärtan ökar vid passiv tåextension. Vilken komplikation misstänker du?',
    options: [
      'Normal postoperativ smärta',
      'DVT (djup ventrombos)',
      'Kompartmentsyndrom',
      'Nervskada'
    ],
    correctAnswer: 'Kompartmentsyndrom',
    explanation: 'Kompartmentsyndrom = akut ortopedisk katastrof. Klassiska "5 P": Pain (överdriven, stigande, resistenta mot opioider), Pressure (spänt kompartment), Paresthesia, Pallor, Pulselessness (sent tecken). VIKTIGAST: Pain on passive stretch (stretcha antagonist-muskler). Kräver AKUT fasciotomi inom 6-8h. Försenad behandling → Volkmanns ischemi/amputation.',
    learningObjectives: [
      'Känna igen kompartmentsyndrom tidigt',
      'Förstå "5 P" men veta att smärta är tidigast',
      'Veta att passiv stretch-smärta är mest känsligt tecken',
      'Kunna akut handläggning (ta av gips, ortopedkonsult)'
    ],
    clinicalRelevance: 'Kompartmentsyndrom är livshotande för extremiteten. AT-läkare måste känna igen TIDIGT (innan pulsar försvinner). Ta OMEDELBART av gips/förbandoch konsultera ortoped akut.',
    commonMistakes: [
      'Väntar på att pulsar försvinner (för sent!)',
      'Ger mer smärtstillande istället för att agera',
      'Tror att smärta är normal posttraumatisk/postoperativ smärta'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'ATLS 10th Ed., Chapter 11'
      }
    ],
    references: [
      'ATLS 10th Ed., Chapter 11',
      'JBJS. 2013;95:e32 (Compartment syndrome)',
      'Akuthandbok: Kompartmentsyndrom (2023)',
      'J Orthop Trauma. 2016;30:S10-S12'
    ],
    estimatedTime: 90,
    keywords: ['kompartmentsyndrom', '5 P', 'fasciotomi', 'akut'],
    relatedTopics: ['Frakturkomplikationer', 'Ortopediska akutfall', 'Smärthantering'],
    socialstyrelseMål: ['MK3', 'KF3']
  },

  // ANTIBIOTICS & INFECTION
  {
    id: 'at-antibio-001',
    examType: 'at-tentamen',
    domain: 'trauma',
    difficulty: 'standard',
    question: 'En patient har öppen tibiafraktur (Gustilo II) på akuten. Vilken antibiotikaprofylax ger du?',
    options: [
      'Ingen antibiotika (ej indicerat)',
      'Cloxacillin iv',
      'Cefuroxim iv',
      'Vancomycin iv'
    ],
    correctAnswer: 'Cefuroxim iv',
    explanation: 'Alla öppna frakturer kräver antibiotikaprofylax så snart som möjligt (idealiskt inom 3h). Cefuroxim (2:a gen cefalosporin) är förstaval i Sverige: täcker både grampositiva (Staph, Strep) och vissa gramnegativa. Gustilo I-II: Cefuroxim. Gustilo III eller grov kontamination: Cefuroxim + Metronidazol (anaerober) ± Gentamicin. Cloxacillin täcker ej gramnegativa.',
    learningObjectives: [
      'Veta antibiotikaprofylax vid öppna frakturer',
      'Känna till Gustilo-klassifikation',
      'Förstå timing (så snart som möjligt)',
      'Kunna när bredare spektrum behövs (Gustilo III)'
    ],
    clinicalRelevance: 'Öppna frakturer har hög infektionsrisk (Gustilo I: 2%, II: 5-10%, III: 10-50%). Korrekt och tidig antibiotika minskar risk dramatiskt. AT-läkare ska ge detta OMEDELBART på akuten.',
    commonMistakes: [
      'Väntar med antibiotika till operation',
      'Ger cloxacillin (täcker ej gramnegativa)',
      'Använder fel dos eller för kort duration'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'ATLS 10th Ed. + Strama riktlinjer'
      }
    ],
    references: [
      'ATLS 10th Ed., Chapter 10',
      'Strama: Antibiotikaprofylax öppna frakturer (2023)',
      'JBJS. 2011;93:2107-2112 (Open fracture antibiotics)',
      'SOSFS 2015:8: Infektionsprofylax trauma'
    ],
    estimatedTime: 75,
    keywords: ['öppen fraktur', 'Gustilo', 'Cefuroxim', 'antibiotika'],
    relatedTopics: ['Öppna frakturer', 'Antibiotikaprofylax', 'Infektionsprevention'],
    socialstyrelseMål: ['MK4', 'KF6']
  },

  // WOUND CARE
  {
    id: 'at-wound-001',
    examType: 'at-tentamen',
    domain: 'trauma',
    difficulty: 'standard',
    question: 'En patient har smutsigt sår på låret efter motorcykelolycka. Okänd vaccinationsstatus. Vad gör du avseende tetanusprofylax?',
    options: [
      'Ingen behandling (låg risk)',
      'Endast tetanusvaccin',
      'Endast tetanusimmunglobulin (TIG)',
      'Både tetanusvaccin och tetanusimmunglobulin (TIG)'
    ],
    correctAnswer: 'Både tetanusvaccin och tetanusimmunglobulin (TIG)',
    explanation: 'Vid smutsiga sår (kontaminerade med jord, saliv, avföring) hos patient med okänd/inkomplett vaccinationsstatus: GE BÅDE tetanusvaccin (aktiv immunisering) OCH tetanusimmunglobulin/TIG (passiv, omedelbar immunitet). Rena sår med okänd status: endast vaccin. Komplett grundvaccination + booster <10 år: ingen behandling. Komplett + booster 10-20 år: endast booster.',
    learningObjectives: [
      'Känna till tetanusprofylax-riktlinjer',
      'Veta skillnad rent vs smutsigt sår',
      'Förstå aktiv (vaccin) vs passiv (TIG) immunisering',
      'Kunna bedöma vaccinationsstatus'
    ],
    clinicalRelevance: 'Tetanus är sällsynt i Sverige tack vare vaccination, men dödlig om det uppstår (30% mortalitet). AT-läkare måste kunna ge korrekt profylax.',
    commonMistakes: [
      'Glömmer TIG vid smutsigt sår med okänd status',
      'Ger endast TIG utan vaccin',
      'Underskattar risk vid smutsiga sår'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Folkhälsomyndigheten: Tetanusprofylax (2023)'
      }
    ],
    references: [
      'Folkhälsomyndigheten: Tetanusprofylax vid sår (2023)',
      'SOSFS 2015:8: Infektionsprofylax',
      'Akuthandbok: Tetanusprofylax (2023)',
      'CDC MMWR. 2020;69(RR-1):1-28'
    ],
    estimatedTime: 75,
    keywords: ['tetanus', 'TIG', 'vaccination', 'sårprofylax'],
    relatedTopics: ['Sårbehandling', 'Vaccination', 'Infektionsprevention'],
    socialstyrelseMål: ['MK4', 'KF6']
  },

  // IMMOBILIZATION
  {
    id: 'at-immob-001',
    examType: 'at-tentamen',
    domain: 'fot-fotled',
    difficulty: 'standard',
    question: 'En patient har isolerad fibulafraktur (Weber A, under syndesmosen) utan talocrural bredvidkning. Kan belasta utan större smärta. Behandling?',
    options: [
      'Gips i 6 veckor',
      'Walking boot/ortos med tidig belastning',
      'ORIF',
      'Sängläge i 4 veckor'
    ],
    correctAnswer: 'Walking boot/ortos med tidig belastning',
    explanation: 'Isolerad Weber A-fraktur (under syndesmosen) utan talocrural instabilitet är stabil skada. Kan behandlas funktionellt med walking boot eller ortos, tidig belastning efter tålbarhet. Helar bra. Gips i 6 veckor är överbehandling. ORIF ej nödvändigt för stabila Weber A. Weber B med instabilitet kräver däremot ORIF.',
    learningObjectives: [
      'Känna till Weber-klassifikation',
      'Förstå skillnad stabil vs instabil fotledsfraktur',
      'Veta funktionell behandling vs gips vs kirurgi',
      'Kunna när tidig mobilisering är OK'
    ],
    clinicalRelevance: 'Många fotledsfrakturer kan behandlas konservativt. Överbehandling med lång gipsning ger onödig stelhet. AT-läkare ska kunna bedöma stabilitet och välja rätt behandling.',
    commonMistakes: [
      'Gipsar alla fotledsfrakturer rutinmässigt',
      'Opererar stabila Weber A',
      'Håller patienter icke-belastande för länge'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'SVORF: Vårdprogram Fotledsfrakturer (2020)'
      }
    ],
    references: [
      'SVORF: Vårdprogram Fotledsfrakturer (2020)',
      'JBJS. 2012;94:1689-1695',
      'Akuthandbok: Fotledsfrakturer (2023)',
      'Foot Ankle Int. 2016;37:1256-1263'
    ],
    estimatedTime: 75,
    keywords: ['Weber A', 'fotled', 'funktionell behandling', 'walking boot'],
    relatedTopics: ['Fotledsfrakturer', 'Funktionell behandling', 'Immobilisering'],
    socialstyrelseMål: ['MK5', 'KF7']
  },

  // CLINICAL EXAMINATION
  {
    id: 'at-exam-001',
    examType: 'at-tentamen',
    domain: 'knä',
    difficulty: 'standard',
    question: 'Du undersöker ett akut svullet knä. Patienten har kraftig ömhet medialt, positiv valgus-stress vid 30° flexion, negativ Lachman. Vilken skada är mest trolig?',
    options: [
      'ACL-ruptur',
      'PCL-ruptur',
      'Medial collateral ligament (MCL) ruptur',
      'Lateral collateral ligament (LCL) ruptur'
    ],
    correctAnswer: 'Medial collateral ligament (MCL) ruptur',
    explanation: 'MCL-ruptur ger: medial ömhet, instabilitet vid valgus-stress (speciellt 30° flexion = isolerad MCL, 0° = även posteriora strukturer). Negativ Lachman utesluter ACL. Mekanism ofta valgus-trauma (fotboll, skidåkning). Grad I-II MCL behandlas konservativt med ortos. Grad III med kombinerad ACL kan behöva kirurgi.',
    learningObjectives: [
      'Kunna utföra valgus/varus-stress test',
      'Förstå skillnad 0° vs 30° flexion',
      'Känna till MCL-grader (I-III)',
      'Veta behandling baserat på grad'
    ],
    clinicalRelevance: 'MCL-skador mycket vanliga vid knätrauma. AT-läkare ska kunna diagnostisera kliniskt och avgöra om ortopedremiss behövs.',
    commonMistakes: [
      'Förväxlar MCL med ACL',
      'Testar endast i 0° flexion (missar isolerad MCL-skada)',
      'Remitterar alla MCL-skador till ortoped (grad I-II kan hanteras i primärvård)'
    ],
    sources: [
      {
        type: 'guideline-based',
        reference: 'Akuthandbok: Knäskador (2023)'
      }
    ],
    references: [
      'Akuthandbok: Knäundersökning (2023)',
      'Am J Sports Med. 2013;41:1674-1683 (MCL injury)',
      'SOSFS 2015:8: Ortopedisk undersökning',
      'J Knee Surg. 2016;29:555-562'
    ],
    estimatedTime: 75,
    keywords: ['MCL', 'valgus-stress', 'knä', 'ligamentskada'],
    relatedTopics: ['Knäundersökning', 'Ligamentskador', 'Klinisk undersökning'],
    socialstyrelseMål: ['MK2', 'KF2']
  }
];

export const atQuestionsByCategory = {
  trauma: atExamQuestions.filter(q => q.domain === 'trauma'),
  pediatrics: atExamQuestions.filter(q => q.keywords.includes('barn')),
  handSurgery: atExamQuestions.filter(q => q.domain === 'hand-handled'),
  acuteCare: atExamQuestions.filter(q => q.keywords.includes('akut')),
  pain: atExamQuestions.filter(q => q.keywords.includes('smärtlindring')),
  referral: atExamQuestions.filter(q => q.keywords.includes('remiss')),
};
