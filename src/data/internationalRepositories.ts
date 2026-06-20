export interface InternationalRepository {
  id: string;
  name: string;
  country: string;
  region: string;
  type: string;
  url: string;
  oaiUrl?: string;
  description: string;
  subjects: string[];
  recordCount?: string;
  openAccess: boolean;
}

export const INTERNATIONAL_REPOSITORIES: InternationalRepository[] = [
  {
    id: 'mit-dspace',
    name: 'MIT DSpace',
    country: 'USA',
    region: 'North America',
    type: 'Institutional Repository',
    url: 'https://dspace.mit.edu',
    oaiUrl: 'https://dspace.mit.edu/oai/request',
    description: 'Massachusetts Institute of Technology open access repository with research, theses, and publications.',
    subjects: ['Engineering', 'Science', 'Technology', 'Architecture'],
    recordCount: '150,000+',
    openAccess: true
  },
  {
    id: 'harvard-dash',
    name: 'Harvard DASH',
    country: 'USA',
    region: 'North America',
    type: 'Institutional Repository',
    url: 'https://dash.harvard.edu',
    description: 'Harvard University Digital Access to Scholarship repository.',
    subjects: ['Medicine', 'Law', 'Business', 'Arts & Humanities'],
    recordCount: '80,000+',
    openAccess: true
  },
  {
    id: 'arxiv',
    name: 'arXiv',
    country: 'USA',
    region: 'North America',
    type: 'Preprint Server',
    url: 'https://arxiv.org',
    oaiUrl: 'https://export.arxiv.org/oai2',
    description: 'Open-access archive for preprints in physics, mathematics, computer science, and more.',
    subjects: ['Physics', 'Mathematics', 'Computer Science', 'Biology', 'Finance'],
    recordCount: '2,000,000+',
    openAccess: true
  },
  {
    id: 'oxford-ora',
    name: 'Oxford Research Archive',
    country: 'UK',
    region: 'Europe',
    type: 'Institutional Repository',
    url: 'https://ora.ox.ac.uk',
    description: 'University of Oxford open access repository.',
    subjects: ['Medicine', 'Humanities', 'Social Sciences', 'Science'],
    recordCount: '200,000+',
    openAccess: true
  },
  {
    id: 'cambridge-apollo',
    name: 'Cambridge Apollo',
    country: 'UK',
    region: 'Europe',
    type: 'Institutional Repository',
    url: 'https://www.repository.cam.ac.uk',
    description: 'University of Cambridge institutional repository.',
    subjects: ['All disciplines'],
    recordCount: '90,000+',
    openAccess: true
  },
  {
    id: 'ucl-discovery',
    name: 'UCL Discovery',
    country: 'UK',
    region: 'Europe',
    type: 'Institutional Repository',
    url: 'https://discovery.ucl.ac.uk',
    description: 'University College London open access repository.',
    subjects: ['Medicine', 'Engineering', 'Arts', 'Social Sciences'],
    recordCount: '170,000+',
    openAccess: true
  },
  {
    id: 'ethz-research',
    name: 'ETH Zurich Research Collection',
    country: 'Switzerland',
    region: 'Europe',
    type: 'Institutional Repository',
    url: 'https://www.research-collection.ethz.ch',
    description: 'ETH Zurich institutional repository and data archive.',
    subjects: ['Engineering', 'Natural Sciences', 'Architecture', 'Mathematics'],
    recordCount: '140,000+',
    openAccess: true
  },
  {
    id: 'uct-open',
    name: 'UCT Open Access Repository',
    country: 'South Africa',
    region: 'Africa',
    type: 'Institutional Repository',
    url: 'https://open.uct.ac.za',
    description: 'University of Cape Town open access publications and research.',
    subjects: ['Medicine', 'Law', 'Commerce', 'Engineering', 'Humanities'],
    recordCount: '45,000+',
    openAccess: true
  },
  {
    id: 'wits-wiredspace',
    name: 'Wits WIReDSpace',
    country: 'South Africa',
    region: 'Africa',
    type: 'Institutional Repository',
    url: 'https://wiredspace.wits.ac.za',
    description: 'University of the Witwatersrand institutional repository.',
    subjects: ['Mining', 'Engineering', 'Science', 'Humanities'],
    recordCount: '35,000+',
    openAccess: true
  },
  {
    id: 'makerere-research',
    name: 'Makerere University Repository',
    country: 'Uganda',
    region: 'Africa',
    type: 'Institutional Repository',
    url: 'https://makir.mak.ac.ug',
    description: 'Makerere University institutional repository for East African research.',
    subjects: ['Agriculture', 'Medicine', 'Technology', 'Social Sciences'],
    recordCount: '22,000+',
    openAccess: true
  },
  {
    id: 'nairobi-erepository',
    name: 'University of Nairobi eRepository',
    country: 'Kenya',
    region: 'Africa',
    type: 'Institutional Repository',
    url: 'http://erepository.uonbi.ac.ke',
    description: 'University of Nairobi open access repository.',
    subjects: ['Medicine', 'Engineering', 'Agriculture', 'Law'],
    recordCount: '30,000+',
    openAccess: true
  },
  {
    id: 'ujima-ghana',
    name: 'University of Ghana Space',
    country: 'Ghana',
    region: 'Africa',
    type: 'Institutional Repository',
    url: 'https://ugspace.ug.edu.gh',
    description: 'University of Ghana institutional repository.',
    subjects: ['Social Sciences', 'Agriculture', 'Medicine', 'Law'],
    recordCount: '18,000+',
    openAccess: true
  },
  {
    id: 'ibadan-ir',
    name: 'UI IR - University of Ibadan',
    country: 'Nigeria',
    region: 'Africa',
    type: 'Institutional Repository',
    url: 'https://ir.library.ui.edu.ng',
    description: 'University of Ibadan institutional repository.',
    subjects: ['Agriculture', 'Humanities', 'Medicine', 'Education'],
    recordCount: '25,000+',
    openAccess: true
  },
  {
    id: 'opendoar',
    name: 'OpenDOAR Registry',
    country: 'International',
    region: 'Global',
    type: 'Registry',
    url: 'https://v2.sherpa.ac.uk/opendoar',
    description: 'Directory of Open Access Repositories worldwide — over 5,000 repositories indexed.',
    subjects: ['All disciplines'],
    recordCount: '5,000+ repositories',
    openAccess: true
  },
  {
    id: 'base-search',
    name: 'BASE (Bielefeld)',
    country: 'Germany',
    region: 'Europe',
    type: 'Aggregator',
    url: 'https://www.base-search.net',
    description: 'Bielefeld Academic Search Engine — one of the largest OA search engines.',
    subjects: ['All disciplines'],
    recordCount: '300,000,000+',
    openAccess: true
  },
  {
    id: 'doaj',
    name: 'DOAJ – Directory of OA Journals',
    country: 'International',
    region: 'Global',
    type: 'Journal Directory',
    url: 'https://doaj.org',
    description: 'Curated online directory of open access peer-reviewed journals.',
    subjects: ['All disciplines'],
    recordCount: '20,000+ journals',
    openAccess: true
  },
  {
    id: 'zenodo',
    name: 'Zenodo',
    country: 'International',
    region: 'Global',
    type: 'Data Repository',
    url: 'https://zenodo.org',
    description: 'CERN open-science repository accepting all research outputs.',
    subjects: ['All disciplines'],
    recordCount: '3,000,000+',
    openAccess: true
  },
  {
    id: 'openalex',
    name: 'OpenAlex',
    country: 'International',
    region: 'Global',
    type: 'Index',
    url: 'https://openalex.org',
    description: 'Open catalog of 250M+ scholarly works, authors, institutions, and concepts.',
    subjects: ['All disciplines'],
    recordCount: '250,000,000+',
    openAccess: true
  },
  {
    id: 'core-ac-uk',
    name: 'CORE',
    country: 'UK',
    region: 'Global',
    type: 'Aggregator',
    url: 'https://core.ac.uk',
    description: 'World\'s largest aggregator of open access research papers, 220M+ documents.',
    subjects: ['All disciplines'],
    recordCount: '220,000,000+',
    openAccess: true
  },
  {
    id: 'semantic-scholar',
    name: 'Semantic Scholar',
    country: 'USA',
    region: 'Global',
    type: 'Index',
    url: 'https://www.semanticscholar.org',
    description: 'AI-powered research tool with 200M+ academic papers from Allen Institute.',
    subjects: ['Computer Science', 'Medicine', 'Biology', 'Chemistry', 'Physics'],
    recordCount: '200,000,000+',
    openAccess: false
  },
  {
    id: 'plos-one',
    name: 'PLOS ONE',
    country: 'USA',
    region: 'Global',
    type: 'Journal',
    url: 'https://journals.plos.org/plosone',
    description: 'Inclusive open access journal publishing peer-reviewed research in science and medicine.',
    subjects: ['Biology', 'Medicine', 'Ecology', 'Earth Sciences'],
    recordCount: '300,000+',
    openAccess: true
  },
  {
    id: 'african-journals',
    name: 'African Journals Online',
    country: 'International',
    region: 'Africa',
    type: 'Aggregator',
    url: 'https://www.ajol.info',
    description: 'Largest and most comprehensive platform of African peer-reviewed research.',
    subjects: ['Agriculture', 'Medicine', 'Technology', 'Social Sciences'],
    recordCount: '700+ journals',
    openAccess: true
  }
];

export const REGIONS = ['All', 'Africa', 'Global', 'North America', 'Europe'];
export const REPO_TYPES = ['All', 'Institutional Repository', 'Preprint Server', 'Aggregator', 'Index', 'Journal', 'Journal Directory', 'Registry', 'Data Repository'];
