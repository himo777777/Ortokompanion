import { CaseStudy } from '@/types/education';

export const caseStudies: CaseStudy[] = [
  {
    id: 'student-1',
    title: 'Handledsfraktur efter fall',
    level: 'student',
    patient: {
      age: 65,
      gender: 'Kvinna',
      complaint: 'Ont i handleden efter fall'
    },
    scenario: `En 65-årig kvinna kommer till akuten efter att ha fallit på utsträchkt hand. Hon har svår smärta i handleden och kan inte röra den. Vid undersökning ser du svullnad och deformitet vid distala radius.`,
    references: ['rockwood-9ed', 'green-8ed'],
    questions: [
      {
        id: 'q1',
        question: 'Vilken är den vanligaste frakturen vid fall på utsträckt hand hos äldre?',
        options: [
          'Scaphoidfraktur',
          'Colles fraktur',
          'Smiths fraktur',
          'Bartons fraktur'
        ],
        correctAnswer: 'Colles fraktur',
        explanation: 'Colles fraktur (distal radiusfraktur med dorsal vinkling) är den vanligaste frakturen vid fall på utsträckt hand hos äldre personer, särskilt kvinnor med osteoporos.'
      },
      {
        id: 'q2',
        question: 'Vilka strukturer måste du kontrollera vid undersökning?',
        options: [
          'Endast puls',
          'Puls, sensorik och motorik',
          'Endast motorik',
          'Endast sensorik'
        ],
        correctAnswer: 'Puls, sensorik och motorik',
        explanation: 'Det är viktigt att göra en fullständig neurovaskulär undersökning med kontroll av puls, sensorik (medianus-, ulnaris- och radialisfördel) och motorik för att utesluta nervskada eller kärlskada.'
      }
    ]
  },
  {
    id: 'at-1',
    title: 'Akut fotledsdistorsion',
    level: 'at',
    patient: {
      age: 28,
      gender: 'Man',
      complaint: 'Vridit foten vid fotbollsspel'
    },
    scenario: `En 28-årig man kommer till akuten efter att ha vridit foten vid fotbollsspel. Han har svullnad lateralt om fotleden och kan belasta med smärta. Ottawa ankle rules indikerar röntgen.`,
    references: ['sccm-ottawa-rules', 'rockwood-9ed', 'weber-1972'],
    questions: [
      {
        id: 'q1',
        question: 'Vilka är indikationerna för röntgen enligt Ottawa ankle rules?',
        explanation: 'Ottawa ankle rules säger att röntgen ska tas om det finns: 1) Ömhet över bakre delen eller spetsen av malleolerna, 2) Oförmåga att gå 4 steg direkt efter skadan och i akuten, 3) Ömhet över naviculare eller basis metatarsale 5.'
      },
      {
        id: 'q2',
        question: 'Hur behandlar du en isolerad laterlig ligamentskada utan fraktur?',
        explanation: 'Funktionell behandling rekommenderas: RICE (vila, is, kompression, elevation) initialt, följt av tidig mobilisering och styrketräning. Ortos eller bandage kan användas för stabilitet. Gips är sällan indicerat.'
      }
    ]
  },
  {
    id: 'st1-1',
    title: 'Komplex lårbensbrott',
    level: 'st1',
    patient: {
      age: 42,
      gender: 'Man',
      complaint: 'Polytrauma efter trafikolycka'
    },
    scenario: `En 42-årig man inkommer efter MC-olycka. Han har ett slutet femurbrott på vänster sida, midjeskaft. Patienten är cirkulatoriskt stabil men har betydande smärta. Röntgen visar en tvärgående fraktur i mitten av femurskaftet.`,
    references: ['atls-sverige-2022', 'rockwood-9ed', 'campbell-13ed'],
    questions: [
      {
        id: 'q1',
        question: 'Vilken är den primära behandlingsmetoden för denna frakturtyp?',
        explanation: 'Intramedullär spikoperration (märgspikning) är guldstandarden för slutna femorala skaftfrakturer hos vuxna. Detta ger stabil fixation, tillåter tidig mobilisering och har låg komplikationsrisk. Operationen bör utföras akut, helst inom 24 timmar.'
      },
      {
        id: 'q2',
        question: 'Vilka komplikationer måste du vara vaksam på postoperativt?',
        explanation: 'Viktiga komplikationer att övervaka: 1) Fettembolisyndrom (FES) - kan uppstå 24-72h postop, 2) Kompartmentsyndrom, 3) Infektion, 4) Malunion/nonunion, 5) Nervskador (n. ischiadicus). FES-triaden: andningspåverkan, neurologiska symtom, petekier.'
      }
    ]
  },
  {
    id: 'st3-1',
    title: 'Primär total höftledsplastik',
    level: 'st3',
    patient: {
      age: 68,
      gender: 'Kvinna',
      complaint: 'Svår höftledsartros'
    },
    scenario: `En 68-årig kvinna med svår coxartros som inte svarar på konservativ behandling. Röntgen visar uttalad ledspaltesförtrangning, sklerosering och osteofyter. Du planerar en primär total höftledsplastik.`,
    references: ['rikshoft-2024', 'campbell-13ed', 'lewinnek-1978'],
    questions: [
      {
        id: 'q1',
        question: 'Vilka kirurgiska tillvägagångssätt kan användas och vad är för-/nackdelar?',
        explanation: `Huvudsakliga tillvägagångssätt:
1) Lateral/direkt lateral (Hardinge): Bra översikt, lägre luxationsrisk, risk för gluteal svaghet
2) Posterolateral: God exponering, högre luxationsrisk (2-5%), bevarar abduktorer
3) Anterior (DAA): Mindre muskeltrauma, snabbare rehab, brantare inlärningskurva
Valet beror på patientfaktorer, kirurgens erfarenhet och anatomiska förhållanden.`
      },
      {
        id: 'q2',
        question: 'Hur optimerar du cementerad vs ocementerad fixation?',
        explanation: `Faktorer som påverkar valet:
- Ålder: <65 år → ofta ocementerad, >75 år → ofta cementerad
- Benkvalitet: Dålig benkvalitet → cementerad
- Aktivitetsnivå: Högaktiva → ocementerad
- Comorbiditet: Många sjukdomar → cementerad (undvik BCIS)
Hybrid-lösning (cementerad stam, ocementerad cup) ofta bra hos äldre aktiva patienter.`
      }
    ]
  },
  {
    id: 'specialist-1',
    title: 'Komplex revisionshöftplastik',
    level: 'specialist-ortopedi',
    patient: {
      age: 74,
      gender: 'Man',
      complaint: 'Recidiverande luxationer efter THA'
    },
    scenario: `En 74-årig man med tredje luxationen efter primär THA för 8 år sedan. Röntgen visar cup-malposition (för vertikal, 55° inklination, 10° anteversion). Betydande benförlust i acetabulum. Patienten har flera comorbida tillstånd.`,
    references: ['paprosky-1994', 'rikshoft-2024', 'lewinnek-1978'],
    questions: [
      {
        id: 'q1',
        question: 'Hur hanterar du acetabulär benförlust vid revision?',
        explanation: `Klassificering enligt Paprosky och behandlingsstrategi:
- Typ 1-2A: Standard cup möjlig
- Typ 2B-2C: Jumbo cup eller cup med skruvar/augments
- Typ 3A: Jumbo cup, augments, trabekulärt metall
- Typ 3B: Custom triflange, cup-cage konstruktion, strukturell bongraft
Vid massiv benförlust kan antiprotusion cage eller custom implantat behövas. Viktigt med preoperativ planering med CT.`
      },
      {
        id: 'q2',
        question: 'Vilka moderna koncept kan minska luxationsrisken?',
        explanation: `Moderna strategier:
1) Dual mobility cups - dramatiskt minskad luxationsrisk (0.5-1% vs 2-5%)
2) Konstrained liners - vid svår mjukdels instabilitet
3) Större huvudstorlekar (36-40mm) om möjligt
4) Optimal komponentpositionering: Lewinnek safe zone (40±10° inklination, 15±10° anteversion)
5) CT-baserad planering och navigering
6) Combined anteversion koncept
Vid recidiv bör mjukdelsfaktorer, neurologisk status och compliance utvärderas.`
      }
    ]
  },
  // Additional AT cases
  {
    id: 'at-2',
    title: 'Distal radiusfraktur efter fall',
    level: 'at',
    patient: {
      age: 72,
      gender: 'Kvinna',
      complaint: 'Ont i handled efter fall hemma'
    },
    scenario: `En 72-årig kvinna trillade hemma och försökte ta emot sig med händerna. Hon har kraftig smärta i höger handled med synlig deformitet (gaffelfraktur). Vid undersökning ser du svullnad och klassisk "dinner fork deformity".`,
    references: ['rockwood-9ed', 'green-8ed'],
    questions: [
      {
        id: 'q1',
        question: 'Vilken fraktur är mest sannolik baserat på mekanismen och deformiteten?',
        options: [
          'Colles fraktur',
          'Smiths fraktur',
          'Bartons fraktur',
          'Scaphoidfraktur'
        ],
        correctAnswer: 'Colles fraktur',
        explanation: 'Colles fraktur är en distal radiusfraktur med dorsal angulation och förskjutning, uppkommer vid fall på utsträckt hand. "Dinner fork deformity" är klassisk. Smiths fraktur har volar angulation, Bartons är en ledytfraktur, scaphoidfraktur ger anatomical snuffbox tenderness utan synlig deformitet.'
      },
      {
        id: 'q2',
        question: 'Vilka kritiska strukturer måste du undersöka innan behandling?',
        options: [
          'Endast cirkulationen (puls)',
          'Endast motoriken (finger movements)',
          'Komplett neurovaskulär status (NV-status)',
          'Endast radiologisk status'
        ],
        correctAnswer: 'Komplett neurovaskulär status (NV-status)',
        explanation: 'Obligatorisk neurovaskulär status: radialispuls, sensorik (medianus, ulnaris, radialis territorier), motorik (fingerflektion/extension, opponens pollicis). N. medianus kan komprimeras vid volar svullnad eller efter reponering - risk för kompartmentsyndrom/akut karpaltunnelsyndrom.'
      }
    ]
  },
  {
    id: 'at-3',
    title: 'Akut knäskada vid fotboll',
    level: 'at',
    patient: {
      age: 24,
      gender: 'Man',
      complaint: 'Vridskada på knä med omedelbar svullnad'
    },
    scenario: `En 24-årig fotbollsspelare fick en vridskada när han landade efter ett hopp. Han hörde ett "pop" och knät svullnade snabbt. Kan inte belasta. Ottawa Knee Rules indikerar röntgen.`,
    references: ['ottawa-knee-rules-1997', 'aaos-acl-2022', 'campbell-13ed'],
    questions: [
      {
        id: 'q1',
        question: 'Snabb svullnad (<2h) tyder främst på vilken typ av skada?',
        explanation: 'Snabb hemartros (<2 timmar) indikerar intra-artikulär skada: ACL-ruptur (vanligast, 70%), patellaluxation, osteochondral fraktur, perifer meniskskada, eller tibiaplatåfraktur. Meniskskador ger ofta långsammare svullnad (12-24h). ACL-skada bekräftas med Lachman-test.'
      },
      {
        id: 'q2',
        question: 'Hur handlägger du patienten akut på akutmottagningen?',
        explanation: 'Akut handläggning: (1) Röntgen enligt Ottawa Knee Rules - uteslut fraktur, (2) Klinisk undersökning (Lachman, varus/valgus stress, menisktester) när smärtan tillåter, (3) RICE, (4) Kryckor + tidig mobilisering i tolererat ROM, (5) Remiss till ortoped eller primärvård för MR och vidare handläggning. MR inom 2-4 veckor.'
      }
    ]
  },
  // Additional ST1 cases
  {
    id: 'st1-2',
    title: 'Öppen fotledsfraktur efter MC-olycka',
    level: 'st1',
    patient: {
      age: 35,
      gender: 'Man',
      complaint: 'Öppen fraktur efter trafikolycka'
    },
    scenario: `En 35-årig man inkommer efter MC-olycka med öppen fotledsfraktur. Såret är 5 cm långt över mediala malleolen. Fotled grovt deformerad, fotpulsar svaga men palpabla, sensorik intakt. Gustilo-Anderson typ II.`,
    references: ['gustilo-1976', 'boast-open-fractures-2020', 'rockwood-9ed'],
    questions: [
      {
        id: 'q1',
        question: 'Vad är den första prioriterade åtgärden?',
        explanation: 'Första åtgärder vid öppen fraktur: (1) Primär bedömning (ABCDE), (2) Steril täckning av såret, (3) Antibiotika inom 3h (cefalosporin + aminoglykosid vid typ II-III), (4) Tetanusprofylax, (5) Smärtlindring, (6) Röntgen, (7) Reponering om neurovaskulär kompromiss, (8) Akut operation inom 6-24h för debridering och fixation.'
      },
      {
        id: 'q2',
        question: 'Vilket antibiotika-regime ska ges preoperativt?',
        explanation: 'Gustilo-Anderson typ II kräver: Cefalosporin 2g iv (t.ex. cefuroxim) + aminoglykosid (gentamicin 5-7mg/kg). Typ I: endast cefalosporin. Typ III: lägg till penicillin (anaerob täckning) eller piperacillin-tazobactam. Fortsätt 24-72h postop beroende på typ och sårförhållanden. Tidig debridering avgörande!'
      }
    ]
  },
  {
    id: 'st1-3',
    title: 'Intertrochantär femurfraktur',
    level: 'st1',
    patient: {
      age: 84,
      gender: 'Man',
      complaint: 'Trillade på trottoaren, smärta i höft'
    },
    scenario: `En 84-årig man med osteoporos trillade utomhus. Höger ben förkortat och utåtroterat. Röntgen visar intertrochantär femurfraktur med betydande bakåt-medial kominution. AO-typ 31-A2.`,
    references: ['nice-hip-fracture-2023', 'rikshoft-2024', 'rockwood-9ed'],
    questions: [
      {
        id: 'q1',
        question: 'Vilken fixationsmetod är förstahandsvalet?',
        explanation: 'För stabil intertrochantär fraktur (A1): DHS (dynamic hip screw). För instabil fraktur (A2-A3) med lateral vägg-defekt eller bakåtmedial kominution: intramedullär spik (t.ex. Gamma-spik, PFNA) ger bättre biomeknaik och lägre risk för cut-out. Patienten bör opereras inom 24-48h om medicinskt möjligt.'
      },
      {
        id: 'q2',
        question: 'Vilken postoperativ komplikation är vanligast?',
        explanation: 'Vanligaste komplikationer: (1) Medicinska (pneumoni, urinvägsinfektion, delirium) - vanligare än kirurgiska, (2) Anemi requiring transfusion, (3) Cut-out av skruv (3-8%), (4) Implantatrelaterade problem, (5) Mortalitet 30-dag: 5-10%, 1-år: 20-30%. Optimering preop (ortogeriater), tidig mobilisering och multidisciplinär vård minskar komplikationer.'
      }
    ]
  },
  // ST2 cases
  {
    id: 'st2-1',
    title: 'Rotator cuff-ruptur hos aktiv patient',
    level: 'st2',
    patient: {
      age: 58,
      gender: 'Man',
      complaint: 'Successivt ökande axelsmärta och svaghet'
    },
    scenario: `En 58-årig byggarbetare söker för 6 månaders successivt ökande höger axelsmärta och svaghet vid arbete över axelhöjd. Jobe-test och lift-off test positiva. MR visar full-thickness supraspinatus-ruptur 2 cm, måttlig retraktion, inga fettförändringar (Goutallier 0-1).`,
    references: ['campbell-13ed', 'rockwood-9ed'],
    questions: [
      {
        id: 'q1',
        question: 'Vilka faktorer påverkar prognosen vid rotator cuff-reparation?',
        explanation: 'Prognostiska faktorer: (1) Rupturstorlek (<3 cm bättre än >5 cm), (2) Fettig degeneration (Goutallier 0-2 bra, 3-4 dålig prognos), (3) Muskelatrofi och retraktion, (4) Patientens ålder och aktivitetsnivå, (5) Compliance med rehab, (6) Rökstatus (rökning ökar re-ruptur risk). Denna patient har goda förutsättningar för reparation och bra utfall.'
      },
      {
        id: 'q2',
        question: 'Vad är expected tidsplan för återgång till arbete?',
        explanation: 'Postoperativ rehab: (1) 0-6 veckor: passiv ROM i sling, (2) 6-12 veckor: aktiv assisterad ROM, (3) 12-16 veckor: aktiv ROM och lätt styrketräning, (4) 4-6 månader: progressiv styrketräning, (5) 6-9 månader: återgång till tungt arbete. För byggarbete: 6-9 månader. Kontor: 2-3 månader. Tidig överansträngning ökar re-ruptur risk.'
      }
    ]
  },
  {
    id: 'st2-2',
    title: 'Pediatrisk suprakondylär humerusfraktur',
    level: 'st2',
    patient: {
      age: 7,
      gender: 'Flicka',
      complaint: 'Fall från gungan, ont i armbågen'
    },
    scenario: `En 7-årig flicka föll från gungan på utsträckt arm. Armbågen svullen och smärtsam. Röntgen visar dorsalt dislokerad suprakondylär humerusfraktur typ Gartland III. Radialispuls palpabel men svag, hand perfunderad, motorik svår att bedöma pga smärta.`,
    references: ['tachdjian-5ed', 'gartland-1959', 'rockwood-9ed'],
    questions: [
      {
        id: 'q1',
        question: 'Vilken akut komplikation är viktigast att utesluta?',
        explanation: 'Kritiska akuta komplikationer: (1) Vaskulär skada - a. brachialis (palpera radialis-puls, kapillär återfyllnad, temperatur, färg). Om pink pulseless hand: operation utan dröjsmål. Vit, kall hand: AKUT kirurgisk exploration. (2) N. medianus/radialis/ulnaris skada (undersök preop!), (3) Kompartmentsyndrom (sällsynt men allvarligt). Gartland III kräver nästan alltid akut reponering och perkutan pinning.'
      },
      {
        id: 'q2',
        question: 'Hur fixerar du frakturen och vilka komplikationer kan uppstå?',
        explanation: 'Fixation: Sluten reponering + perkutan pinning (2-3 Kirschner-wires). Lateral entry (2-3 pins) eller crossed pins (1 lateral + 1 medial). Medial pin har risk för n. ulnaris-skada (7%). Komplikationer: nervskada (10-20%, ofta neuropraxi), vaskulär skada (1-2%), Volkmanns ischemi (<1%), cubitus varus/valgus (malunion), infektino, pin-tract problem. Långtidsuppföljning viktig.'
      }
    ]
  },
  // ST4 case
  {
    id: 'st4-1',
    title: 'Aseptisk loosening av TKA',
    level: 'st4',
    patient: {
      age: 71,
      gender: 'Kvinna',
      complaint: 'Ökande knäsmärta 8 år efter knäprotes'
    },
    scenario: `En 71-årig kvinna opererades med TKA för 8 år sedan. Nu successivt ökande smärta vid belastning. Röntgen visar radiolucentlinjer runt tibia-komponenten >2mm, zoner 1-4. Inga tecken på infektion (CRP <5, normalt SR).`,
    references: ['rikskna-2024', 'campbell-13ed'],
    questions: [
      {
        id: 'q1',
        question: 'Hur utesluter du periprotesisk infektion innan du planerar revision?',
        explanation: 'Utredning av smärtsam TKA: (1) Blodprover: CRP, SR, LPK (sens 45-95%, spec 70-92%), (2) Ledvätskeprov (guldstandard): cellräkning (>3000 PMN eller >80% PMN = infektion), odling, alfa-defensin, (3) Vid låg misstanke: PET-CT eller leukocytscintigrafi, (4) Fryssksnitt intraop (>5 PMN/HPF). VIKTIGT: Uteslut infektion innan aseptisk revision - annars katastrof!'
      },
      {
        id: 'q2',
        question: 'Vilken revisionsteknik är lämplig vid tibia-lossning med moderat benförlust?',
        explanation: 'Anderson Orthopaedic Research Institute (AORI) klassificering av benförlust: Typ 1 (intakt): standard komponent, Typ 2A-B (metafysär skada): augments eller märgfyllande stems, Typ 3 (deficient metafys): structural allografts, tantalum cones/sleeves, custom implantat. Vid moderat tibia-förlust: revision tibia med stem (cemented eller press-fit) + augments. Överväg metaphyseal sleeves eller cones vid större defekter.'
      }
    ]
  },
  // ST5 case
  {
    id: 'st5-1',
    title: 'Komplex spinaldeformitet',
    level: 'st5',
    patient: {
      age: 16,
      gender: 'Flicka',
      complaint: 'Progressiv skolios trots braceterapi'
    },
    scenario: `En 16-årig flicka med adolescent idiopatisk skolios har försämrats trots braceterapi. Cobb-vinkel nu 52° i thoracal kurva (Lenke typ 1). Risser grad 4. Neurologiskt intakt. Försämring senaste året från 38° till 52°.`,
    references: ['campbell-13ed', 'tachdjian-5ed'],
    questions: [
      {
        id: 'q1',
        question: 'Vilka är indikationerna för kirurgisk behandling?',
        explanation: 'Kirurgi-indikationer AIS: (1) Cobb-vinkel >45-50° hos skeletalt omogna eller progressiv kurva, (2) Cobb >50° oavsett mognad (risk för progression även i vuxen ålder), (3) Smärta eller neurologiska symtom, (4) Kosmetisk deformitet som påverkar livskvalitet, (5) Kardiopulmonell påverkan (>70-80°). Brace fungerar för 25-40° hos omogna patienter. Denna patient (52°, Risser 4, progression) har klar kirurgi-indikation.'
      },
      {
        id: 'q2',
        question: 'Hur planerar du instrumentering och fusion-nivåer?',
        explanation: 'Lenke typ 1 (main thoracal kurva): Posterior instrumentation och fusion från end-vertebra till end-vertebra (typiskt T4-L1), alternativt selective fusion. Anterior approach möjlig hos selekterade. Preop: (1) Standing AP+lateral röntgen med bending films, (2) MR rygg (uteslut Arnold-Chiari, syrinx), (3) Pulmonala funktionstester, (4) Intraop: pedicle screws, derotation maneuvers, osteotomier vid behov, neurophysiological monitoring (SSEP, MEP). Mål: balans, korrektion >50-60%.'
      }
    ]
  },
  // Specialist cases
  {
    id: 'specialist-2',
    title: 'Periprotesisk femurfraktur efter THA',
    level: 'specialist-ortopedi',
    patient: {
      age: 78,
      gender: 'Kvinna',
      complaint: 'Fall hemma, smärta i låret efter THA'
    },
    scenario: `En 78-årig kvinna med cementerad THA sedan 15 år trillade hemma. Röntgen visar Vancouver typ B2-fraktur (fraktur runt stammen, stammen lös). Betydande benförlust runt proximala femur. Patienten har osteoporos och lever ensam.`,
    references: ['rikshoft-2024', 'rockwood-9ed', 'campbell-13ed'],
    questions: [
      {
        id: 'q1',
        question: 'Vilken behandlingsstrategi är mest lämplig?',
        explanation: 'Vancouver-klassificering bestämmer behandling: Typ A (trochanter): ORIF, Typ B1 (runt stam, stabil stam): ORIF med kablar/plattor, Typ B2 (lös stam): revision till längre stam + ORIF, Typ B3 (lös stam + massiv benförlust): revision med extensively porous-coated stam eller allograft-prosthesis composite, Typ C (distal om stam): ORIF. Typ B2 kräver revision-stam (ofta ocementerad) med distalt fixation + cerclage/platta proximalt.'
      },
      {
        id: 'q2',
        question: 'Vilka implantatval och tekniker optimerar utfallet?',
        explanation: 'Typ B2-B3 krav: (1) Lång revision-stam med distalt fixation (bypass fraktur ≥2 cortical diameters), (2) Modular eller tapered fluted stam för anpassning, (3) Cerclage-kablar proximalt för fraktur-stabilisering, (4) Locking-platta om tillräckligt ben, (5) Vid B3: strukturellt allograft (strut grafts) eller impaction grafting + cement-stam, (6) Postop: protected weight-bearing 6-12 veckor. Komplikationer: re-fraktur, non-union, infektion, dislokation.'
      }
    ]
  }
];
