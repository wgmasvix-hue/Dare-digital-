import { LucideIcon } from 'lucide-react';

export interface Book {
  id: string;
  title: string;
  author_names: string;
  authors?: string[];
  publisher_name?: string;
  cover_path?: string;
  cover_image_url?: string;
  access_model?: string;
  isOpenAccess?: boolean;
  year?: number;
  year_published?: number;
  total_downloads?: number;
  citations?: number;
  average_rating?: number;
  page_count?: number | null;
  is_featured?: boolean;
  faculty?: string;
  domain?: string;
  subject?: string;
  format?: string;
  learning_objectives?: string[];
  description?: string;
  abstract?: string;
  isbn?: string | null;
  isZimbabwe?: boolean;
  isAfrican?: boolean;
  isPeerReviewed?: boolean;
  source?: string;
  skills?: string[];
  file_url?: string;
  ai_level?: string | null;
  zimche_programme_codes?: string[];
  pillars?: string[];
  dara_summary?: string | null;
  ai_summary?: string | null;
  ai_keywords?: string[];
  ai_topics?: string[];
  ai_difficulty?: string | null;
  type?: string;
  zimche_code?: string;
  featured?: boolean;
  _showAiInsight?: boolean;
  gutenbergId?: number;
  language?: string;
  subjects?: string[];
  url?: string;
}

export interface ResearchItem {
  id: string;
  title: string;
  author_names?: string;
  creator?: string;
  abstract?: string;
  description?: string;
  institution?: string;
  is_dspace?: boolean;
  url?: string;
}

export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  institution_id?: string;
  programme?: string;
  year_of_study?: number;
  student_number?: string;
}

export interface Institution {
  id: string;
  name: string;
  type?: string;
  location?: string;
  description?: string;
  logo?: string;
  koha_url?: string;
  koha_api_key?: string;
  created_at?: string;
}

export interface InstitutionalContent {
  id: string;
  institution_id: string;
  title: string;
  subject?: string;
  author?: string;
  file_url?: string;
  type?: string;
  level?: string;
  file_type?: string;
  file_size?: number;
  created_at?: string;
}

export interface Faculty {
  name: string;
  icon: LucideIcon;
  id: string;
  color: string;
  bg: string;
  path?: string;
}

export interface Feature {
  label: string;
  icon: LucideIcon;
  color: string;
}

export interface Pillar {
  name: string;
  description: string;
  longDescription: string;
  icon: LucideIcon;
  color: string;
}

export interface StudentAction {
  title: string;
  icon: React.ReactNode;
  link?: string;
  action?: () => void;
  color: string;
}
