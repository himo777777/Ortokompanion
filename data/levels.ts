import { LevelInfo } from '@/types/education';

export const educationLevels: LevelInfo[] = [
  {
    id: 'student',
    name: 'Läkarstudent',
    description: 'Grundläggande ortopedisk kunskap och anatomi',
    color: 'bg-blue-500',
    focusAreas: [
      'Grundläggande anatomi',
      'Vanliga skador och frakturer',
      'Klinisk undersökning',
      'Radiologisk grundkunskap'
    ],
    difficulty: 1
  },
  {
    id: 'at',
    name: 'AT-läkare',
    description: 'Allmän klinisk kompetens inom ortopedi',
    color: 'bg-green-500',
    focusAreas: [
      'Akut handläggning av ortopediska skador',
      'Frakturbehandling',
      'Gipsning och immobilisering',
      'Primär bedömning av röntgenbilder'
    ],
    difficulty: 2
  },
  {
    id: 'st1',
    name: 'ST1',
    description: 'Första året av specialistutbildning',
    color: 'bg-yellow-500',
    focusAreas: [
      'Traumaortopedi',
      'Grundläggande kirurgiska tekniker',
      'Postoperativ vård',
      'Avancerad bilddiagnostik'
    ],
    difficulty: 3
  },
  {
    id: 'st2',
    name: 'ST2',
    description: 'Andra året av specialistutbildning',
    color: 'bg-orange-500',
    focusAreas: [
      'Elektivortopedi',
      'Artroplastik grundkunskap',
      'Barnortopedi',
      'Handkirurgi'
    ],
    difficulty: 4
  },
  {
    id: 'st3',
    name: 'ST3',
    description: 'Tredje året av specialistutbildning',
    color: 'bg-red-500',
    focusAreas: [
      'Komplex traumakirurgi',
      'Ledersättningskirurgi',
      'Ryggkirurgi',
      'Sportmedicin'
    ],
    difficulty: 5
  },
  {
    id: 'st4',
    name: 'ST4',
    description: 'Fjärde året av specialistutbildning',
    color: 'bg-purple-500',
    focusAreas: [
      'Avancerad artroplastik',
      'Revisionskirurgi',
      'Tumörkirurgi',
      'Komplexa rekonstruktioner'
    ],
    difficulty: 6
  },
  {
    id: 'st5',
    name: 'ST5',
    description: 'Femte året av specialistutbildning',
    color: 'bg-pink-500',
    focusAreas: [
      'Subspecialisering',
      'Komplicerade fall',
      'Forskning och utveckling',
      'Undervisning'
    ],
    difficulty: 7
  },
  // ST-läkare från andra specialiteter
  {
    id: 'st-allmänmedicin',
    name: 'ST-Allmänmedicin',
    description: 'Med ortopedi-placering',
    color: 'bg-teal-500',
    focusAreas: [
      'Primärvårdsortopedi',
      'Muskuloskeletala besvär',
      'Remisshantering',
      'Rehabilitering'
    ],
    difficulty: 3
  },
  {
    id: 'st-akutsjukvård',
    name: 'ST-Akutsjukvård',
    description: 'Med ortopedi-placering',
    color: 'bg-rose-500',
    focusAreas: [
      'Akut traumahandläggning',
      'Frakturdiagnostik',
      'Luxationer och reposition',
      'Smärtlindring'
    ],
    difficulty: 3
  },
  // Specialister
  {
    id: 'specialist-ortopedi',
    name: 'Specialist Ortopedi',
    description: 'Fortbildning och uppdatering',
    color: 'bg-indigo-500',
    focusAreas: [
      'Nya tekniker och material',
      'Evidensbaserad medicin',
      'Komplicerade revisioner',
      'Forskning och innovation'
    ],
    difficulty: 8
  },
  {
    id: 'specialist-allmänmedicin',
    name: 'Specialist Allmänmedicin',
    description: 'Ortopedi-fortbildning',
    color: 'bg-cyan-500',
    focusAreas: [
      'Uppdatera ortopedikunskaper',
      'Primärvårdsortopedi',
      'Evidensbaserade riktlinjer',
      'Remissrutiner'
    ],
    difficulty: 6
  },
  {
    id: 'specialist-akutsjukvård',
    name: 'Specialist Akutsjukvård',
    description: 'Ortopedi-fortbildning',
    color: 'bg-amber-500',
    focusAreas: [
      'Uppdatera akutortopedi',
      'Traumahantering',
      'Nya riktlinjer',
      'Komplikationshantering'
    ],
    difficulty: 6
  }
];
