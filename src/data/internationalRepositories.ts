export interface UniversityRepo {
  id: string;
  name: string;
  shortName: string;
  country: string;
  region: 'Africa' | 'Europe' | 'Americas' | 'Asia-Pacific' | 'Middle East';
  city: string;
  openAlexId?: string;
  repoUrl?: string;
  oaiPmhUrl?: string;
  description: string;
  established?: number;
  flagship?: boolean;
}

export const INTERNATIONAL_REPOSITORIES: UniversityRepo[] = [
  // ─── Africa ───────────────────────────────────────────────────────────────
  {
    id: 'uz', name: 'University of Zimbabwe', shortName: 'UZ',
    country: 'Zimbabwe', region: 'Africa', city: 'Harare',
    openAlexId: 'I170498629',
    repoUrl: 'https://uzspace.uz.ac.zw',
    description: 'Zimbabwe\'s oldest and largest university, leading research in medicine, agriculture and engineering.',
    established: 1952, flagship: true,
  },
  {
    id: 'nust', name: 'National University of Science and Technology', shortName: 'NUST',
    country: 'Zimbabwe', region: 'Africa', city: 'Bulawayo',
    description: 'Zimbabwe\'s premier science and technology university.',
    established: 1991, flagship: true,
  },
  {
    id: 'msu-zw', name: 'Midlands State University', shortName: 'MSU',
    country: 'Zimbabwe', region: 'Africa', city: 'Gweru',
    description: 'A comprehensive Zimbabwean university with strong business and social sciences programs.',
    established: 1999, flagship: true,
  },
  {
    id: 'uct', name: 'University of Cape Town', shortName: 'UCT',
    country: 'South Africa', region: 'Africa', city: 'Cape Town',
    openAlexId: 'I188919182',
    repoUrl: 'https://open.uct.ac.za',
    description: 'Africa\'s top-ranked university and global research leader.',
    established: 1829, flagship: true,
  },
  {
    id: 'wits', name: 'University of the Witwatersrand', shortName: 'Wits',
    country: 'South Africa', region: 'Africa', city: 'Johannesburg',
    openAlexId: 'I162386692',
    repoUrl: 'https://wiredspace.wits.ac.za',
    description: 'A leading research university in mining, health sciences, and engineering.',
    established: 1922, flagship: true,
  },
  {
    id: 'stellenbosch', name: 'Stellenbosch University', shortName: 'SU',
    country: 'South Africa', region: 'Africa', city: 'Stellenbosch',
    openAlexId: 'I204465549',
    repoUrl: 'https://scholar.sun.ac.za',
    description: 'Leading Afrikaans research university with strong agriculture and engineering faculties.',
    established: 1918,
  },
  {
    id: 'uon', name: 'University of Nairobi', shortName: 'UoN',
    country: 'Kenya', region: 'Africa', city: 'Nairobi',
    openAlexId: 'I81524015',
    repoUrl: 'https://erepository.uonbi.ac.ke',
    description: 'Kenya\'s oldest and largest university, East Africa\'s research hub.',
    established: 1956, flagship: true,
  },
  {
    id: 'makerere', name: 'Makerere University', shortName: 'Mak',
    country: 'Uganda', region: 'Africa', city: 'Kampala',
    openAlexId: 'I71702244',
    repoUrl: 'https://makir.mak.ac.ug',
    description: 'One of Africa\'s oldest and most prestigious universities.',
    established: 1922, flagship: true,
  },
  {
    id: 'ulag', name: 'University of Lagos', shortName: 'UNILAG',
    country: 'Nigeria', region: 'Africa', city: 'Lagos',
    openAlexId: 'I168453972',
    description: 'Nigeria\'s premier federal university and commercial hub research centre.',
    established: 1962, flagship: true,
  },
  {
    id: 'uibadan', name: 'University of Ibadan', shortName: 'UI',
    country: 'Nigeria', region: 'Africa', city: 'Ibadan',
    openAlexId: 'I18263503',
    repoUrl: 'https://ir.library.ui.edu.ng',
    description: 'Nigeria\'s first university, a leader in tropical medicine and agriculture.',
    established: 1948,
  },
  {
    id: 'ug', name: 'University of Ghana', shortName: 'UG',
    country: 'Ghana', region: 'Africa', city: 'Accra',
    openAlexId: 'I55956389',
    repoUrl: 'https://ugspace.ug.edu.gh',
    description: 'Ghana\'s premier university, a hub for West African research.',
    established: 1948, flagship: true,
  },
  {
    id: 'cairo', name: 'Cairo University', shortName: 'CU',
    country: 'Egypt', region: 'Africa', city: 'Cairo',
    openAlexId: 'I166646929',
    description: 'Egypt\'s oldest and largest university, a cornerstone of Arab academic research.',
    established: 1908, flagship: true,
  },
  {
    id: 'addis', name: 'Addis Ababa University', shortName: 'AAU',
    country: 'Ethiopia', region: 'Africa', city: 'Addis Ababa',
    openAlexId: 'I112380618',
    repoUrl: 'https://etd.aau.edu.et',
    description: 'Ethiopia\'s leading university and East Africa\'s oldest institution of higher learning.',
    established: 1950, flagship: true,
  },
  {
    id: 'udsm', name: 'University of Dar es Salaam', shortName: 'UDSM',
    country: 'Tanzania', region: 'Africa', city: 'Dar es Salaam',
    openAlexId: 'I202434665',
    repoUrl: 'https://repository.udsm.ac.tz',
    description: 'Tanzania\'s oldest university and a major research centre in East Africa.',
    established: 1970,
  },
  {
    id: 'unza', name: 'University of Zambia', shortName: 'UNZA',
    country: 'Zambia', region: 'Africa', city: 'Lusaka',
    openAlexId: 'I204226847',
    repoUrl: 'https://dspace.unza.zm',
    description: 'Zambia\'s first university, leading research in mining and public health.',
    established: 1966,
  },

  // ─── Europe ───────────────────────────────────────────────────────────────
  {
    id: 'oxford', name: 'University of Oxford', shortName: 'Oxford',
    country: 'United Kingdom', region: 'Europe', city: 'Oxford',
    openAlexId: 'I33213144',
    repoUrl: 'https://ora.ox.ac.uk',
    description: 'The world\'s oldest English-speaking university and a global research powerhouse.',
    established: 1096, flagship: true,
  },
  {
    id: 'cambridge', name: 'University of Cambridge', shortName: 'Cambridge',
    country: 'United Kingdom', region: 'Europe', city: 'Cambridge',
    openAlexId: 'I1299303',
    repoUrl: 'https://www.repository.cam.ac.uk',
    description: 'A world-leading research university, home to 121 Nobel laureates.',
    established: 1209, flagship: true,
  },
  {
    id: 'imperial', name: 'Imperial College London', shortName: 'Imperial',
    country: 'United Kingdom', region: 'Europe', city: 'London',
    openAlexId: 'I144903262',
    repoUrl: 'https://spiral.imperial.ac.uk',
    description: 'Top-ranked science, technology, medicine and business research university.',
    established: 1907,
  },
  {
    id: 'eth', name: 'ETH Zurich', shortName: 'ETH',
    country: 'Switzerland', region: 'Europe', city: 'Zurich',
    openAlexId: 'I65923719',
    repoUrl: 'https://www.research-collection.ethz.ch',
    description: 'Europe\'s leading science and technology university, home to 21 Nobel laureates.',
    established: 1855, flagship: true,
  },
  {
    id: 'delft', name: 'Delft University of Technology', shortName: 'TU Delft',
    country: 'Netherlands', region: 'Europe', city: 'Delft',
    openAlexId: 'I36258959',
    repoUrl: 'https://repository.tudelft.nl',
    description: 'Europe\'s largest technical university and a global leader in engineering.',
    established: 1842,
  },
  {
    id: 'lund', name: 'Lund University', shortName: 'LU',
    country: 'Sweden', region: 'Europe', city: 'Lund',
    openAlexId: 'I145525958',
    repoUrl: 'https://lup.lub.lu.se',
    description: 'Scandinavia\'s largest university with a strong tradition of open research.',
    established: 1666,
  },
  {
    id: 'ghent', name: 'Ghent University', shortName: 'UGent',
    country: 'Belgium', region: 'Europe', city: 'Ghent',
    openAlexId: 'I98371032',
    repoUrl: 'https://biblio.ugent.be',
    description: 'Belgium\'s leading research university with a comprehensive open access policy.',
    established: 1817,
  },

  // ─── Americas ─────────────────────────────────────────────────────────────
  {
    id: 'mit', name: 'Massachusetts Institute of Technology', shortName: 'MIT',
    country: 'United States', region: 'Americas', city: 'Cambridge, MA',
    openAlexId: 'I63966007',
    repoUrl: 'https://dspace.mit.edu',
    description: 'The world\'s premier research university for science and technology.',
    established: 1861, flagship: true,
  },
  {
    id: 'harvard', name: 'Harvard University', shortName: 'Harvard',
    country: 'United States', region: 'Americas', city: 'Cambridge, MA',
    openAlexId: 'I136199984',
    repoUrl: 'https://dash.harvard.edu',
    description: 'The oldest university in the US, with the world\'s largest academic library system.',
    established: 1636, flagship: true,
  },
  {
    id: 'stanford', name: 'Stanford University', shortName: 'Stanford',
    country: 'United States', region: 'Americas', city: 'Stanford, CA',
    openAlexId: 'I97018004',
    repoUrl: 'https://purl.stanford.edu',
    description: 'Silicon Valley\'s research engine, producing Nobel laureates and tech leaders.',
    established: 1885, flagship: true,
  },
  {
    id: 'johns-hopkins', name: 'Johns Hopkins University', shortName: 'JHU',
    country: 'United States', region: 'Americas', city: 'Baltimore, MD',
    openAlexId: 'I145311948',
    repoUrl: 'https://jscholarship.library.jhu.edu',
    description: 'America\'s first research university, a global leader in medicine and public health.',
    established: 1876,
  },
  {
    id: 'toronto', name: 'University of Toronto', shortName: 'UofT',
    country: 'Canada', region: 'Americas', city: 'Toronto',
    openAlexId: 'I185261750',
    repoUrl: 'https://tspace.library.utoronto.ca',
    description: 'Canada\'s top research university and a global leader in AI research.',
    established: 1827, flagship: true,
  },
  {
    id: 'mcgill', name: 'McGill University', shortName: 'McGill',
    country: 'Canada', region: 'Americas', city: 'Montreal',
    openAlexId: 'I93952710',
    repoUrl: 'https://escholarship.mcgill.ca',
    description: 'One of Canada\'s leading research universities with a distinguished medical school.',
    established: 1821,
  },
  {
    id: 'usp', name: 'University of São Paulo', shortName: 'USP',
    country: 'Brazil', region: 'Americas', city: 'São Paulo',
    openAlexId: 'I127441231',
    repoUrl: 'https://repositorio.usp.br',
    description: 'Latin America\'s top-ranked university and the region\'s largest research institution.',
    established: 1934, flagship: true,
  },
  {
    id: 'unam', name: 'National Autonomous University of Mexico', shortName: 'UNAM',
    country: 'Mexico', region: 'Americas', city: 'Mexico City',
    openAlexId: 'I177725633',
    repoUrl: 'https://repositorio.unam.mx',
    description: 'Mexico\'s most important university, a UNESCO World Heritage site.',
    established: 1551, flagship: true,
  },

  // ─── Asia-Pacific ─────────────────────────────────────────────────────────
  {
    id: 'nus', name: 'National University of Singapore', shortName: 'NUS',
    country: 'Singapore', region: 'Asia-Pacific', city: 'Singapore',
    openAlexId: 'I66946132',
    repoUrl: 'https://scholarbank.nus.edu.sg',
    description: 'Asia\'s top-ranked university and a global hub for research and innovation.',
    established: 1905, flagship: true,
  },
  {
    id: 'tokyo', name: 'University of Tokyo', shortName: 'UTokyo',
    country: 'Japan', region: 'Asia-Pacific', city: 'Tokyo',
    openAlexId: 'I1338921688',
    repoUrl: 'https://repository.dl.itc.u-tokyo.ac.jp',
    description: 'Japan\'s most prestigious university and Asia\'s premier research institution.',
    established: 1877, flagship: true,
  },
  {
    id: 'peking', name: 'Peking University', shortName: 'PKU',
    country: 'China', region: 'Asia-Pacific', city: 'Beijing',
    openAlexId: 'I201448701',
    description: 'China\'s oldest comprehensive university, a leader in humanities and natural sciences.',
    established: 1898, flagship: true,
  },
  {
    id: 'anu', name: 'Australian National University', shortName: 'ANU',
    country: 'Australia', region: 'Asia-Pacific', city: 'Canberra',
    openAlexId: 'I96210090',
    repoUrl: 'https://openresearch-repository.anu.edu.au',
    description: 'Australia\'s leading research university and national research institute.',
    established: 1946, flagship: true,
  },
  {
    id: 'iitb', name: 'Indian Institute of Technology Bombay', shortName: 'IIT Bombay',
    country: 'India', region: 'Asia-Pacific', city: 'Mumbai',
    openAlexId: 'I208666829',
    repoUrl: 'https://dspace.library.iitb.ac.in',
    description: 'India\'s premier engineering institution and a global centre for STEM research.',
    established: 1958, flagship: true,
  },
  {
    id: 'iitd', name: 'Indian Institute of Technology Delhi', shortName: 'IIT Delhi',
    country: 'India', region: 'Asia-Pacific', city: 'New Delhi',
    openAlexId: 'I130757023',
    repoUrl: 'https://eprint.iitd.ac.in',
    description: 'A world-class engineering and technology research institution.',
    established: 1961,
  },

  // ─── Middle East ──────────────────────────────────────────────────────────
  {
    id: 'aust', name: 'American University of Sharjah', shortName: 'AUS',
    country: 'UAE', region: 'Middle East', city: 'Sharjah',
    openAlexId: 'I37687745',
    repoUrl: 'https://dspace.aus.edu',
    description: 'A leading research university in the Arab world with a diverse international community.',
    established: 1997,
  },
  {
    id: 'kau', name: 'King Abdulaziz University', shortName: 'KAU',
    country: 'Saudi Arabia', region: 'Middle East', city: 'Jeddah',
    openAlexId: 'I13706590',
    description: 'One of the largest universities in the Arab world with a strong research output.',
    established: 1967, flagship: true,
  },
];

export const REGIONS = ['Africa', 'Europe', 'Americas', 'Asia-Pacific', 'Middle East'] as const;
export type Region = typeof REGIONS[number];

export const REGION_META: Record<Region, { flag: string; color: string; bg: string; border: string; count: () => number }> = {
  'Africa': {
    flag: '🌍', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200',
    count: () => INTERNATIONAL_REPOSITORIES.filter(r => r.region === 'Africa').length,
  },
  'Europe': {
    flag: '🇪🇺', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200',
    count: () => INTERNATIONAL_REPOSITORIES.filter(r => r.region === 'Europe').length,
  },
  'Americas': {
    flag: '🌎', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200',
    count: () => INTERNATIONAL_REPOSITORIES.filter(r => r.region === 'Americas').length,
  },
  'Asia-Pacific': {
    flag: '🌏', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200',
    count: () => INTERNATIONAL_REPOSITORIES.filter(r => r.region === 'Asia-Pacific').length,
  },
  'Middle East': {
    flag: '🕌', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200',
    count: () => INTERNATIONAL_REPOSITORIES.filter(r => r.region === 'Middle East').length,
  },
};
