import { Professor, RawProfessorRecord } from '../types';

export function normalizeProfessor(raw: RawProfessorRecord, index: number): Professor {
  // Helper to get case-insensitive property
  const getField = (...keys: string[]): any => {
    for (const key of keys) {
      if (raw[key] !== undefined && raw[key] !== null) return raw[key];
      // lowercase check
      const lowerKey = key.toLowerCase();
      for (const rawKey of Object.keys(raw)) {
        if (rawKey.toLowerCase() === lowerKey && raw[rawKey] !== undefined && raw[rawKey] !== null) {
          return raw[rawKey];
        }
      }
    }
    return undefined;
  };

  const name = String(getField('Professor name', 'professor_name', 'name', 'Professor Name', 'professor') || `Professor #${index + 1}`).trim();
  const university = String(getField('University', 'university', 'univ', 'institution', 'school') || 'Unknown University').trim();
  
  let r_tier = String(getField('R', 'r', 'r_tier', 'tier', 'carnegie') || 'R1').trim().toUpperCase();
  if (!r_tier.startsWith('R')) {
    if (r_tier === '1') r_tier = 'R1';
    else if (r_tier === '2') r_tier = 'R2';
  }
  if (!['R1', 'R2'].includes(r_tier)) {
    if (r_tier.includes('1')) r_tier = 'R1';
    else if (r_tier.includes('2')) r_tier = 'R2';
    else r_tier = r_tier || 'Other';
  }

  const rawRanking = getField('Ranking', 'ranking', 'rank');
  let ranking: number | null = null;
  if (rawRanking !== undefined && rawRanking !== '' && rawRanking !== null) {
    const parsed = parseInt(String(rawRanking).replace(/[^0-9]/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) {
      ranking = parsed;
    }
  }

  const email = String(getField('Email', 'email', 'Mail', 'mail', 'e_mail') || '').trim();
  const mail = String(getField('Mail', 'mail', 'Email', 'email') || email).trim();
  const lab_link = String(getField('Lab link', 'lab_link', 'lab_url', 'website', 'homepage', 'lab') || '').trim();
  const research_area = String(getField('Research area', 'research_area', 'area', 'primary_area', 'field') || 'Computer Science').trim();

  // Research topics
  let research_topics: string[] = [];
  const rawTopics = getField('research_topics', 'Research topics', 'topics', 'keywords', 'interests');
  if (Array.isArray(rawTopics)) {
    research_topics = rawTopics.map(t => String(t).trim()).filter(Boolean);
  } else if (typeof rawTopics === 'string' && rawTopics.trim()) {
    try {
      if (rawTopics.startsWith('[') && rawTopics.endsWith(']')) {
        research_topics = JSON.parse(rawTopics.replace(/'/g, '"'));
      } else {
        research_topics = rawTopics.split(/[,;|]/).map(t => t.trim()).filter(Boolean);
      }
    } catch {
      research_topics = rawTopics.split(/[,;|]/).map(t => t.trim()).filter(Boolean);
    }
  }
  if (research_topics.length === 0 && research_area) {
    research_topics = [research_area];
  }

  // Numerical metrics
  const parseNum = (val: any, defaultVal = 0): number => {
    if (val === undefined || val === null || val === '') return defaultVal;
    if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
    const clean = String(val).replace(/,/g, '').trim();
    const num = parseFloat(clean);
    return isNaN(num) ? defaultVal : num;
  };

  const h_index = parseNum(getField('h_index', 'hIndex', 'h-index', 'H-Index', 'hindex'));
  const total_citations = parseNum(getField('total_citations', 'citations', 'totalCitations', 'Citations', 'total_cites'));
  const i10_index = parseNum(getField('i10_index', 'i10Index', 'i10-index', 'i10index'));
  const total_publications = parseNum(getField('total_publications', 'publications', 'total_pubs', 'totalPublications', 'pubs'));
  const n_target_pubs = parseNum(getField('n_target_pubs', 'n_target_publications', 'target_pubs', 'target_publications'));

  // Citations per year (can be dict like {"2020": 450, "2021": 600} or array or string)
  let citations_per_year: Record<string, number> = {};
  const rawCpy = getField('citations_per_year', 'citationsPerYear', 'citation_trend', 'yearly_citations');
  if (rawCpy && typeof rawCpy === 'object' && !Array.isArray(rawCpy)) {
    for (const [k, v] of Object.entries(rawCpy)) {
      citations_per_year[k] = parseNum(v);
    }
  } else if (typeof rawCpy === 'string' && rawCpy.trim()) {
    try {
      const parsed = JSON.parse(rawCpy.replace(/'/g, '"'));
      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        for (const [k, v] of Object.entries(parsed)) {
          citations_per_year[k] = parseNum(v);
        }
      }
    } catch {
      // Mock realistic synthetic distribution if string unparsable
    }
  }

  // If no citations per year provided, extrapolate reasonable 5-year trend
  if (Object.keys(citations_per_year).length === 0 && total_citations > 0) {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
    const baseShare = [0.12, 0.16, 0.20, 0.24, 0.28];
    years.forEach((y, i) => {
      citations_per_year[String(y)] = Math.round(total_citations * baseShare[i]);
    });
  }

  const position = String(getField('position', 'Position', 'title', 'rank_title') || 'Professor').trim();
  const university_api = String(getField('university_api', 'universityApi') || '').trim();
  const orcid = String(getField('orcid', 'ORCID', 'orcid_id') || '').trim();
  const scholar_url = String(getField('scholar_url', 'scholar', 'google_scholar', 'google_scholar_url') || '').trim();
  const dblp_pid = String(getField('dblp_pid', 'dblp', 'dblp_url') || '').trim();
  const openalex_id = String(getField('openalex_id', 'openalex') || '').trim();
  const semantic_id = String(getField('semantic_id', 'semanticscholar', 'semantic_scholar') || '').trim();

  // Matched conferences & venue paper counts
  let matched_conferences: string[] = [];
  const rawConfs = getField('matched_conferences', 'matched_venues', 'venues', 'conferences', 'top_venues');
  if (Array.isArray(rawConfs)) {
    matched_conferences = rawConfs.map(c => String(c).trim()).filter(Boolean);
  } else if (typeof rawConfs === 'string' && rawConfs.trim()) {
    try {
      if (rawConfs.startsWith('[') && rawConfs.endsWith(']')) {
        matched_conferences = JSON.parse(rawConfs.replace(/'/g, '"'));
      } else {
        matched_conferences = rawConfs.split(/[,;|]/).map(c => c.trim()).filter(Boolean);
      }
    } catch {
      matched_conferences = rawConfs.split(/[,;|]/).map(c => c.trim()).filter(Boolean);
    }
  }

  // Parse venue_paper_counts
  let venue_paper_counts: { venue: string; papers: number }[] = [];
  const rawVpc = getField('venue_paper_counts', 'venuePaperCounts', 'venue_counts');
  if (Array.isArray(rawVpc)) {
    venue_paper_counts = rawVpc
      .map(item => {
        if (!item || typeof item !== 'object') return null;
        const v = String(item.venue || item.name || '').trim();
        const p = parseNum(item.papers ?? item.count ?? item.paper_count, 0);
        return v ? { venue: v, papers: p } : null;
      })
      .filter(Boolean) as { venue: string; papers: number }[];
  } else if (typeof rawVpc === 'string' && rawVpc.trim()) {
    try {
      const parsed = JSON.parse(rawVpc.replace(/'/g, '"'));
      if (Array.isArray(parsed)) {
        venue_paper_counts = parsed
          .map(item => ({
            venue: String(item.venue || item.name || '').trim(),
            papers: parseNum(item.papers ?? item.count, 0)
          }))
          .filter(i => i.venue);
      }
    } catch {}
  }

  // Merge venues from venue_paper_counts into matched_conferences if missing
  venue_paper_counts.forEach(vpc => {
    if (vpc.venue && !matched_conferences.includes(vpc.venue)) {
      matched_conferences.push(vpc.venue);
    }
  });

  // Calculate or refine total_publications from venue_paper_counts if missing/zero
  let resolved_total_pubs = total_publications;
  if (resolved_total_pubs <= 0 && venue_paper_counts.length > 0) {
    resolved_total_pubs = venue_paper_counts.reduce((sum, item) => sum + item.papers, 0);
  }

  const parseBool = (val: any, defaultVal = false): boolean => {
    if (val === undefined || val === null) return defaultVal;
    if (typeof val === 'boolean') return val;
    const str = String(val).toLowerCase().trim();
    return ['true', '1', 'yes', 'y', 't'].includes(str);
  };

  const is_complete = parseBool(getField('is_complete', 'isComplete'), true);
  const api_match_ok = parseBool(getField('api_match_ok', 'apiMatchOk'), true);
  const has_target_paper = parseBool(
    getField('has_target_paper', 'hasTargetPaper'), 
    matched_conferences.length > 0 || n_target_pubs > 0 || venue_paper_counts.length > 0
  );
  const pickable_p = parseBool(getField('pickable_p', 'pickable', 'is_taking_students', 'accepting_students'), true);

  return {
    id: `prof-${index + 1}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    university,
    r_tier,
    ranking,
    name,
    email,
    mail,
    lab_link,
    research_area,
    research_topics,
    h_index,
    total_citations,
    i10_index,
    total_publications: resolved_total_pubs,
    citations_per_year,
    university_api,
    position,
    orcid,
    scholar_url,
    dblp_pid,
    openalex_id,
    semantic_id,
    sources: getField('sources', 'source') || 'Google Scholar, DBLP, OpenAlex',
    is_complete,
    api_match_ok,
    has_target_paper,
    matched_conferences,
    venue_paper_counts,
    n_target_pubs,
    pickable_p
  };
}

export function parseRawInput(rawContent: string): RawProfessorRecord[] {
  const trimmed = rawContent.trim();
  if (!trimmed) return [];

  // Try parsing JSON directly
  try {
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const json = JSON.parse(trimmed);
      return Array.isArray(json) ? json : [json];
    }
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const json = JSON.parse(trimmed);
      return [json];
    }
    // Try wrapping in array if user pasted comma-separated objects e.g. { ... }, { ... }
    if (trimmed.startsWith('{')) {
      const sanitized = trimmed.replace(/,\s*$/, '');
      const wrapped = `[${sanitized}]`;
      const json = JSON.parse(wrapped);
      if (Array.isArray(json)) return json;
    }
  } catch {}

  // Try JSON5 or loose JSON regex if minor trailing commas or errors
  try {
    const wrapped = trimmed.startsWith('[') ? trimmed : `[${trimmed.replace(/,\s*$/, '')}]`;
    const json = JSON.parse(wrapped);
    if (Array.isArray(json)) return json;
  } catch {}

  // Fallback to CSV parsing
  return parseCSVToJSON(trimmed);
}

export function parseCSVToJSON(csvText: string): RawProfessorRecord[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCSVRow(lines[0]);
  const results: RawProfessorRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVRow(lines[i]);
    if (row.length === 0 || (row.length === 1 && !row[0])) continue;
    const obj: RawProfessorRecord = {};
    headers.forEach((h, colIndex) => {
      const key = h.trim();
      obj[key] = row[colIndex] !== undefined ? row[colIndex].trim() : '';
    });
    results.push(obj);
  }

  return results;
}

function parseCSVRow(rowStr: string): string[] {
  const entries: string[] = [];
  let inQuotes = false;
  let currentStr = '';

  for (let i = 0; i < rowStr.length; i++) {
    const char = rowStr[i];
    const nextChar = rowStr[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentStr += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      entries.push(currentStr);
      currentStr = '';
    } else {
      currentStr += char;
    }
  }
  entries.push(currentStr);
  return entries;
}
