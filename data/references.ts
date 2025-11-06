/**
 * Källhänvisningar och Referenser för OrtoKompanion
 *
 * All medicinsk information måste kunna härledas till evidensbaserade källor.
 * Detta system tillhandahåller referenser för alla frågor, fall och kliniska pärlor.
 */

export interface Reference {
  id: string;
  type: 'textbook' | 'guideline' | 'article' | 'registry' | 'website' | 'course';
  title: string;
  authors?: string[];
  year?: number;
  publisher?: string;
  journal?: string;
  volume?: string;
  pages?: string;
  doi?: string;
  url?: string;
  isbn?: string;
  notes?: string;
}

// ==================== SVENSKA KÄLLOR ====================

export const SWEDISH_REFERENCES: Reference[] = [
  {
    id: 'socialstyrelsen-2021',
    type: 'guideline',
    title: 'Specialiseringstjänstgöring för läkare - Målbeskrivning Ortopedi',
    authors: ['Socialstyrelsen'],
    year: 2021,
    publisher: 'Socialstyrelsen',
    url: 'https://www.socialstyrelsen.se/kunskapsstod-och-regler/regler-och-riktlinjer/foreskrifter-och-allmanna-rad/konsoliderade-foreskrifter/202111-om-specialiseringstjanstgoring-for-lakare/',
    notes: 'Officiella specialiseringsmål för ortopedi i Sverige (SOSFS 2021:11)',
  },
  {
    id: 'svorf-handbook-2023',
    type: 'guideline',
    title: 'Svenska Ortopediska Föreningens Handbok',
    authors: ['Svenska Ortopediska Föreningen (SVORF)'],
    year: 2023,
    publisher: 'SVORF',
    url: 'https://svorf.se',
    notes: 'Nationella riktlinjer för ortopedisk behandling',
  },
  {
    id: 'atls-sverige-2022',
    type: 'course',
    title: 'Advanced Trauma Life Support (ATLS) - Swedish Edition',
    authors: ['American College of Surgeons'],
    year: 2022,
    publisher: 'ACS',
    notes: 'ATLS-kurs adapted för svensk sjukvård, 10:e utgåvan',
  },
  // Swedish Priority Sources - Added 2024-11-02
  {
    id: 'svorf-handbook-2023',
    type: 'textbook',
    title: 'SVORF Handbok för Ortopedisk Forskning och Utveckling',
    authors: ['Svenska Ortopediska Föreningen'],
    year: 2023,
    publisher: 'SVORF',
    url: 'https://svorf.se/dokument/handbok',
    notes: 'Nationell handbok för ortopedisk forskning och utveckling',
  },
  {
    id: 'lof-vardskadeforsikring-2023',
    type: 'guideline',
    title: 'Vårdskadeförsäkring - Ortopediska komplikationer',
    authors: ['Landstingens Ömsesidiga Försäkringsbolag'],
    year: 2023,
    publisher: 'LÖF',
    url: 'https://lof.se/vardgivare/ortopedi',
    notes: 'Riktlinjer för hantering av ortopediska vårdskador',
  },
  {
    id: 'sbu-ortopedi-2023',
    type: 'guideline',
    title: 'SBU-rapporter om ortopediska behandlingar',
    authors: ['Statens beredning för medicinsk och social utvärdering'],
    year: 2023,
    publisher: 'SBU',
    url: 'https://www.sbu.se/sv/publikationer/sbu-kommentar/ortopedi/',
    notes: 'Evidensbaserade utvärderingar av ortopediska behandlingar',
  },
  {
    id: 'lakemedelsveket-ortopedi-2023',
    type: 'guideline',
    title: 'Läkemedelsbehandling vid ortopediska tillstånd',
    authors: ['Läkemedelsverket'],
    year: 2023,
    publisher: 'Läkemedelsverket',
    url: 'https://www.lakemedelsverket.se/sv/behandling-och-forskrivning/behandlingsrekommendationer/ortopedi',
    notes: 'Nationella rekommendationer för läkemedelsbehandling',
  },
  {
    id: 'karolinska-ortopedi-2023',
    type: 'guideline',
    title: 'Karolinska Universitetsjukhusets Ortopediska Riktlinjer',
    authors: ['Karolinska Universitetssjukhuset'],
    year: 2023,
    publisher: 'Karolinska Universitetssjukhuset',
    url: 'https://www.karolinska.se/for-vardgivare/tema/rorelseapparaten/ortopedi/',
    notes: 'Kliniska riktlinjer från Karolinska Universitetssjukhuset',
  },
  {
    id: 'rikshoft-2023',
    type: 'registry',
    title: 'Svenska Höftprotesregistret Årsrapport 2023',
    authors: ['Svenska Höftprotesregistret'],
    year: 2023,
    publisher: 'Rikshöft',
    url: 'https://shpr.registercentrum.se/shar-in-english/annual-reports/p/SkhWYXBsW',
    notes: 'Årlig rapport med svenska data om höftproteser och resultat',
  },
  {
    id: 'rikskna-2023',
    type: 'registry',
    title: 'Svenska Knäprotesregistret Årsrapport 2023',
    authors: ['Svenska Knäprotesregistret'],
    year: 2023,
    publisher: 'SKAR',
    url: 'https://www.myknee.se/arsrapporter/',
    notes: 'Årlig rapport med svenska data om knäproteser',
  },
];

// ==================== INTERNATIONELLA LÄROBÖCKER ====================

export const TEXTBOOK_REFERENCES: Reference[] = [
  {
    id: 'campbell-13ed',
    type: 'textbook',
    title: "Campbell's Operative Orthopaedics, 13th Edition",
    authors: ['Azar FM', 'Beaty JH', 'Canale ST'],
    year: 2021,
    publisher: 'Elsevier',
    isbn: '978-0323672276',
    notes: 'Guldstandard för ortopedisk kirurgi, 4 volymer',
  },
  {
    id: 'rockwood-9ed',
    type: 'textbook',
    title: "Rockwood and Green's Fractures in Adults, 9th Edition",
    authors: ['Court-Brown CM', 'Heckman JD', 'McQueen MM', 'Ricci WM', 'Tornetta P'],
    year: 2019,
    publisher: 'Wolters Kluwer',
    isbn: '978-1496386717',
    notes: 'Omfattande referens för frakturbehandling',
  },
  {
    id: 'miller-8ed',
    type: 'textbook',
    title: "Miller's Review of Orthopaedics, 8th Edition",
    authors: ['Thompson SR', 'Miller MD'],
    year: 2020,
    publisher: 'Elsevier',
    isbn: '978-0323609784',
    notes: 'Populär för board preparation och översikt',
  },
  {
    id: 'tachdjian-5ed',
    type: 'textbook',
    title: "Tachdjian's Pediatric Orthopaedics, 5th Edition",
    authors: ['Herring JA'],
    year: 2013,
    publisher: 'Saunders',
    isbn: '978-1437724530',
    notes: 'Referensverk för barnortopedi',
  },
  {
    id: 'green-8ed',
    type: 'textbook',
    title: "Green's Operative Hand Surgery, 8th Edition",
    authors: ['Wolfe SW', 'Pederson WC', 'Kozin SH', 'Cohen MS'],
    year: 2022,
    publisher: 'Elsevier',
    isbn: '978-0323697156',
    notes: 'Standardverk för handkirurgi',
  },
];

// ==================== KLINISKA RIKTLINJER ====================

export const GUIDELINE_REFERENCES: Reference[] = [
  {
    id: 'nice-hip-fracture-2023',
    type: 'guideline',
    title: 'Hip Fracture: Management (NICE Guideline CG124)',
    authors: ['National Institute for Health and Care Excellence'],
    year: 2023,
    publisher: 'NICE',
    url: 'https://www.nice.org.uk/guidance/cg124',
    notes: 'Evidence-based guidelines för höftfrakturbehandling',
  },
  {
    id: 'aaos-acl-2022',
    type: 'guideline',
    title: 'Management of Anterior Cruciate Ligament Injuries: Clinical Practice Guideline',
    authors: ['American Academy of Orthopaedic Surgeons'],
    year: 2022,
    publisher: 'AAOS',
    url: 'https://www.aaos.org/acl-cpg',
    notes: 'AAOS clinical practice guideline för ACL-skador',
  },
  {
    id: 'boast-open-fractures-2020',
    type: 'guideline',
    title: 'Open Fractures (BOAST 4)',
    authors: ['British Orthopaedic Association'],
    year: 2020,
    publisher: 'BOA',
    url: 'https://www.boa.ac.uk/resources/boast-4-pdf.html',
    notes: 'UK guidelines för öppna frakturer, inkl. antibiotika',
  },
  {
    id: 'sccm-ottawa-rules',
    type: 'article',
    title: 'The Ottawa Ankle Rules',
    authors: ['Stiell IG', 'Greenberg GH', 'McKnight RD', 'et al'],
    year: 1993,
    journal: 'Annals of Emergency Medicine',
    volume: '21',
    pages: '384-390',
    doi: '10.1016/s0196-0644(05)82656-3',
    notes: 'Original publication av Ottawa Ankle Rules',
  },
  {
    id: 'ottawa-knee-rules-1997',
    type: 'article',
    title: 'Implementation of the Ottawa Knee Rule for Use of Radiography in Acute Knee Injuries',
    authors: ['Stiell IG', 'Greenberg GH', 'Wells GA', 'et al'],
    year: 1997,
    journal: 'JAMA',
    volume: '278',
    pages: '2075-2079',
    doi: '10.1001/jama.1997.03550230051036',
    notes: 'Original publication av Ottawa Knee Rules',
  },
];

// ==================== KLASSIFIKATIONSSYSTEM ====================

export const CLASSIFICATION_REFERENCES: Reference[] = [
  {
    id: 'gustilo-1976',
    type: 'article',
    title: 'Prevention of Infection in the Treatment of One Thousand and Twenty-five Open Fractures of Long Bones',
    authors: ['Gustilo RB', 'Anderson JT'],
    year: 1976,
    journal: 'Journal of Bone and Joint Surgery (Am)',
    volume: '58',
    pages: '453-458',
    notes: 'Original Gustilo-Anderson klassificering för öppna frakturer',
  },
  {
    id: 'garden-1961',
    type: 'article',
    title: 'Low-angle fixation in fractures of the femoral neck',
    authors: ['Garden RS'],
    year: 1961,
    journal: 'Journal of Bone and Joint Surgery (Br)',
    volume: '43-B',
    pages: '647-663',
    notes: 'Garden klassificering av collumfrakturer',
  },
  {
    id: 'weber-1972',
    type: 'article',
    title: 'An Evaluation of the Results of Operative Treatment of Ankle Fractures',
    authors: ['Weber BG'],
    year: 1972,
    journal: 'Archiv für Orthopädische und Unfall-Chirurgie',
    volume: '73',
    pages: '113-130',
    notes: 'Weber klassificering av fotledsfrakturer',
  },
  {
    id: 'enneking-1980',
    type: 'article',
    title: 'A System for the Surgical Staging of Musculoskeletal Sarcoma',
    authors: ['Enneking WF', 'Spanier SS', 'Goodman MA'],
    year: 1980,
    journal: 'Clinical Orthopaedics and Related Research',
    volume: '153',
    pages: '106-120',
    notes: 'Enneking staging system för bentumörer',
  },
  {
    id: 'paprosky-1994',
    type: 'article',
    title: 'Acetabular Defect Classification and Surgical Reconstruction in Revision Arthroplasty',
    authors: ['Paprosky WG', 'Perona PG', 'Lawrence JM'],
    year: 1994,
    journal: 'Journal of Arthroplasty',
    volume: '9',
    pages: '33-44',
    doi: '10.1016/0883-5403(94)90135-x',
    notes: 'Paprosky klassificering för acetabulär benförlust vid revision',
  },
  {
    id: 'gartland-1959',
    type: 'article',
    title: 'Management of Supracondylar Fractures of the Humerus in Children',
    authors: ['Gartland JJ'],
    year: 1959,
    journal: 'Surgery, Gynecology & Obstetrics',
    volume: '109',
    pages: '145-154',
    notes: 'Gartland klassificering av suprakondylära humerusfrakturer',
  },
];

// ==================== MODERNA STUDIER & EBM ====================

export const EVIDENCE_REFERENCES: Reference[] = [
  {
    id: 'crash-2-2010',
    type: 'article',
    title: 'Effects of Tranexamic Acid on Death, Vascular Occlusive Events, and Blood Transfusion in Trauma Patients with Significant Haemorrhage (CRASH-2)',
    authors: ['CRASH-2 Trial Collaborators'],
    year: 2010,
    journal: 'Lancet',
    volume: '376',
    pages: '23-32',
    doi: '10.1016/S0140-6736(10)60835-5',
    notes: 'Landmark study för TXA vid trauma',
  },
  {
    id: 'moon-txa-2016',
    type: 'article',
    title: 'Reducing Blood Loss in Proximal Femoral Fracture Surgery using Tranexamic Acid: A Randomized Controlled Trial',
    authors: ['Tengberg PT', 'Foss NB', 'Palm H', 'et al'],
    year: 2016,
    journal: 'HIP International',
    volume: '26',
    pages: '557-562',
    doi: '10.5301/hipint.5000391',
    notes: 'TXA-studie specifikt för höftfrakturer',
  },
  {
    id: 'kannus-achilles-2002',
    type: 'article',
    title: 'Treatment for Acute Achilles Tendon Rupture: A Systematic Review',
    authors: ['Khan RJ', 'Fick D', 'Keogh A', 'et al'],
    year: 2005,
    journal: 'Journal of Bone and Joint Surgery (Am)',
    volume: '87',
    pages: '2202-2210',
    doi: '10.2106/JBJS.D.02591',
    notes: 'Systematisk review - konservativ vs kirurgisk Achilles-behandling',
  },
  {
    id: 'kinematic-alignment-2019',
    type: 'article',
    title: 'Kinematic Alignment in Total Knee Arthroplasty: A Systematic Review',
    authors: ['Yoon JR', 'Han SB', 'Jee MK', 'Shin YS'],
    year: 2019,
    journal: 'Knee Surgery & Related Research',
    volume: '31',
    pages: '1-10',
    doi: '10.1186/s43019-019-0010-9',
    notes: 'Review av kinematic alignment vid TKA',
  },
  {
    id: 'police-principle-2019',
    type: 'article',
    title: 'Soft Tissue Injuries Simply Need PEACE and LOVE',
    authors: ['Dubois B', 'Esculier JF'],
    year: 2019,
    journal: 'British Journal of Sports Medicine',
    volume: '54',
    pages: '72-73',
    doi: '10.1136/bjsports-2019-101253',
    notes: 'PEACE & LOVE principle för akuta mjukdelsskador (uppdaterad RICE)',
  },
  {
    id: 'lewinnek-1978',
    type: 'article',
    title: 'Dislocations After Total Hip-Replacement Arthroplasties',
    authors: ['Lewinnek GE', 'Lewis JL', 'Tarr R', 'et al'],
    year: 1978,
    journal: 'Journal of Bone and Joint Surgery (Am)',
    volume: '60',
    pages: '217-220',
    notes: 'Original beskrivning av Lewinnek safe zone för THA',
  },
];

// ==================== HJÄLPFUNKTIONER ====================

export const ALL_REFERENCES: Reference[] = [
  ...SWEDISH_REFERENCES,
  ...TEXTBOOK_REFERENCES,
  ...GUIDELINE_REFERENCES,
  ...CLASSIFICATION_REFERENCES,
  ...EVIDENCE_REFERENCES,
];

export function getReferenceById(id: string): Reference | undefined {
  return ALL_REFERENCES.find(ref => ref.id === id);
}

export function getReferencesById(ids: string[]): Reference[] {
  return ids.map(id => getReferenceById(id)).filter((ref): ref is Reference => ref !== undefined);
}

export function formatReference(ref: Reference): string {
  let formatted = '';

  if (ref.authors && ref.authors.length > 0) {
    if (ref.authors.length <= 3) {
      formatted += ref.authors.join(', ');
    } else {
      formatted += `${ref.authors[0]}, et al`;
    }
    formatted += '. ';
  }

  formatted += ref.title;

  if (ref.journal) {
    formatted += `. ${ref.journal}`;
    if (ref.year) formatted += ` (${ref.year})`;
    if (ref.volume) formatted += `;${ref.volume}`;
    if (ref.pages) formatted += `:${ref.pages}`;
  } else if (ref.publisher) {
    if (ref.year) formatted += ` (${ref.year})`;
    formatted += `. ${ref.publisher}`;
  }

  if (ref.doi) {
    formatted += `. doi: ${ref.doi}`;
  } else if (ref.url) {
    formatted += `. Tillgänglig: ${ref.url}`;
  }

  return formatted;
}

export function formatReferenceAPA(ref: Reference): string {
  let formatted = '';

  // Authors
  if (ref.authors && ref.authors.length > 0) {
    const authorList = ref.authors.map((author, index) => {
      if (index === ref.authors!.length - 1 && ref.authors!.length > 1) {
        return `& ${author}`;
      }
      return author;
    });
    formatted += authorList.join(', ');
  }

  // Year
  if (ref.year) {
    formatted += ` (${ref.year})`;
  }
  formatted += '. ';

  // Title
  formatted += ref.title;

  // Journal article
  if (ref.journal) {
    formatted += `. ${ref.journal}`;
    if (ref.volume) formatted += `, ${ref.volume}`;
    if (ref.pages) formatted += `, ${ref.pages}`;
  }
  // Book
  else if (ref.publisher) {
    formatted += `. ${ref.publisher}`;
  }

  // DOI or URL
  if (ref.doi) {
    formatted += `. https://doi.org/${ref.doi}`;
  } else if (ref.url) {
    formatted += `. ${ref.url}`;
  }

  return formatted;
}

export function getReferencesByType(type: Reference['type']): Reference[] {
  return ALL_REFERENCES.filter(ref => ref.type === type);
}

export function getSwedishReferences(): Reference[] {
  return SWEDISH_REFERENCES;
}

export function searchReferences(query: string): Reference[] {
  const lowerQuery = query.toLowerCase();
  return ALL_REFERENCES.filter(ref =>
    ref.title.toLowerCase().includes(lowerQuery) ||
    ref.authors?.some(author => author.toLowerCase().includes(lowerQuery)) ||
    ref.notes?.toLowerCase().includes(lowerQuery)
  );
}
