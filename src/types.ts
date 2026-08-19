export interface VenuePaperCount {
  venue: string;
  papers: number;
}

export interface Professor {
  id: string;
  university: string;
  r_tier: 'R1' | 'R2' | 'Other' | string;
  ranking: number | null;
  name: string;
  email: string;
  mail?: string;
  lab_link: string;
  research_area: string;
  research_topics: string[];
  h_index: number;
  total_citations: number;
  i10_index: number;
  total_publications: number;
  citations_per_year: Record<string, number>;
  university_api?: string;
  position: string;
  orcid?: string;
  scholar_url?: string;
  dblp_pid?: string;
  openalex_id?: string;
  semantic_id?: string;
  sources?: string[] | string;
  is_complete: boolean;
  api_match_ok: boolean;
  has_target_paper: boolean;
  matched_conferences: string[];
  venue_paper_counts: VenuePaperCount[];
  n_target_pubs: number;
  pickable_p: boolean;
}

export type RawProfessorRecord = Record<string, any>;

export interface FilterState {
  searchQuery: string;
  university: string;
  r_tier: string;
  rankingRange: [number, number];
  selectedResearchAreas: string[];
  selectedVenues: string[];
  position: string;
  topN: number | 'all';
  customTopNValue?: number;
  sortBy: 'citations' | 'h_index' | 'publications' | 'target_pubs' | 'ranking' | 'name';
  sortOrder: 'asc' | 'desc';
  hasTargetPaperOnly: boolean;
  pickableOnly: boolean;
}

export interface UniversityMeta {
  name: string;
  r_tier: string;
  ranking: number | null;
  professor_count: number;
}

export interface DatasetStats {
  totalProfessors: number;
  totalUniversities: number;
  r1Count: number;
  r2Count: number;
  avgHIndex: number;
  totalCitations: number;
  topVenues: { name: string; count: number }[];
  topTopics: { name: string; count: number }[];
}

export interface ShortlistedProfessor {
  professor: Professor;
  addedAt: string;
  notes?: string;
  status?: 'Shortlisted' | 'Contacted' | 'Interviewing' | 'Applied' | 'Accepted';
}
