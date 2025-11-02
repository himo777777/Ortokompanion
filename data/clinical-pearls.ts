/**
 * Clinical Pearls Database for OrtoKompanion
 *
 * Quick, memorable clinical tips organized by domain
 * Perfect for daily "pearl" content in the 7-day plan
 */

import { Domain } from '@/types/onboarding';
import { EducationLevel } from '@/types/education';

export interface ClinicalPearl {
  id: string;
  domain: Domain;
  level: EducationLevel;
  title: string;
  pearl: string;
  clinical_relevance: string;
  pitfall?: string;
  tags: string[];
  references?: string[]; // Reference IDs from data/references.ts
}

// TRAUMA PEARLS
export const TRAUMA_PEARLS: ClinicalPearl[] = [
  {
    id: 'trauma-pearl-001',
    domain: 'trauma',
    level: 'at',
    title: 'Bäckenbälte-placering',
    pearl: 'Bäckenbältet ska placeras över TROKANTERNA, inte över cristae iliacae. Fel placering minskar inte bäckenvolymen tillräckligt.',
    clinical_relevance: 'Vid instabil bäckenfraktur med chock är korrekt bäckenbälte-placering livräddande. Över cristae ger minimal effekt.',
    pitfall: 'Ambulanspersonal placerar ibland bältet för högt. Kontrollera alltid placering på akutmottagningen.',
    tags: ['bäckenfraktur', 'akut', 'bäckenbälte'],
    references: ['atls-sverige-2022', 'rockwood-9ed'],
  },
  {
    id: 'trauma-pearl-002',
    domain: 'trauma',
    level: 'st1',
    title: 'Fat Embolism Triad',
    pearl: 'FES-triad: Andningspåverkan (hypoxemi) + Neurologiska symtom (konfusion) + Petekier (axillärt, konjunktivalt). Uppkommer 24-72h efter trauma eller ortopedisk kirurgi.',
    clinical_relevance: 'Tidigt igenkännande av FES är kritiskt. Diagnos är klinisk - vänta inte på alla tre symtom innan du agerar.',
    tags: ['fettembolisyndrom', 'FES', 'komplikation'],
    references: ['rockwood-9ed', 'campbell-13ed'],
  },
];

// HÖFT PEARLS
export const HOEFT_PEARLS: ClinicalPearl[] = [
  {
    id: 'hoeft-pearl-001',
    domain: 'höft',
    level: 'st1',
    title: 'Garden Klassificering Quick Recall',
    pearl: 'Garden I-II (odislokerad/impacted) = skruvar möjligt hos äldre. Garden III-IV (dislokerad) hos äldre = hemiartroplastik/THA för att undvika AVN-risk (30-50%).',
    clinical_relevance: 'Dislokerade collum-frakturer hos äldre bör inte skruvas pga hög AVN och nonunion-risk.',
    tags: ['Garden', 'collumfraktur', 'behandlingsval'],
    references: ['garden-1961', 'nice-hip-fracture-2023'],
  },
  {
    id: 'hoeft-pearl-002',
    domain: 'höft',
    level: 'st3',
    title: 'Lewinnek Safe Zone',
    pearl: 'Cup-positionering: 40±10° inklination (30-50°), 15±10° anteversion (5-25°). Utanför denna zon ökar luxationsrisken signifikant.',
    clinical_relevance: 'Korrekt cup-positionering är den viktigaste tekniska faktorn för att undvika luxation efter THA.',
    tags: ['THA', 'Lewinnek', 'cup-positionering'],
    references: ['lewinnek-1978', 'rikshoft-2024'],
  },
  {
    id: 'hoeft-pearl-003',
    domain: 'höft',
    level: 'st4',
    title: 'Dual Mobility för instabilitet',
    pearl: 'Dual mobility cups minskar luxationsrisk från 2-5% till 0.5-1%. Utmärkt för recidiverande luxationer, neuromuskulära sjukdomar, eller hög-risk patienter.',
    clinical_relevance: 'Vid revision för luxation eller primär hos hög-risk patient (tidigare CVA, demens, Parkinsons), överväg dual mobility.',
    tags: ['dual mobility', 'luxation', 'THA'],
    references: ['rikshoft-2024', 'campbell-13ed'],
  },
];

// FOT/FOTLED PEARLS
export const FOT_FOTLED_PEARLS: ClinicalPearl[] = [
  {
    id: 'fot-pearl-001',
    domain: 'fot-fotled',
    level: 'at',
    title: 'Maisonneuve-fraktur fälla',
    pearl: 'Vid fotledsskada med medial smärta/instabilitet: palpera HELA fibula upp till knät! Maisonneuve = proximal fibulafraktur + medial malleol/deltoid-skada + syndesmosruptur.',
    clinical_relevance: 'Lätt att missa proximal fibula-fraktur om man endast röntgar fotleden. Kräver kirurgi med syndesmosscrew.',
    pitfall: 'Röntgen av fotled visar endast medial skada - tänk Maisonneuve vid högenergi eller avvikande mekanism.',
    tags: ['Maisonneuve', 'fotledsfraktur', 'syndesmosruptur'],
    references: ['rockwood-9ed', 'campbell-13ed'],
  },
  {
    id: 'fot-pearl-002',
    domain: 'fot-fotled',
    level: 'st1',
    title: 'Weber ABC Quick Guide',
    pearl: 'Weber A (under syndesmosen) = stabil, gips. Weber B (på syndesmoshöjd) = kan vara instabil, kontrollera medial clear space. Weber C (över syndesmosen) = instabil, kirurgi.',
    clinical_relevance: 'Weber B är den knepiga - kräver stress-röntgen eller jämförelse med kontralateralt om oklart.',
    tags: ['Weber', 'fotledsfraktur', 'instabilitet'],
    references: ['weber-1972', 'rockwood-9ed'],
  },
];

// HAND/HANDLED PEARLS
export const HAND_HANDLED_PEARLS: ClinicalPearl[] = [
  {
    id: 'hand-pearl-001',
    domain: 'hand-handled',
    level: 'at',
    title: 'Scaphoid AVN-risk',
    pearl: 'Scaphoid blodförsörjning: 70-80% via distala polen. Proximala scaphoidfrakturer har 30% AVN-risk (vs 5% för distala). Avascular nekros = hög risk för nonunion och artros.',
    clinical_relevance: 'Proximala scaphoidfrakturer kräver ofta kirurgi även om odislokerad, pga AVN-risk.',
    tags: ['scaphoid', 'AVN', 'blodförsörjning'],
    references: ['green-8ed', 'rockwood-9ed'],
  },
  {
    id: 'hand-pearl-002',
    domain: 'hand-handled',
    level: 'st2',
    title: 'Karpaltunnelsyndrom - Durkan test',
    pearl: 'Durkan-test (direkt kompression över karpaltunneln i 30s) är mest känslig (87%) och specifik (90%) för KTS. Bättre än Phalens (75%) och Tinels (60%).',
    clinical_relevance: 'Vid tveksam KTS-diagnos: använd Durkan-test. EMG/neurografi bekräftar och graderar svårighetsgrad.',
    tags: ['karpaltunnelsyndrom', 'Durkan', 'klinisk undersökning'],
    references: ['green-8ed', 'miller-8ed'],
  },
  {
    id: 'hand-pearl-003',
    domain: 'hand-handled',
    level: 'st1',
    title: 'Boxarfraktur tolerans',
    pearl: '5:e metakarpal tolererar 40-50° volarflektion (god CMC-kompensation). 2:a-3:e metakarpals tolererar endast 10-15° vinkling. Rotation aldrig acceptabelt!',
    clinical_relevance: 'Viktigt att skilja på olika metakarpals-frakturer - 5:e kan ofta behandlas konservativt, men 2:a-3:e kräver ofta kirurgi vid vinkling.',
    tags: ['boxarfraktur', 'metakarpal', 'tolerans'],
    references: ['green-8ed', 'rockwood-9ed'],
  },
];

// KNÄ PEARLS
export const KNA_PEARLS: ClinicalPearl[] = [
  {
    id: 'kna-pearl-001',
    domain: 'knä',
    level: 'at',
    title: 'Akut hemartros = ACL',
    pearl: '70% av akuta knä-hemartros (svullnad <2h) är ACL-ruptur. Andra orsaker: patellaluxation (15%), osteochondral fraktur (5%), perifer meniskskada (5%).',
    clinical_relevance: 'Snabb svullnad efter vridskada är nästan alltid allvarligt. Långsam svullnad (12-24h) oftare isolerad meniskskada.',
    tags: ['ACL', 'hemartros', 'akut knäskada'],
    references: ['miller-8ed', 'campbell-13ed'],
  },
  {
    id: 'kna-pearl-002',
    domain: 'knä',
    level: 'st2',
    title: 'Segond-fraktur = ACL-ruptur',
    pearl: 'Segond-fraktur (lateral kapsel-avulsion) har 75-100% association med ACL-ruptur. "Reverse Segond" (medial) associerad med PCL-skada.',
    clinical_relevance: 'Liten avulsion på lateral tibiakondyl är patognomonisk för ACL-skada. Nästan alltid även meniskskada.',
    tags: ['Segond', 'ACL', 'avulsionsfraktur'],
    references: ['rockwood-9ed', 'miller-8ed'],
  },
  {
    id: 'kna-pearl-003',
    domain: 'knä',
    level: 'st4',
    title: 'Kinematic Alignment fördelar',
    pearl: 'Kinematic alignment (återskapa patientens naturliga anatomi) ger bättre funktion och tillfredsställelse än mekanisk alignment (0° neutral) vid TKA. Modern trend.',
    clinical_relevance: 'Mekanisk alignment kan ge onaturlig ligamentspänning. Kinematic alignment inom ±3° från neutral visar bättre resultat.',
    tags: ['TKA', 'kinematic alignment', 'mekanisk alignment'],
    references: ['kinematic-alignment-2019', 'rikskna-2024'],
  },
];

// AXEL/ARMBÅGE PEARLS
export const AXEL_ARMBAGE_PEARLS: ClinicalPearl[] = [
  {
    id: 'axel-pearl-001',
    domain: 'axel-armbåge',
    level: 'at',
    title: 'N. axillaris-skada vid luxation',
    pearl: 'N. axillaris skadas hos 5-25% av axelluxationer. Testa: deltoid-funktion (abduktion) + lateral arm-sensorik ("regimental badge area"). Oftast neuropraxi som läker spontant.',
    clinical_relevance: 'ALLTID testa neurovaskulär status före OCH efter reponering. Dokumentera!',
    tags: ['axelluxation', 'n. axillaris', 'nervskada'],
    references: ['rockwood-9ed', 'campbell-13ed'],
  },
  {
    id: 'axel-pearl-002',
    domain: 'axel-armbåge',
    level: 'st2',
    title: 'Jobe-test för supraspinatus',
    pearl: 'Jobe-test (empty can): 90° abduktion, 30° horisontell flexion (scapular plane), inåtrotation (tummen ned). Smärta/svaghet = supraspinatus-skada. Sens ~75%, spec ~70%.',
    clinical_relevance: 'Bäst utfört i kombination med andra rotator cuff-tester (lift-off för subscapularis, external rotation för infraspinatus).',
    tags: ['Jobe', 'supraspinatus', 'rotator cuff'],
    references: ['miller-8ed', 'campbell-13ed'],
  },
  {
    id: 'axel-pearl-003',
    domain: 'axel-armbåge',
    level: 'st1',
    title: 'Röntgen FÖRE axel-reponering',
    pearl: 'ALLTID röntgen innan reponering av axelluxation för att utesluta tillhörande frakturer (greater tuberosity 15-20%, glenoid, humerus). Reponering av fraktur-luxation kan ge displacement.',
    clinical_relevance: 'Greater tuberosity-fraktur kan kontraindicera sluten reponering om stort fragment. Röntgen först = patient safety.',
    tags: ['axelluxation', 'röntgen', 'reponering', 'fraktur'],
    references: ['rockwood-9ed', 'atls-sverige-2022'],
  },
];

// RYGG PEARLS
export const RYGG_PEARLS: ClinicalPearl[] = [
  {
    id: 'rygg-pearl-001',
    domain: 'rygg',
    level: 'at',
    title: 'Cauda Equina-triad',
    pearl: 'Cauda equina-triad: (1) Bilateral sciatica/bensvaghet, (2) Sadel-anestesi (S2-S5), (3) Blås-/tarmstörning. AKUT MR + dekompression inom 48h kritiskt!',
    clinical_relevance: 'Vänta INTE på komplett triad - bilateral symtom + något av övriga är tillräckligt för akut MR. Varje timme räknas.',
    pitfall: 'Patienten kan förneka blåsstörning - fråga specifikt om retention, svagare stråle, och mät residualvolym.',
    tags: ['cauda equina', 'akut', 'triad'],
    references: ['campbell-13ed', 'socialstyrelsen-2024'],
  },
  {
    id: 'rygg-pearl-002',
    domain: 'rygg',
    level: 'student',
    title: 'Conus medullaris-nivå',
    pearl: 'Ryggmärgen (conus medullaris) slutar vid L1-L2 hos vuxna. Nedanför detta: cauda equina (nervrötternas hästsvans). Därför kan spinalanestesi göras L3-L4 eller lägre.',
    clinical_relevance: 'Förstå skillnad mellan conus- och cauda-syndrom. Conus = mer symmetrisk, tidig blås-/tarmstörning. Cauda = asymmetrisk, senare blås-/tarmstörning.',
    tags: ['anatomi', 'conus medullaris', 'spinalanestesi'],
    references: ['campbell-13ed', 'miller-8ed'],
  },
];

// SPORT PEARLS
export const SPORT_PEARLS: ClinicalPearl[] = [
  {
    id: 'sport-pearl-001',
    domain: 'sport',
    level: 'at',
    title: 'Concussion - When in doubt, sit them out',
    pearl: '"When in doubt, sit them out" - ALDRIG låt idrottare återgå samma dag vid misstänkt hjärnskakning. Second impact syndrome kan vara dödligt. Minst 24h vila + graduated return-to-play (6 steg, minst 1 dag/steg).',
    clinical_relevance: 'Hjärnskakning kräver INTE medvetslöshet. Kognitiva symtom (förvirring, minnesförlust) räcker för diagnos.',
    pitfall: 'Idrottare underskattar ofta symtom eller ljuger för att få fortsätta. Objektiv bedömning krävs.',
    tags: ['concussion', 'hjärnskakning', 'return-to-play'],
    references: ['miller-8ed', 'campbell-13ed'],
  },
  {
    id: 'sport-pearl-002',
    domain: 'sport',
    level: 'st2',
    title: 'Hamstring-återgång',
    pearl: 'Hamstring grade II-sträckning: 3-6 veckor. Återgång baseras på funktionella tester: full ROM, <10% styrkesskillnad bilateralt, smärtfri sprint/hopp. Tidig mobilisering + excentrisk träning förbättrar utfall.',
    clinical_relevance: 'Tidig återgång ökar re-injury risk (30-50%). Hastverk är frestande men farligt.',
    tags: ['hamstring', 'muskelsträckning', 'återgång'],
    references: ['campbell-13ed', 'police-principle-2019'],
  },
  {
    id: 'sport-pearl-003',
    domain: 'sport',
    level: 'st3',
    title: 'FAI - CAM vs PINCER',
    pearl: 'FAI typ: CAM (aspherisk femurhuvud, oftast anterolateral) ger early anterior impingement vid flektion. PINCER (acetabulär övertäckning) ger perifer impingement. Många har mixed type.',
    clinical_relevance: 'Ung aktiv patient med ljumsk-smärta vid flektion/inåtrotation = tänk FAI. MR-artrogram eller MR + artros-screening.',
    tags: ['FAI', 'CAM', 'PINCER', 'impingement'],
    references: ['campbell-13ed', 'rikshoft-2024'],
  },
];

// TUMÖR PEARLS
export const TUMOR_PEARLS: ClinicalPearl[] = [
  {
    id: 'tumor-pearl-001',
    domain: 'tumör',
    level: 'at',
    title: 'Osteoid Osteoma - NSAID-respons',
    pearl: 'Osteoid osteoma ger nattsmärta som DRAMATISKT lindras av NSAID (särskilt aspirin). Tumören producerar prostaglandiner. CT visar liten nidus (<1 cm). Behandling: RFA eller excision.',
    clinical_relevance: 'Nattsmärta som SVARAR på NSAID = osteoid osteoma. Nattsmärta som EJ svarar på NSAID = tänk malignitet.',
    tags: ['osteoid osteoma', 'nattsmärta', 'NSAID'],
    references: ['campbell-13ed', 'miller-8ed'],
  },
  {
    id: 'tumor-pearl-002',
    domain: 'tumör',
    level: 'st3',
    title: 'ALDRIG biopera sarkom själv',
    pearl: 'Vid misstänkt malign bentumör: REMITTERA till sarkomcentrum för biopsi. Fel placerad biopsi-tract kan göra kurativ kirurgi omöjlig (biopsi-tract måste excideras en bloc). Core needle-biopsi är standard.',
    clinical_relevance: 'Sarkomkirurg planerar biopsi så att tract kan excideras vid definitiv kirurgi. Din "hjälpsamma" biopsi kan förstöra limb-salvage-möjlighet.',
    pitfall: 'Excisionsbiopsi är ABSOLUT kontraindicerat vid sarkom-misstanke. Kan sprida tumör till hela kompartmentet.',
    tags: ['sarkom', 'biopsi', 'sarkomcentrum'],
    references: ['enneking-1980', 'campbell-13ed'],
  },
  {
    id: 'tumor-pearl-003',
    domain: 'tumör',
    level: 'student',
    title: 'Osteosarkom - klassisk presentation',
    pearl: 'Osteosarkom: vanligast 10-20 år, metafys av långa rörben (distala femur 40%, proximala tibia 20%). Röntgen: lytisk-sklerotisk lesion, periosteal reaktion (sunburst, Codmans triangle). Prognos förbättrats med kemoterapi.',
    clinical_relevance: 'Ung patient + metafysär tumör + periosteal reaktion = osteosarkom tills motsatsen bevisats. Remittera omedelbart.',
    tags: ['osteosarkom', 'bentumör', 'pediatrik'],
    references: ['campbell-13ed', 'tachdjian-5ed'],
  },
];

// ADDITIONAL PEARLS FOR COMPREHENSIVE COVERAGE
export const ADDITIONAL_PEARLS: ClinicalPearl[] = [
  // More Trauma
  {
    id: 'trauma-pearl-003',
    domain: 'trauma',
    level: 'st2',
    title: 'Open fracture antibiotics timing',
    pearl: 'Antibiotika vid öppen fraktur: inom 3 timmar (idealt inom 1h) = 7x minskad infektionsrisk. Gustilo I: cefalosporin, II-III: +gentamicin, IIIB-C eller farm contamination: +penicillin.',
    clinical_relevance: 'Varje timmes fördröjning ökar infektionsrisken exponentiellt. "Time is tissue" gäller även för antibiotika, inte bara debridering.',
    tags: ['öppen fraktur', 'antibiotika', 'timing', 'Gustilo'],
    references: ['gustilo-1976', 'boast-open-fractures-2020'],
  },
  // More Höft
  {
    id: 'hoeft-pearl-004',
    domain: 'höft',
    level: 'st2',
    title: 'Tranexamsyra vid höftfraktur',
    pearl: 'Tranexamsyra (TXA) 1g iv pre/intraop + 1g postop vid höftfrakturkirurgi minskar transfusionsbehov med 30-40% utan ökad trombosrisk. Kontraindikationer: trombos <1 år, njursvikt.',
    clinical_relevance: 'Höftfrakturpatienter är ofta anemiska preop. TXA minskar blödning och behov av transfusion, vilket förbättrar outcome.',
    tags: ['TXA', 'tranexamsyra', 'höftfraktur', 'blödning'],
    references: ['crash-2-2010', 'moon-txa-2016'],
  },
  {
    id: 'hoeft-pearl-005',
    domain: 'höft',
    level: 'specialist-ortopedi',
    title: 'Squeaking ceramic-on-ceramic',
    pearl: 'Squeaking (gnisslande) vid ceramic-on-ceramic THA förekommer hos 1-5%. Orsakas ofta av edge loading (malpositionering), impingement, eller komponent-separation. Oftast asymtomatisk men irriterande. Revision sällan nödvändig.',
    clinical_relevance: 'Informera patient om squeaking-risk vid CoC. Korrekt komponent-positionering och impingement-fri ROM minskar risk.',
    tags: ['ceramic', 'squeaking', 'THA', 'komplikation'],
    references: ['rikshoft-2024', 'campbell-13ed'],
  },
  // More Knä
  {
    id: 'kna-pearl-004',
    domain: 'knä',
    level: 'st2',
    title: 'Ottawa Knee Rules',
    pearl: 'Ottawa Knee Rules för röntgen-indikation: (1) Ålder ≥55 år, (2) Isolerad patella-ömhet, (3) Fibulahuvud-ömhet, (4) Kan inte flexa 90°, (5) Oförmåga att gå 4 steg (direkt efter skadan OCH i akuten). Sensitivitet nästan 100%.',
    clinical_relevance: 'Minskar onödiga röntgen med 28% utan att missa frakturer. Vid tveksamhet - röntga!',
    tags: ['Ottawa Knee Rules', 'beslutsstöd', 'röntgen'],
    references: ['ottawa-knee-rules-1997', 'miller-8ed'],
  },
  {
    id: 'kna-pearl-005',
    domain: 'knä',
    level: 'st4',
    title: 'TKA - Q-angle och tracking',
    pearl: 'Q-angle (quadriceps angle) normal: män 10-15°, kvinnor 15-20°. Vid TKA: säkerställ korrekt patella tracking. Lateral retinacular release används sällan nuförtiden - fokus på korrekt komponent-rotation istället (femur external rotation 3-5°).',
    clinical_relevance: 'Patella maltracking/subluxation är en viktig orsak till anterior knäsmärta post-TKA. Femur-komponent rotation är kritisk.',
    tags: ['TKA', 'patella tracking', 'Q-angle', 'rotation'],
    references: ['rikskna-2024', 'campbell-13ed'],
  },
  // More Hand
  {
    id: 'hand-pearl-004',
    domain: 'hand-handled',
    level: 'st1',
    title: 'Jersey finger vs Mallet finger',
    pearl: 'Jersey finger = FDP-avulsion (kan inte flexa DIP), ofta ring finger, behöver kirurgi inom 7-10 dagar. Mallet finger = extensor terminal tendon-avulsion (droop DIP), oftast konservativt 6-8v Stack splint (DIP extension, PIP fri).',
    clinical_relevance: 'Båda är sportskador men olika handläggning. Jersey = akutkirurgi. Mallet = nästan alltid konservativ.',
    tags: ['Jersey finger', 'Mallet finger', 'FDP', 'extensor tendon'],
    references: ['green-8ed', 'campbell-13ed'],
  },
  {
    id: 'hand-pearl-005',
    domain: 'hand-handled',
    level: 'st2',
    title: 'De Quervains - Finkelsteins test',
    pearl: 'De Quervains tenosynovit: stenosing tenosynovitis av APL + EPB (1:a dorsala kompartmentet). Finkelsteins test: ulnardeviation av handled med tumme i knytnäve provocerar smärta. Behandling: splint, kortisoninjektion, kirurgisk release vid refraktär.',
    clinical_relevance: 'Vanligt hos nyblivna mammor ("mothers thumb"). Kortisoninjektion har 80% success rate.',
    tags: ['De Quervains', 'Finkelsteins test', 'tenosynovit'],
    references: ['green-8ed', 'miller-8ed'],
  },
  // More Fot/Fotled
  {
    id: 'fot-pearl-003',
    domain: 'fot-fotled',
    level: 'st2',
    title: 'Lisfranc injury - red flags',
    pearl: 'Lisfranc-skada: alltid misstänk vid midfoot trauma (crush injury, fall från höjd, fotboll). Röntgen: diastasis mellan MT1-MT2 baserna (>2mm), flake sign (avulsion från 2:a metatarsalbasen). CT eller MR om tveksam. Ofta missas initialt!',
    clinical_relevance: 'Missad Lisfranc → kronisk smärta, instabilitet, artros. Vid tveksamhet: weight-bearing röntgen jämfört med kontralateralt.',
    pitfall: 'Subtila Lisfranc-skador kan se normala ut på icke-belastningsröntgen. Hög misstankesindex!',
    tags: ['Lisfranc', 'midfoot', 'flake sign', 'diastasis'],
    references: ['rockwood-9ed', 'campbell-13ed'],
  },
  {
    id: 'fot-pearl-004',
    domain: 'fot-fotled',
    level: 'st3',
    title: 'Achilles rupture - Thompson test',
    pearl: 'Thompson test (Simmonds test): patient prone, squeeze calf → ingen plantarflexion = Achilles-ruptur. Känslighet ~95%. Palpabelt gap ofta men kan maskeras av hematom. MR om tveksam. Behandling: konservativ likvärdigt med kirurgi enligt moderna studier.',
    clinical_relevance: 'Konservativ behandling (funktionell ortos, tidig ROM) visar likvärdig re-ruptur rate (~5%) som kirurgi men lägre komplikationsrisk.',
    tags: ['Achilles ruptur', 'Thompson test', 'Simmonds', 'konservativ'],
    references: ['kannus-achilles-2002', 'campbell-13ed'],
  },
  // More Rygg
  {
    id: 'rygg-pearl-003',
    domain: 'rygg',
    level: 'st3',
    title: 'Straight leg raise test',
    pearl: 'Straight leg raise (SLR/Lasègues test): positiv vid 30-70° höjning = L5-S1 nervrotsretning. Crossed SLR (smärta i kontralaterala benet) är mer specifik (90%). Positiv SLR har hög sensitivitet (90%) men låg specificitet (40%) för diskbråck.',
    clinical_relevance: 'Crossed SLR är mycket mer specifik för diskbråck än vanlig SLR. Negativ SLR nästan utesluter signifikant nervrotspåverkan.',
    tags: ['SLR', 'Lasègues', 'diskbråck', 'nervrotsretning'],
    references: ['miller-8ed', 'campbell-13ed'],
  },
  {
    id: 'rygg-pearl-004',
    domain: 'rygg',
    level: 'st4',
    title: 'Osteoporotic compression fracture - Kyphoplasty timing',
    pearl: 'Vertebroplasty/kyphoplasty för osteoporotiska kompressionsfrakturer: bäst inom 3 månader från fraktur. Indikationer: refraktär smärta trots konservativ behandling (4-6v), MR-verifierad akut fraktur (bone marrow edema). Komplikationer: cement leak (10-40%), sällan symptomatic.',
    clinical_relevance: 'Kyphoplasty återställer viss höjd (vs vertebroplasty). Båda ger snabb smärtlindring men inte bevisat bättre än placebo enligt vissa studier. Selektera patienter noggrant.',
    tags: ['kyphoplasty', 'vertebroplasty', 'kompressionsfraktur', 'osteoporos'],
    references: ['campbell-13ed', 'rockwood-9ed'],
  },
  // More Sport
  {
    id: 'sport-pearl-004',
    domain: 'sport',
    level: 'st3',
    title: 'ACL graft choice - BTB vs Hamstring',
    pearl: 'BTB (bone-tendon-bone): starkare initial fixation (ben-ben läkning 6v vs 12v för hamstring), lägre re-ruptur hos unga män, men 10-20% anterior knäsmärta. Hamstring: mer naturlig, lägre donor site morbidity, men något högre re-ruptur risk (<5% skillnad) hos unga aktiva.',
    clinical_relevance: 'Individualisera valet: BTB för elite-idrottare/män, hamstring för kvinnor/recreational athletes. Båda har utmärkta resultat.',
    tags: ['ACL', 'BTB', 'hamstring graft', 'graft choice'],
    references: ['aaos-acl-2022', 'campbell-13ed'],
  },
  {
    id: 'sport-pearl-005',
    domain: 'sport',
    level: 'st2',
    title: 'RICE → POLICE',
    pearl: 'Modern akut mjukdelsskada-hantering: POLICE istället för RICE. Protection, Optimal Loading (tidig kontrollerad mobilisering), Ice, Compression, Elevation. "Optimal loading" är key - complete rest försenar läkning!',
    clinical_relevance: 'Tidig kontrollerad mobilisering och progressiv belastning förbättrar läkning och förebygger styvhet. Immobilisering endast första 24-48h.',
    tags: ['POLICE', 'RICE', 'mjukdelsskada', 'optimal loading'],
    references: ['police-principle-2019', 'campbell-13ed'],
  },
  // More Axel
  {
    id: 'axel-pearl-004',
    domain: 'axel-armbåge',
    level: 'st3',
    title: 'Bankart vs SLAP lesion',
    pearl: 'Bankart lesion: anteriort labrum-avulsion (ofta efter främre luxation), ger instabilitet. SLAP lesion (Superior Labrum Anterior-Posterior): överarmsskada ofta hos throwers, ger smärta snarare än instabilitet. Behandling: Bankart = kirurgi hos aktiva, SLAP = ofta konservativ först.',
    clinical_relevance: 'Skillnad i presentation och behandling. Bankart associerad med luxation (instabilitet), SLAP med overhead athletics (smärta).',
    tags: ['Bankart', 'SLAP', 'labrum', 'axelinstabilitet'],
    references: ['campbell-13ed', 'rockwood-9ed'],
  },
  {
    id: 'axel-pearl-005',
    domain: 'axel-armbåge',
    level: 'st2',
    title: 'Tennis elbow - epicondylitis lateralis',
    pearl: 'Lateral epicondylit ("tennis elbow"): degenerativ tendinopati av ECRB (extensor carpi radialis brevis), INTE inflammation. Behandling: excentrisk träning, bracing, dry needling/PRP. 90% läker inom 1 år konservativt. Kirurgi endast vid refraktär (>6-12 månader).',
    clinical_relevance: 'Kortisoninjektion ger kortsiktig lindring men sämre långtidsresultat. Excentrisk träning är förstahandsval.',
    tags: ['tennis elbow', 'lateral epicondylit', 'ECRB', 'tendinopati'],
    references: ['campbell-13ed', 'miller-8ed'],
  },
  // More Tumör
  {
    id: 'tumor-pearl-004',
    domain: 'tumör',
    level: 'st2',
    title: 'Codmans triangle',
    pearl: 'Codmans triangle: periosteal reaktion där periosteum lyfts från cortex av snabbt växande tumör, skapar triangulär konfiguration. Ses vid aggressiva/maligna tumörer (osteosarkom, Ewings) men INTE diagnostiskt för malignitet - kan ses vid infektion/hematom också.',
    clinical_relevance: 'Codmans triangle + sunburst pattern + ung patient = misstänk osteosarkom omedelbart. Remittera till sarkomcentrum.',
    tags: ['Codmans triangle', 'periosteal reaktion', 'osteosarkom'],
    references: ['campbell-13ed', 'miller-8ed'],
  },
];

// EXPORT ALL PEARLS
export const ALL_PEARLS: ClinicalPearl[] = [
  ...TRAUMA_PEARLS,
  ...HOEFT_PEARLS,
  ...FOT_FOTLED_PEARLS,
  ...HAND_HANDLED_PEARLS,
  ...KNA_PEARLS,
  ...AXEL_ARMBAGE_PEARLS,
  ...RYGG_PEARLS,
  ...SPORT_PEARLS,
  ...TUMOR_PEARLS,
  ...ADDITIONAL_PEARLS,
];

// UTILITY FUNCTIONS
export function getPearlsByDomain(domain: Domain): ClinicalPearl[] {
  return ALL_PEARLS.filter(p => p.domain === domain);
}

export function getPearlsByLevel(level: EducationLevel): ClinicalPearl[] {
  return ALL_PEARLS.filter(p => p.level === level);
}

export function getRandomPearl(domain?: Domain): ClinicalPearl {
  const pearls = domain ? getPearlsByDomain(domain) : ALL_PEARLS;
  return pearls[Math.floor(Math.random() * pearls.length)];
}

export function getPearlOfTheDay(): ClinicalPearl {
  // Use current date as seed for consistent "pearl of the day"
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const index = dayOfYear % ALL_PEARLS.length;
  return ALL_PEARLS[index];
}
