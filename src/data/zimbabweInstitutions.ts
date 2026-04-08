export interface ZimbabweInstitution {
  id: string;
  name: string;
  type: 'Public University' | 'Private University' | 'Polytechnic' | 'Vocational Training Centre' | 'Specialized Training College';
  focus: string[];
  location?: string;
  description?: string;
}

export const ZIMBABWE_INSTITUTIONS: ZimbabweInstitution[] = [
  // 1. Universities
  {
    id: 'uz',
    name: 'University of Zimbabwe (UZ)',
    type: 'Public University',
    focus: ['Medicine', 'Law', 'Engineering', 'Social Sciences'],
    location: 'Harare'
  },
  {
    id: 'nust',
    name: 'NUST (Bulawayo)',
    type: 'Public University',
    focus: ['Applied Sciences', 'Engineering', 'Commerce'],
    location: 'Bulawayo'
  },
  {
    id: 'msu',
    name: 'Midlands State University (MSU)',
    type: 'Public University',
    focus: ['Arts', 'Commerce', 'Law', 'Social Sciences'],
    location: 'Gweru'
  },
  {
    id: 'cut',
    name: 'Chinhoyi University of Technology (CUT)',
    type: 'Public University',
    focus: ['Technology', 'Engineering', 'Hospitality'],
    location: 'Chinhoyi'
  },
  {
    id: 'hit',
    name: 'Harare Institute of Technology (HIT)',
    type: 'Public University',
    focus: ['Software Engineering', 'Biotechnology'],
    location: 'Harare'
  },
  {
    id: 'gzu',
    name: 'Great Zimbabwe University (GZU)',
    type: 'Public University',
    focus: ['Heritage Studies', 'Education', 'Law'],
    location: 'Masvingo'
  },
  {
    id: 'buse',
    name: 'Bindura University (BUSE)',
    type: 'Public University',
    focus: ['Science Education', 'Agriculture'],
    location: 'Bindura'
  },
  {
    id: 'lsu',
    name: 'Lupane State University (LSU)',
    type: 'Public University',
    focus: ['Agricultural Sciences', 'Social Sciences'],
    location: 'Lupane'
  },
  {
    id: 'zou',
    name: 'Zimbabwe Open University (ZOU)',
    type: 'Public University',
    focus: ['Distance Learning'],
    location: 'National'
  },
  {
    id: 'gsu',
    name: 'Gwanda State University (GSU)',
    type: 'Public University',
    focus: ['Engineering', 'Agriculture'],
    location: 'Gwanda'
  },
  {
    id: 'msuas',
    name: 'Manicaland State University (MSUAS)',
    type: 'Public University',
    focus: ['Applied Sciences', 'Engineering'],
    location: 'Mutare'
  },
  {
    id: 'muast',
    name: 'Marondera University (MUAST)',
    type: 'Public University',
    focus: ['Agricultural Sciences', 'Technology'],
    location: 'Marondera'
  },
  {
    id: 'au',
    name: 'Africa University (AU)',
    type: 'Private University',
    focus: ['Peace Studies', 'Theology', 'Health Sciences'],
    location: 'Mutare'
  },
  {
    id: 'solusi',
    name: 'Solusi University',
    type: 'Private University',
    focus: ['Business', 'Education', 'Science'],
    location: 'Bulawayo'
  },
  {
    id: 'cuz',
    name: 'Catholic University of Zimbabwe',
    type: 'Private University',
    focus: ['Arts', 'Commerce', 'Social Sciences'],
    location: 'Harare'
  },
  {
    id: 'wua',
    name: "Women's University in Africa",
    type: 'Private University',
    focus: ['Gender Studies', 'Social Sciences'],
    location: 'Harare'
  },
  {
    id: 'zegu',
    name: 'Zimbabwe Ezekiel Guti University',
    type: 'Private University',
    focus: ['Law', 'Commerce', 'Social Sciences'],
    location: 'Bindura'
  },
  // 2. Polytechnics
  {
    id: 'harare-poly',
    name: 'Harare Polytechnic',
    type: 'Polytechnic',
    focus: ['Engineering', 'Automotive', 'Civil', 'Electrical', 'Printing', 'Journalism'],
    location: 'Harare'
  },
  {
    id: 'bulawayo-poly',
    name: 'Bulawayo Polytechnic',
    type: 'Polytechnic',
    focus: ['Applied Science', 'Mechanical Engineering', 'Commerce'],
    location: 'Bulawayo'
  },
  {
    id: 'gweru-poly',
    name: 'Gweru Polytechnic',
    type: 'Polytechnic',
    focus: ['Business Studies', 'Information Technology', 'Electrical Power'],
    location: 'Gweru'
  },
  {
    id: 'mutare-poly',
    name: 'Mutare Polytechnic',
    type: 'Polytechnic',
    focus: ['Construction', 'Commerce', 'Hospitality'],
    location: 'Mutare'
  },
  {
    id: 'kwekwe-poly',
    name: 'Kwekwe Polytechnic',
    type: 'Polytechnic',
    focus: ['Heavy Engineering', 'Automotive Trades'],
    location: 'Kwekwe'
  },
  {
    id: 'masvingo-poly',
    name: 'Masvingo Polytechnic',
    type: 'Polytechnic',
    focus: ['Office Management', 'Technical Trades'],
    location: 'Masvingo'
  },
  {
    id: 'jmn-poly',
    name: 'Joshua Mqabuko Nkomo Polytechnic',
    type: 'Polytechnic',
    focus: ['Education', 'Technical Engineering'],
    location: 'Gwanda'
  },
  {
    id: 'kushinga-poly',
    name: 'Kushinga Phikelela Polytechnic',
    type: 'Polytechnic',
    focus: ['Business', 'Secretarial Studies'],
    location: 'Marondera'
  },
  {
    id: 'lighthouse-poly',
    name: 'Lighthouse Polytechnic',
    type: 'Polytechnic',
    focus: ['Business', 'STEM Education'],
    location: 'Private'
  },
  // 3. Vocational Training Centres
  {
    id: 'magamba-vtc',
    name: 'Magamba VTC',
    type: 'Vocational Training Centre',
    focus: ['Commercial Agriculture', 'Motor Mechanics'],
    location: 'Mutare'
  },
  {
    id: 'mupfure-itc',
    name: 'Mupfure Industrial Training College',
    type: 'Vocational Training Centre',
    focus: ['Agriculture', 'Engineering'],
    location: 'Chegutu'
  },
  {
    id: 'msasa-itc',
    name: 'Msasa Industrial Training College',
    type: 'Vocational Training Centre',
    focus: ['Industrial trades', 'Technology'],
    location: 'Harare'
  },
  {
    id: 'westgate-itc',
    name: 'Westgate Industrial Training College',
    type: 'Vocational Training Centre',
    focus: ['Mechanical', 'Electrical trades'],
    location: 'Bulawayo'
  },
  {
    id: 'st-peters',
    name: "St. Peter's Kubatana",
    type: 'Vocational Training Centre',
    focus: ['Technical', 'Building trades'],
    location: 'Harare'
  },
  {
    id: 'chaminuka-vtc',
    name: 'Chaminuka VTC',
    type: 'Vocational Training Centre',
    focus: ['Rural Development', 'Agriculture'],
    location: 'Mt Darwin'
  },
  {
    id: 'mushagashe-vtc',
    name: 'Mushagashe VTC',
    type: 'Vocational Training Centre',
    focus: ['General Vocational skills'],
    location: 'Masvingo'
  },
  {
    id: 'tabudirira-tc',
    name: 'Tabudirira Training Centre',
    type: 'Vocational Training Centre',
    focus: ['Youth skills development'],
    location: 'Mutoko'
  },
  // Specialized Training Colleges
  {
    id: 'gwebi-agric',
    name: 'Gwebi Agricultural College',
    type: 'Specialized Training College',
    focus: ['Agriculture'],
    location: 'Harare'
  },
  {
    id: 'chibero-agric',
    name: 'Chibero Agricultural College',
    type: 'Specialized Training College',
    focus: ['Agriculture'],
    location: 'Norton'
  },
  {
    id: 'rio-tinto-agric',
    name: 'Rio Tinto Agricultural College',
    type: 'Specialized Training College',
    focus: ['Agriculture'],
    location: 'Eiffel Flats'
  },
  {
    id: 'shamva-agric',
    name: 'Shamva Agricultural College',
    type: 'Specialized Training College',
    focus: ['Agriculture'],
    location: 'Shamva'
  },
  {
    id: 'belvedere-teachers',
    name: 'Belvedere Technical Teachers College',
    type: 'Specialized Training College',
    focus: ['Education', 'Technical'],
    location: 'Harare'
  },
  {
    id: 'hillside-teachers',
    name: 'Hillside Teachers College',
    type: 'Specialized Training College',
    focus: ['Education'],
    location: 'Bulawayo'
  },
  {
    id: 'mutare-teachers',
    name: 'Mutare Teachers College',
    type: 'Specialized Training College',
    focus: ['Education'],
    location: 'Mutare'
  },
  {
    id: 'seke-teachers',
    name: 'Seke Teachers College',
    type: 'Specialized Training College',
    focus: ['Education'],
    location: 'Chitungwiza'
  },
  {
    id: 'zim-school-mines',
    name: 'Zimbabwe School of Mines',
    type: 'Specialized Training College',
    focus: ['Mining', 'Geology'],
    location: 'Bulawayo'
  }
];
