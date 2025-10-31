/**
 * Medical Images Database for OrtoKompanion
 *
 * Comprehensive collection of X-rays, illustrations, and clinical images
 * with proper attribution and sources
 */

import { MedicalImage, ImageCollection } from '@/types/medical-image';

// =============================================================================
// CLASSIFICATION SYSTEM IMAGES
// =============================================================================

export const CLASSIFICATION_IMAGES: MedicalImage[] = [
  {
    id: 'garden-classification-diagram',
    type: 'classification',
    title: 'Garden Classification System',
    description: 'Garden classification för collumfrakturer. Grade I: Incomplete, impacted. Grade II: Complete without displacement. Grade III: Complete with partial displacement. Grade IV: Complete with full displacement.',
    path: '/images/classifications/garden-classification.jpg',
    domain: 'höft',
    level: 'at',
    tags: ['Garden', 'collumfraktur', 'höftfraktur', 'klassificering'],
    source: {
      type: 'textbook',
      name: "Rockwood and Green's Fractures in Adults",
      citation: 'Rockwood CA, Green DP, et al. Fractures in Adults, 9th Edition. Wolters Kluwer, 2019.'
    },
    license: 'educational-use',
    attribution: 'Garden classification diagram. Source: Rockwood and Green\'s Fractures in Adults, 9th Ed. Educational use.',
    year: 2019,
    relatedQuestions: ['hoeft-002'],
    relatedPearls: ['hoeft-pearl-001']
  },

  {
    id: 'gustilo-anderson-classification',
    type: 'classification',
    title: 'Gustilo-Anderson Classification',
    description: 'Gustilo-Anderson klassificering för öppna frakturer. Typ I: <1cm huddefekt, minimal mjukdelsskada. Typ II: >1cm men <10cm. Typ III: >10cm eller massiv skada (IIIA-C).',
    path: '/images/classifications/gustilo-anderson.jpg',
    domain: 'trauma',
    level: 'at',
    tags: ['Gustilo-Anderson', 'öppen fraktur', 'klassificering', 'mjukdelsskada'],
    source: {
      type: 'journal',
      name: 'Journal of Bone and Joint Surgery',
      doi: '10.2106/00004623-197658040-00004',
      citation: 'Gustilo RB, Anderson JT. Prevention of Infection in the Treatment of One Thousand and Twenty-five Open Fractures of Long Bones. JBJS 1976;58(4):453-458.'
    },
    license: 'educational-use',
    attribution: 'Gustilo-Anderson classification. Original: Gustilo RB, Anderson JT. JBJS 1976. Educational use.',
    year: 1976,
    relatedQuestions: ['trauma-002'],
    relatedCases: ['st1-2']
  },

  {
    id: 'weber-classification-ankle',
    type: 'classification',
    title: 'Weber Classification - Ankle Fractures',
    description: 'Weber-klassificering för fotledsfrakturer baserat på fibulafrakturens relation till syndesmosen. A: Under, B: På nivån, C: Över syndesmosen.',
    path: '/images/classifications/weber-abc.jpg',
    domain: 'fot-fotled',
    level: 'at',
    tags: ['Weber', 'fotledsfraktur', 'fibula', 'syndesmosis'],
    source: {
      type: 'textbook',
      name: "Rockwood and Green's Fractures in Adults",
      citation: 'Weber BG. Die Verletzungen des oberen Sprunggelenkes. Bern: Verlag Hans Huber, 1972.'
    },
    license: 'educational-use',
    attribution: 'Weber classification. Based on Weber BG, 1972. Educational illustration.',
    year: 1972,
    relatedQuestions: ['fot-003'],
    relatedPearls: ['fot-pearl-002'],
    relatedCases: ['at-1']
  },

  {
    id: 'paprosky-classification',
    type: 'classification',
    title: 'Paprosky Classification - Acetabular Bone Loss',
    description: 'Paprosky klassificering för acetabulär benförlust vid THA-revision. Typ 1: Intakt, Typ 2A-C: Segmental/cavitary, Typ 3A-B: Massiv förlust.',
    path: '/images/classifications/paprosky.jpg',
    domain: 'höft',
    level: 'specialist',
    tags: ['Paprosky', 'revision', 'benförlust', 'acetabulum', 'THA'],
    source: {
      type: 'journal',
      name: 'Clinical Orthopaedics and Related Research',
      citation: 'Paprosky WG, Perona PG, Lawrence JM. Acetabular defect classification and surgical reconstruction in revision arthroplasty. CORR 1994;(307):107-113.'
    },
    license: 'educational-use',
    attribution: 'Paprosky classification diagram. Based on Paprosky et al., CORR 1994. Educational use.',
    year: 1994,
    relatedQuestions: ['hoeft-005'],
    relatedCases: ['specialist-1']
  },

  {
    id: 'gartland-classification',
    type: 'classification',
    title: 'Gartland Classification - Supracondylar Fractures',
    description: 'Gartland klassificering för suprakondylära humerusfrakturer hos barn. Typ I: Odislokerad, Typ II: Angulerad/roterad, Typ III: Helt dislokerad.',
    path: '/images/classifications/gartland.jpg',
    domain: 'trauma',
    level: 'st2',
    tags: ['Gartland', 'suprakondylär', 'pediatrik', 'humerus'],
    source: {
      type: 'journal',
      name: 'Journal of Bone and Joint Surgery',
      citation: 'Gartland JJ. Management of supracondylar fractures of the humerus in children. Surg Gynecol Obstet 1959;109:145-154.'
    },
    license: 'educational-use',
    attribution: 'Gartland classification. Original: Gartland JJ, 1959. Educational illustration.',
    year: 1959,
    relatedQuestions: ['trauma-004'],
    relatedCases: ['st2-2']
  },

  {
    id: 'enneking-staging',
    type: 'classification',
    title: 'Enneking Staging System - Bone Tumors',
    description: 'Enneking staging för bentumörer. Stage I: Låggradigt, II: Höggradigt, III: Metastaser. A=intrakompartmentellt, B=extrakompartmentellt.',
    path: '/images/classifications/enneking-staging.jpg',
    domain: 'tumör',
    level: 'st4',
    tags: ['Enneking', 'staging', 'osteosarkom', 'sarkom'],
    source: {
      type: 'textbook',
      name: 'Musculoskeletal Tumor Surgery',
      citation: 'Enneking WF, Spanier SS, Goodman MA. A system for the surgical staging of musculoskeletal sarcoma. Clin Orthop Relat Res 1980;(153):106-120.'
    },
    license: 'educational-use',
    attribution: 'Enneking staging system. Based on Enneking et al., 1980. Educational use.',
    year: 1980,
    relatedQuestions: ['tumor-004'],
    relatedPearls: ['tumor-pearl-002']
  }
];

// =============================================================================
// X-RAY IMAGES
// =============================================================================

export const XRAY_IMAGES: MedicalImage[] = [
  {
    id: 'garden-iv-xray',
    type: 'xray',
    title: 'Garden IV Collumfraktur',
    description: 'AP röntgen som visar Garden IV collumfraktur med fullständig dislokation av femurhuvudet. Shenton\'s linje är bruten.',
    path: '/images/xrays/garden-iv-fracture.jpg',
    domain: 'höft',
    level: 'at',
    tags: ['Garden IV', 'collumfraktur', 'dislokerad', 'AP röntgen'],
    source: {
      type: 'database',
      name: 'Radiopaedia.org',
      url: 'https://radiopaedia.org/articles/garden-classification-system',
      citation: 'Garden IV femoral neck fracture. Radiopaedia.org. CC BY-NC-SA 3.0.'
    },
    license: 'cc-by-sa-4.0',
    attribution: 'Garden IV fracture X-ray. Source: Radiopaedia.org, CC BY-NC-SA 3.0.',
    relatedQuestions: ['hoeft-002'],
    relatedCases: ['st1-3'],
    annotations: [
      {
        id: 'fracture-line',
        label: 'Frakturlinje',
        description: 'Fullständig fraktur genom collum femoris',
        coordinates: { x: 45, y: 40 }
      },
      {
        id: 'displaced-head',
        label: 'Dislokerat huvud',
        description: 'Femurhuvudet helt dislokerat',
        coordinates: { x: 42, y: 35 }
      }
    ]
  },

  {
    id: 'colles-fracture-xray',
    type: 'xray',
    title: 'Colles Fraktur - Lateral View',
    description: 'Lateral röntgen av Colles fraktur med typisk dorsal angulering och förskjutning av distala radius. "Dinner fork deformity".',
    path: '/images/xrays/colles-fracture-lateral.jpg',
    domain: 'hand-handled',
    level: 'student',
    tags: ['Colles', 'distal radius', 'dorsal angulation', 'FOOSH'],
    source: {
      type: 'database',
      name: 'Wikimedia Commons',
      url: 'https://commons.wikimedia.org/wiki/File:Colles_fracture.jpg',
      citation: 'Colles fracture lateral X-ray. Wikimedia Commons, Public Domain.'
    },
    license: 'cc0',
    attribution: 'Colles fracture X-ray. Source: Wikimedia Commons, Public Domain.',
    relatedQuestions: ['hand-001'],
    relatedCases: ['student-1', 'at-2']
  },

  {
    id: 'scaphoid-fracture-xray',
    type: 'xray',
    title: 'Scaphoid Fracture - Waist',
    description: 'Scaphoid-view röntgen som visar fraktur genom scaphoid waist. Detta är den vanligaste lokaliseringen.',
    path: '/images/xrays/scaphoid-waist-fracture.jpg',
    domain: 'hand-handled',
    level: 'at',
    tags: ['scaphoid', 'waist fracture', 'FOOSH', 'occult fracture'],
    source: {
      type: 'database',
      name: 'Radiopaedia.org',
      url: 'https://radiopaedia.org/articles/scaphoid-fracture',
      citation: 'Scaphoid waist fracture. Radiopaedia.org. CC BY-NC-SA 3.0.'
    },
    license: 'cc-by-sa-4.0',
    attribution: 'Scaphoid fracture X-ray. Source: Radiopaedia.org, CC BY-NC-SA 3.0.',
    relatedQuestions: ['hand-001'],
    relatedPearls: ['hand-pearl-001']
  },

  {
    id: 'weber-b-ankle-fracture',
    type: 'xray',
    title: 'Weber B Ankle Fracture',
    description: 'AP röntgen av fotled med Weber B fibulafraktur på syndesmoshöjd. Medial clear space normal, frakturen är stabil.',
    path: '/images/xrays/weber-b-stable.jpg',
    domain: 'fot-fotled',
    level: 'st1',
    tags: ['Weber B', 'fotled', 'fibula', 'stabil'],
    source: {
      type: 'database',
      name: 'Radiopaedia.org',
      url: 'https://radiopaedia.org/articles/ankle-fracture',
      citation: 'Weber B ankle fracture. Radiopaedia.org. CC BY-NC-SA 3.0.'
    },
    license: 'cc-by-sa-4.0',
    attribution: 'Weber B fracture X-ray. Source: Radiopaedia.org, CC BY-NC-SA 3.0.',
    relatedQuestions: ['fot-003'],
    relatedCases: ['at-1']
  },

  {
    id: 'supracondylar-gartland-iii',
    type: 'xray',
    title: 'Gartland III Supracondylar Fracture',
    description: 'Lateral röntgen av armbåge som visar Gartland typ III suprakondylär humerusfraktur med fullständig posterior dislokation.',
    path: '/images/xrays/gartland-iii-lateral.jpg',
    domain: 'trauma',
    level: 'st2',
    tags: ['Gartland III', 'suprakondylär', 'pediatrik', 'dislokerad'],
    source: {
      type: 'database',
      name: 'Radiopaedia.org',
      url: 'https://radiopaedia.org/articles/supracondylar-fracture-of-the-humerus',
      citation: 'Gartland III supracondylar fracture. Radiopaedia.org. CC BY-NC-SA 3.0.'
    },
    license: 'cc-by-sa-4.0',
    attribution: 'Gartland III fracture X-ray. Source: Radiopaedia.org, CC BY-NC-SA 3.0.',
    relatedCases: ['st2-2']
  },

  {
    id: 'osteosarcoma-sunburst',
    type: 'xray',
    title: 'Osteosarcoma - Sunburst Pattern',
    description: 'AP röntgen av distala femur med osteosarkom. Typisk sunburst periosteal reaktion och Codman\'s triangle.',
    path: '/images/xrays/osteosarcoma-sunburst.jpg',
    domain: 'tumör',
    level: 'st3',
    tags: ['osteosarkom', 'sunburst', 'Codman triangle', 'malign'],
    source: {
      type: 'database',
      name: 'Radiopaedia.org',
      url: 'https://radiopaedia.org/articles/osteosarcoma',
      citation: 'Osteosarcoma with sunburst pattern. Radiopaedia.org. CC BY-NC-SA 3.0.'
    },
    license: 'cc-by-sa-4.0',
    attribution: 'Osteosarcoma X-ray. Source: Radiopaedia.org, CC BY-NC-SA 3.0.',
    relatedQuestions: ['tumor-001'],
    relatedPearls: ['tumor-pearl-003']
  }
];

// =============================================================================
// ANATOMICAL ILLUSTRATIONS
// =============================================================================

export const ANATOMICAL_ILLUSTRATIONS: MedicalImage[] = [
  {
    id: 'hip-blood-supply',
    type: 'illustration',
    title: 'Hip Blood Supply - Femoral Head',
    description: 'Anatomisk illustration av blodförsörjningen till caput femoris. A. circumflexa femoris medialis är den primära källan (70-80%).',
    path: '/images/anatomy/hip-blood-supply.jpg',
    domain: 'höft',
    level: 'student',
    tags: ['anatomi', 'blodförsörjning', 'circumflexa femoris', 'AVN'],
    source: {
      type: 'textbook',
      name: "Campbell's Operative Orthopaedics",
      citation: "Azar FM, Beaty JH, Canale ST. Campbell's Operative Orthopaedics, 13th Edition. Elsevier, 2021."
    },
    license: 'educational-use',
    attribution: 'Hip vascular anatomy. Based on Campbell\'s Operative Orthopaedics, 13th Ed. Educational use.',
    year: 2021,
    relatedQuestions: ['hoeft-001'],
    relatedPearls: ['hand-pearl-001']
  },

  {
    id: 'rotator-cuff-anatomy',
    type: 'illustration',
    title: 'Rotator Cuff Anatomy',
    description: 'Anatomisk illustration av rotatorkuffen: supraspinatus, infraspinatus, teres minor, och subscapularis (SITS).',
    path: '/images/anatomy/rotator-cuff.jpg',
    domain: 'axel-armbåge',
    level: 'student',
    tags: ['anatomi', 'rotator cuff', 'SITS', 'supraspinatus'],
    source: {
      type: 'wikimedia',
      name: 'Wikimedia Commons',
      url: 'https://commons.wikimedia.org/wiki/File:Rotator_cuff_muscles.png',
      citation: 'Rotator cuff anatomy. Wikimedia Commons, CC BY-SA 4.0.'
    },
    license: 'cc-by-sa-4.0',
    attribution: 'Rotator cuff anatomy. Source: Wikimedia Commons, CC BY-SA 4.0.',
    relatedQuestions: ['axel-001', 'axel-003'],
    relatedCases: ['st2-1']
  },

  {
    id: 'meniscus-zones',
    type: 'illustration',
    title: 'Meniscus Vascular Zones',
    description: 'Illustration av meniskens vaskulära zoner: röd-röd (perifer, vaskulär), röd-vit (intermediate), vit-vit (central, avaskulär).',
    path: '/images/anatomy/meniscus-zones.jpg',
    domain: 'knä',
    level: 'st2',
    tags: ['menisk', 'vaskulär zon', 'red-red', 'repair'],
    source: {
      type: 'textbook',
      name: "Campbell's Operative Orthopaedics",
      citation: "Meniscal anatomy and healing zones. Campbell's Operative Orthopaedics, 13th Ed."
    },
    license: 'educational-use',
    attribution: 'Meniscus vascular zones. Based on Campbell\'s Operative Orthopaedics. Educational use.',
    relatedQuestions: ['kna-005'],
    relatedPearls: ['kna-pearl-001']
  },

  {
    id: 'lewinnek-safe-zone',
    type: 'diagram',
    title: 'Lewinnek Safe Zone - THA',
    description: 'Diagram som visar Lewinnek safe zone för cup-positionering vid THA: 40±10° inklination, 15±10° anteversion.',
    path: '/images/diagrams/lewinnek-safe-zone.jpg',
    domain: 'höft',
    level: 'st3',
    tags: ['Lewinnek', 'safe zone', 'THA', 'cup positionering'],
    source: {
      type: 'journal',
      name: 'Clinical Orthopaedics and Related Research',
      doi: '10.1097/00003086-197811000-00035',
      citation: 'Lewinnek GE, Lewis JL, Tarr R, et al. Dislocations after total hip-replacement arthroplasties. CORR 1978;(127):124-128.'
    },
    license: 'educational-use',
    attribution: 'Lewinnek safe zone diagram. Based on Lewinnek et al., CORR 1978. Educational use.',
    year: 1978,
    relatedQuestions: ['hoeft-004'],
    relatedPearls: ['hoeft-pearl-002']
  },

  {
    id: 'ottawa-ankle-rules-diagram',
    type: 'diagram',
    title: 'Ottawa Ankle Rules',
    description: 'Diagram som visar Ottawa Ankle Rules för röntgen-indikation: ömhet över malleolerna, naviculare, basis MT5, eller oförmåga att gå 4 steg.',
    path: '/images/diagrams/ottawa-ankle-rules.jpg',
    domain: 'fot-fotled',
    level: 'at',
    tags: ['Ottawa', 'ankle rules', 'beslutsstöd', 'röntgen'],
    source: {
      type: 'journal',
      name: 'JAMA',
      doi: '10.1001/jama.1993.03510060069045',
      citation: 'Stiell IG, Greenberg GH, McKnight RD, et al. A study to develop clinical decision rules for the use of radiography in acute ankle injuries. Ann Emerg Med 1992;21(4):384-390.'
    },
    license: 'educational-use',
    attribution: 'Ottawa Ankle Rules diagram. Based on Stiell et al., 1992. Educational use.',
    year: 1992,
    relatedQuestions: ['fot-002'],
    relatedCases: ['at-1']
  },

  {
    id: 'acl-anatomy-biomechanics',
    type: 'illustration',
    title: 'ACL Anatomy and Function',
    description: 'Anatomisk illustration av främre korsbandets (ACL) anatomi och biomeknaiska funktion. Förhindrar anterior translation av tibia.',
    path: '/images/anatomy/acl-anatomy.jpg',
    domain: 'knä',
    level: 'at',
    tags: ['ACL', 'anatomi', 'biomeknaik', 'korsband'],
    source: {
      type: 'textbook',
      name: "Campbell's Operative Orthopaedics",
      citation: "ACL anatomy. Campbell's Operative Orthopaedics, 13th Ed."
    },
    license: 'educational-use',
    attribution: 'ACL anatomy illustration. Based on Campbell\'s Operative Orthopaedics. Educational use.',
    relatedQuestions: ['kna-002', 'kna-003'],
    relatedCases: ['at-3'],
    relatedPearls: ['kna-pearl-001']
  }
];

// =============================================================================
// CLINICAL EXAMINATION IMAGES
// =============================================================================

export const CLINICAL_EXAM_IMAGES: MedicalImage[] = [
  {
    id: 'lachman-test-technique',
    type: 'clinical-photo',
    title: 'Lachman Test Technique',
    description: 'Kliniskt foto som visar korrekt teknik för Lachman-test. Knät i 20-30° flektion, anteriordragning av tibia.',
    path: '/images/clinical/lachman-test.jpg',
    domain: 'knä',
    level: 'at',
    tags: ['Lachman', 'ACL', 'klinisk undersökning', 'teknik'],
    source: {
      type: 'textbook',
      name: "Miller's Review of Orthopaedics",
      citation: "Miller MD, Thompson SR. Miller's Review of Orthopaedics, 8th Edition. Elsevier, 2020."
    },
    license: 'educational-use',
    attribution: 'Lachman test technique. Based on Miller\'s Review of Orthopaedics. Educational use.',
    relatedQuestions: ['kna-002'],
    relatedCases: ['at-3']
  },

  {
    id: 'jobe-test-empty-can',
    type: 'clinical-photo',
    title: 'Jobe Test (Empty Can Test)',
    description: 'Demonstration av Jobe-test för supraspinatus. Arm i 90° abduktion, 30° horisontell flexion, inåtrotation.',
    path: '/images/clinical/jobe-test.jpg',
    domain: 'axel-armbåge',
    level: 'st2',
    tags: ['Jobe test', 'empty can', 'supraspinatus', 'undersökning'],
    source: {
      type: 'textbook',
      name: "Campbell's Operative Orthopaedics",
      citation: "Shoulder examination techniques. Campbell's Operative Orthopaedics, 13th Ed."
    },
    license: 'educational-use',
    attribution: 'Jobe test demonstration. Based on Campbell\'s Operative Orthopaedics. Educational use.',
    relatedQuestions: ['axel-003'],
    relatedPearls: ['axel-pearl-002']
  },

  {
    id: 'thompson-test-achilles',
    type: 'clinical-photo',
    title: 'Thompson Test for Achilles Rupture',
    description: 'Thompson test (Simmonds test): patient prone, squeeze calf. Ingen plantarflexion = Achilles-ruptur.',
    path: '/images/clinical/thompson-test.jpg',
    domain: 'fot-fotled',
    level: 'st2',
    tags: ['Thompson test', 'Achilles', 'ruptur', 'klinisk undersökning'],
    source: {
      type: 'textbook',
      name: "Campbell's Operative Orthopaedics",
      citation: "Achilles tendon examination. Campbell's Operative Orthopaedics, 13th Ed."
    },
    license: 'educational-use',
    attribution: 'Thompson test demonstration. Based on Campbell\'s Operative Orthopaedics. Educational use.',
    relatedPearls: ['fot-pearl-004']
  },

  {
    id: 'straight-leg-raise-test',
    type: 'clinical-photo',
    title: 'Straight Leg Raise Test',
    description: 'Straight leg raise (SLR/Lasègues test) för nervrotsretning. Positiv vid 30-70° höjning.',
    path: '/images/clinical/slr-test.jpg',
    domain: 'rygg',
    level: 'at',
    tags: ['SLR', 'Lasègues', 'nervrot', 'diskbråck'],
    source: {
      type: 'textbook',
      name: "Campbell's Operative Orthopaedics",
      citation: "Spine examination techniques. Campbell's Operative Orthopaedics, 13th Ed."
    },
    license: 'educational-use',
    attribution: 'SLR test demonstration. Based on Campbell\'s Operative Orthopaedics. Educational use.',
    relatedPearls: ['rygg-pearl-003']
  }
];

// =============================================================================
// SURGICAL TECHNIQUE IMAGES
// =============================================================================

export const SURGICAL_IMAGES: MedicalImage[] = [
  {
    id: 'tha-cup-positioning',
    type: 'surgical',
    title: 'THA Cup Positioning Technique',
    description: 'Intraoperativ bild som visar korrekt cup-positionering vid THA enligt Lewinnek safe zone.',
    path: '/images/surgical/tha-cup-positioning.jpg',
    domain: 'höft',
    level: 'st3',
    tags: ['THA', 'cup', 'positionering', 'kirurgi'],
    source: {
      type: 'textbook',
      name: "Campbell's Operative Orthopaedics",
      citation: "Total hip arthroplasty technique. Campbell's Operative Orthopaedics, 13th Ed."
    },
    license: 'educational-use',
    attribution: 'THA cup positioning. Based on Campbell\'s Operative Orthopaedics. Educational use.',
    relatedQuestions: ['hoeft-004'],
    relatedCases: ['st3-1']
  },

  {
    id: 'acl-reconstruction-tunnels',
    type: 'surgical',
    title: 'ACL Reconstruction - Tunnel Placement',
    description: 'Artroskopisk bild som visar korrekt tunnel-placering vid ACL-rekonstruktion.',
    path: '/images/surgical/acl-tunnels.jpg',
    domain: 'knä',
    level: 'st3',
    tags: ['ACL', 'rekonstruktion', 'tunnels', 'artroskopi'],
    source: {
      type: 'textbook',
      name: "Campbell's Operative Orthopaedics",
      citation: "ACL reconstruction technique. Campbell's Operative Orthopaedics, 13th Ed."
    },
    license: 'educational-use',
    attribution: 'ACL reconstruction tunnels. Based on Campbell\'s Operative Orthopaedics. Educational use.',
    relatedQuestions: ['kna-003'],
    relatedPearls: ['sport-pearl-004']
  },

  {
    id: 'rotator-cuff-suture-bridge',
    type: 'surgical',
    title: 'Rotator Cuff - Suture Bridge Technique',
    description: 'Artroskopisk bild av suture bridge-teknik för rotator cuff-reparation.',
    path: '/images/surgical/rotator-cuff-suture-bridge.jpg',
    domain: 'axel-armbåge',
    level: 'st3',
    tags: ['rotator cuff', 'suture bridge', 'artroskopi', 'reparation'],
    source: {
      type: 'textbook',
      name: "Campbell's Operative Orthopaedics",
      citation: "Rotator cuff repair techniques. Campbell's Operative Orthopaedics, 13th Ed."
    },
    license: 'educational-use',
    attribution: 'Suture bridge technique. Based on Campbell\'s Operative Orthopaedics. Educational use.',
    relatedQuestions: ['axel-004'],
    relatedCases: ['st2-1']
  }
];

// =============================================================================
// IMAGE COLLECTIONS
// =============================================================================

export const IMAGE_COLLECTIONS: ImageCollection[] = [
  {
    id: 'hip-fractures-collection',
    name: 'Hip Fractures - Complete Guide',
    description: 'Comprehensive collection covering Garden classification, surgical techniques, and complications.',
    images: [
      'garden-classification-diagram',
      'garden-iv-xray',
      'hip-blood-supply',
      'tha-cup-positioning',
      'lewinnek-safe-zone'
    ],
    domain: 'höft'
  },

  {
    id: 'knee-ligament-injuries',
    name: 'Knee Ligament Injuries',
    description: 'ACL anatomy, clinical examination, and reconstruction techniques.',
    images: [
      'acl-anatomy-biomechanics',
      'lachman-test-technique',
      'acl-reconstruction-tunnels'
    ],
    domain: 'knä'
  },

  {
    id: 'classification-systems',
    name: 'Orthopaedic Classification Systems',
    description: 'Essential classification systems every orthopaedic resident should know.',
    images: [
      'garden-classification-diagram',
      'gustilo-anderson-classification',
      'weber-classification-ankle',
      'paprosky-classification',
      'gartland-classification',
      'enneking-staging'
    ]
  },

  {
    id: 'clinical-examination',
    name: 'Clinical Examination Techniques',
    description: 'Step-by-step guides for essential orthopaedic physical examination tests.',
    images: [
      'lachman-test-technique',
      'jobe-test-empty-can',
      'thompson-test-achilles',
      'straight-leg-raise-test'
    ]
  }
];

// =============================================================================
// EXPORT ALL IMAGES
// =============================================================================

export const ALL_MEDICAL_IMAGES: MedicalImage[] = [
  ...CLASSIFICATION_IMAGES,
  ...XRAY_IMAGES,
  ...ANATOMICAL_ILLUSTRATIONS,
  ...CLINICAL_EXAM_IMAGES,
  ...SURGICAL_IMAGES
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function getImageById(id: string): MedicalImage | undefined {
  return ALL_MEDICAL_IMAGES.find(img => img.id === id);
}

export function getImagesByDomain(domain: string): MedicalImage[] {
  return ALL_MEDICAL_IMAGES.filter(img => img.domain === domain);
}

export function getImagesByType(type: string): MedicalImage[] {
  return ALL_MEDICAL_IMAGES.filter(img => img.type === type);
}

export function getImagesByQuestion(questionId: string): MedicalImage[] {
  return ALL_MEDICAL_IMAGES.filter(img =>
    img.relatedQuestions?.includes(questionId)
  );
}

export function getImagesByCase(caseId: string): MedicalImage[] {
  return ALL_MEDICAL_IMAGES.filter(img =>
    img.relatedCases?.includes(caseId)
  );
}

export function getImagesByPearl(pearlId: string): MedicalImage[] {
  return ALL_MEDICAL_IMAGES.filter(img =>
    img.relatedPearls?.includes(pearlId)
  );
}

export function getCollectionById(id: string): ImageCollection | undefined {
  return IMAGE_COLLECTIONS.find(col => col.id === id);
}

export function getImagesInCollection(collectionId: string): MedicalImage[] {
  const collection = getCollectionById(collectionId);
  if (!collection) return [];

  return collection.images
    .map(imgId => getImageById(imgId))
    .filter((img): img is MedicalImage => img !== undefined);
}

/**
 * Format full attribution text for display
 */
export function formatImageAttribution(image: MedicalImage): string {
  let attribution = image.attribution;

  if (image.source.url) {
    attribution += ` Available at: ${image.source.url}`;
  }

  if (image.source.doi) {
    attribution += ` DOI: ${image.source.doi}`;
  }

  return attribution;
}

/**
 * Get image statistics
 */
export function getImageStats() {
  const byType: Record<string, number> = {};
  const byDomain: Record<string, number> = {};
  const byLicense: Record<string, number> = {};

  ALL_MEDICAL_IMAGES.forEach(img => {
    byType[img.type] = (byType[img.type] || 0) + 1;
    byDomain[img.domain] = (byDomain[img.domain] || 0) + 1;
    byLicense[img.license] = (byLicense[img.license] || 0) + 1;
  });

  return {
    total: ALL_MEDICAL_IMAGES.length,
    collections: IMAGE_COLLECTIONS.length,
    byType,
    byDomain,
    byLicense
  };
}
