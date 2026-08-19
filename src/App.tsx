/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Search, 
  RotateCcw
} from 'lucide-react';
import { Header } from './components/Header';
import { FilterToolbar } from './components/FilterToolbar';
import { ProfessorCard } from './components/ProfessorCard';
import { ProfessorTable } from './components/ProfessorTable';
import { ProfessorModal } from './components/ProfessorModal';
import { ColdEmailModal } from './components/ColdEmailModal';
import { ShortlistDrawer } from './components/ShortlistDrawer';
import { DatasetUploadModal } from './components/DatasetUploadModal';
import { StatsOverview } from './components/StatsOverview';
import { Pagination } from './components/Pagination';
import { RAW_DEFAULT_PROFESSORS } from './data/defaultProfessors';
import { normalizeProfessor } from './utils/normalizeData';
import { 
  Professor, 
  FilterState, 
  UniversityMeta, 
  DatasetStats, 
  ShortlistedProfessor, 
  RawProfessorRecord 
} from './types';

const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  university: '',
  r_tier: 'all',
  rankingRange: [1, 999],
  selectedResearchAreas: [],
  selectedVenues: [],
  position: 'all',
  topN: 'all',
  sortBy: 'h_index',
  sortOrder: 'desc',
  hasTargetPaperOnly: false,
  pickableOnly: false,
};

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('scholarindex_theme');
      if (saved) return saved === 'dark';
      return true;
    }
    return true;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('scholarindex_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('scholarindex_theme', 'light');
    }
  }, [darkMode]);

  // Dataset State
  const [professors, setProfessors] = useState<Professor[]>(() => {
    return RAW_DEFAULT_PROFESSORS.map((raw, idx) => normalizeProfessor(raw, idx));
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DatasetStats | null>(null);

  // Filters State
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Pagination State (Max 50 per page as requested)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Modals & Drawers
  const [activeModalProf, setActiveModalProf] = useState<Professor | null>(null);
  const [activeEmailProf, setActiveEmailProf] = useState<Professor | null>(null);
  const [isShortlistOpen, setIsShortlistOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Shortlist State (persisted in localStorage)
  const [shortlist, setShortlist] = useState<ShortlistedProfessor[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('scholarindex_shortlist');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('scholarindex_shortlist', JSON.stringify(shortlist));
  }, [shortlist]);

  const shortlistIds = useMemo(() => new Set(shortlist.map(s => s.professor.id)), [shortlist]);

  // Fetch or sync data from backend API
  const fetchProfessorsFromAPI = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/professors');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setProfessors(json.data);
        }
        if (json.stats) {
          setStats(json.stats);
        }
      }
    } catch {
      // Fallback smoothly to local dataset if offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfessorsFromAPI();
  }, [fetchProfessorsFromAPI]);

  // Derived metadata from current active professors: Universities
  const universities = useMemo<UniversityMeta[]>(() => {
    const map: Record<string, { count: number; r_tier: string; ranking: number | null }> = {};
    professors.forEach(p => {
      if (!map[p.university]) {
        map[p.university] = { count: 0, r_tier: p.r_tier, ranking: p.ranking };
      }
      map[p.university].count++;
    });

    return Object.entries(map)
      .map(([name, meta]) => ({
        name,
        r_tier: meta.r_tier,
        ranking: meta.ranking,
        professor_count: meta.count
      }))
      .sort((a, b) => b.professor_count - a.professor_count);
  }, [professors]);

  // Function to load all distinct research areas dynamically from the dataset file
  const allResearchAreas = useMemo(() => {
    const map: Record<string, number> = {};
    professors.forEach(p => {
      // Extract from research_area
      if (p.research_area) {
        const areaStr = p.research_area.trim();
        map[areaStr] = (map[areaStr] || 0) + 1;

        // Also split comma/semicolon/slash separated areas if applicable
        const subAreas = areaStr.split(/[,;/]\s*/).map(a => a.trim()).filter(Boolean);
        if (subAreas.length > 1) {
          subAreas.forEach(a => {
            if (a.length > 2) {
              map[a] = (map[a] || 0) + 1;
            }
          });
        }
      }

      // Also extract from research_topics array
      if (Array.isArray(p.research_topics)) {
        p.research_topics.forEach(topic => {
          if (topic && topic.trim()) {
            const t = topic.trim();
            map[t] = (map[t] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(map)
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count);
  }, [professors]);

  // Function to load all distinct publication venues from the dataset file
  const popularVenues = useMemo(() => {
    const map: Record<string, number> = {};
    professors.forEach(p => {
      if (Array.isArray(p.matched_conferences)) {
        p.matched_conferences.forEach(v => {
          if (v && v.trim()) {
            const trimmed = v.trim();
            map[trimmed] = (map[trimmed] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(map)
      .map(([venue, count]) => ({ venue, count }))
      .sort((a, b) => b.count - a.count);
  }, [professors]);

  const allProfessorsNames = useMemo(() => professors.map(p => p.name), [professors]);

  // Filter and Sort Engine
  const filteredProfessors = useMemo(() => {
    let result = [...professors];

    // 1. Global Search Query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.university.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.research_area.toLowerCase().includes(q) ||
        p.research_topics.some(t => t.toLowerCase().includes(q)) ||
        p.matched_conferences.some(c => c.toLowerCase().includes(q))
      );
    }

    // 2. University Name
    if (filters.university && filters.university !== 'all') {
      const uq = filters.university.toLowerCase();
      result = result.filter(p => p.university.toLowerCase().includes(uq));
    }

    // 3. Carnegie R-Tier
    if (filters.r_tier && filters.r_tier !== 'all') {
      result = result.filter(p => p.r_tier.toUpperCase() === filters.r_tier.toUpperCase());
    }

    // 4. Ranking Range
    if (filters.rankingRange[1] < 999) {
      result = result.filter(p => p.ranking !== null && p.ranking <= filters.rankingRange[1]);
    }

    // 5. Selected Research Areas (Multi-Select)
    if (filters.selectedResearchAreas.length > 0) {
      result = result.filter(p =>
        filters.selectedResearchAreas.some(selectedArea => {
          const lowerSelected = selectedArea.toLowerCase();
          return (
            p.research_area.toLowerCase().includes(lowerSelected) ||
            p.research_topics.some(pt => pt.toLowerCase().includes(lowerSelected))
          );
        })
      );
    }

    // 6. Selected Publication Venues (Multi-Select)
    if (filters.selectedVenues.length > 0) {
      result = result.filter(p =>
        filters.selectedVenues.some(selectedVenue => {
          const lowerVenue = selectedVenue.toLowerCase();
          return p.matched_conferences.some(pv => pv.toLowerCase().includes(lowerVenue));
        })
      );
    }

    // 7. Faculty Position
    if (filters.position && filters.position !== 'all') {
      const pos = filters.position.toLowerCase();
      result = result.filter(p => p.position.toLowerCase().includes(pos));
    }

    // 8. Special Flags: Pickable
    if (filters.pickableOnly) {
      result = result.filter(p => p.pickable_p);
    }

    // 9. Special Flags: Has Target Venue Paper
    if (filters.hasTargetPaperOnly) {
      result = result.filter(p => p.has_target_paper);
    }

    // 10. Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'citations':
          comparison = (b.total_citations || 0) - (a.total_citations || 0);
          break;
        case 'h_index':
          comparison = (b.h_index || 0) - (a.h_index || 0);
          break;
        case 'publications':
          comparison = (b.total_publications || 0) - (a.total_publications || 0);
          break;
        case 'target_pubs':
          comparison = (b.n_target_pubs || 0) - (a.n_target_pubs || 0);
          break;
        case 'ranking':
          comparison = (a.ranking ?? 9999) - (b.ranking ?? 9999);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        default:
          comparison = (b.h_index || 0) - (a.h_index || 0);
      }
      return filters.sortOrder === 'asc' ? -comparison : comparison;
    });

    // 11. Top N Cutoff (Top 5, Top 10, Top 20, or Custom N)
    if (typeof filters.topN === 'number' && filters.topN > 0) {
      result = result.slice(0, filters.topN);
    }

    return result;
  }, [professors, filters]);

  // Reset pagination to page 1 when filters or dataset change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, pageSize, professors.length]);

  const totalPages = Math.max(1, Math.ceil(filteredProfessors.length / pageSize));

  // Paginated slice (max 50 items per page)
  const paginatedProfessors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProfessors.slice(start, start + pageSize);
  }, [filteredProfessors, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const el = document.getElementById('professor-results-header');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    const capped = Math.min(50, Math.max(10, newSize));
    setPageSize(capped);
    setCurrentPage(1);
  };

  // Shortlist Handlers
  const handleToggleShortlist = (prof: Professor) => {
    if (shortlistIds.has(prof.id)) {
      setShortlist(prev => prev.filter(s => s.professor.id !== prof.id));
    } else {
      setShortlist(prev => [
        { professor: prof, addedAt: new Date().toISOString(), status: 'Shortlisted' },
        ...prev
      ]);
      try {
        confetti({
          particleCount: 20,
          spread: 35,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#818cf8', '#e6edf3']
        });
      } catch {}
    }
  };

  const handleUpdateShortlistStatus = (profId: string, status: ShortlistedProfessor['status']) => {
    setShortlist(prev => prev.map(s => s.professor.id === profId ? { ...s, status } : s));
  };

  const handleUpdateShortlistNotes = (profId: string, notes: string) => {
    setShortlist(prev => prev.map(s => s.professor.id === profId ? { ...s, notes } : s));
  };

  const handleRemoveShortlist = (profId: string) => {
    setShortlist(prev => prev.filter(s => s.professor.id !== profId));
  };

  // Custom Dataset Upload / Apply
  const handleApplyCustomDataset = async (records: RawProfessorRecord[]) => {
    const normalized = records.map((r, idx) => normalizeProfessor(r, idx));
    setProfessors(normalized);

    try {
      await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(records)
      });
      fetchProfessorsFromAPI();
    } catch {}
  };

  const handleResetDataset = async () => {
    const def = RAW_DEFAULT_PROFESSORS.map((raw, idx) => normalizeProfessor(raw, idx));
    setProfessors(def);
    setFilters(INITIAL_FILTERS);

    try {
      await fetch('/api/reset', { method: 'POST' });
      fetchProfessorsFromAPI();
    } catch {}
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0C10] text-slate-900 dark:text-[#E6EDF3] flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      
      {/* 1. Navigation Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        shortlistCount={shortlist.length}
        onOpenShortlist={() => setIsShortlistOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onResetDataset={handleResetDataset}
        stats={stats}
        activeDatasetCount={professors.length}
      />

      {/* 2. Interactive Filter Bar */}
      <FilterToolbar
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
        universities={universities}
        allResearchAreas={allResearchAreas}
        popularVenues={popularVenues}
        allProfessorsNames={allProfessorsNames}
        viewMode={viewMode}
        setViewMode={setViewMode}
        resultCount={filteredProfessors.length}
        totalCount={professors.length}
      />

      {/* 3. Main Results Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Results Header */}
        <div id="professor-results-header" className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-6 scroll-mt-20">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#E6EDF3] tracking-tight">
              Professor Results
            </h2>
            <p className="text-slate-500 dark:text-[#7D8590] text-xs sm:text-sm mt-1">
              Showing <span className="text-slate-900 dark:text-[#E6EDF3] font-semibold font-mono">
                {filteredProfessors.length === 0 ? 0 : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filteredProfessors.length)}`}
              </span> of <span className="text-slate-900 dark:text-[#E6EDF3] font-semibold font-mono">{filteredProfessors.length}</span> faculty matches
              {filteredProfessors.length !== professors.length && (
                <span> (filtered from {professors.length} total)</span>
              )}
              {totalPages > 1 && (
                <span className="ml-1.5 text-indigo-600 dark:text-indigo-400 font-medium"> • Page {currentPage} of {totalPages}</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#1C2128] px-3 py-1.5 rounded-md border border-slate-200 dark:border-[#30363D]">
            <span className="text-xs text-slate-500 dark:text-[#7D8590]">Sorted by:</span>
            <span className="text-xs font-medium text-slate-900 dark:text-[#E6EDF3] capitalize">
              {filters.sortBy.replace('_', '-')} ({filters.sortOrder === 'desc' ? 'High to Low' : 'Low to High'})
            </span>
          </div>
        </div>

        {filteredProfessors.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#30363D] flex items-center justify-center text-slate-400 dark:text-[#7D8590] shadow-xs">
              <Search className="w-6 h-6" />
            </div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-[#E6EDF3]">
              No Faculty Found Matching Criteria
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#7D8590] leading-relaxed">
              We couldn't find any professors matching your current active filters. Try broadening your research areas or clearing the ranking tier cutoff.
            </p>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          /* Grid vs Table */
          <div className="space-y-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedProfessors.map(professor => (
                  <ProfessorCard
                    key={professor.id}
                    professor={professor}
                    isShortlisted={shortlistIds.has(professor.id)}
                    onToggleShortlist={handleToggleShortlist}
                    onViewDetails={prof => setActiveModalProf(prof)}
                    onDraftEmail={prof => setActiveEmailProf(prof)}
                  />
                ))}
              </div>
            ) : (
              <ProfessorTable
                professors={paginatedProfessors}
                shortlistIds={shortlistIds}
                onToggleShortlist={handleToggleShortlist}
                onViewDetails={prof => setActiveModalProf(prof)}
                onDraftEmail={prof => setActiveEmailProf(prof)}
                onSortChange={sortBy => setFilters(prev => ({
                  ...prev,
                  sortBy,
                  sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc'
                }))}
                currentSortBy={filters.sortBy}
                currentSortOrder={filters.sortOrder}
              />
            )}

            {/* Pagination Controls Bar */}
            {totalPages > 1 && (
              <div className="flex justify-center pt-2">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}

      </main>

      {/* 4. Minimalist Footer */}
      <footer className="h-10 bg-white dark:bg-[#0D1117] border-t border-slate-200 dark:border-[#30363D] px-4 sm:px-8 flex items-center justify-between text-[10px] text-slate-500 dark:text-[#484F58] uppercase tracking-widest transition-colors">
        <span>Data synchronized via OpenAlex & Scholar Engine</span>
        <span>Build optimized for Vercel Static Generation & Serverless</span>
      </footer>

      {/* Modals and Drawers */}
      <ProfessorModal
        professor={activeModalProf}
        isOpen={Boolean(activeModalProf)}
        onClose={() => setActiveModalProf(null)}
        isShortlisted={activeModalProf ? shortlistIds.has(activeModalProf.id) : false}
        onToggleShortlist={handleToggleShortlist}
        onOpenEmailDrafter={prof => setActiveEmailProf(prof)}
      />

      <ColdEmailModal
        professor={activeEmailProf}
        isOpen={Boolean(activeEmailProf)}
        onClose={() => setActiveEmailProf(null)}
      />

      <ShortlistDrawer
        isOpen={isShortlistOpen}
        onClose={() => setIsShortlistOpen(false)}
        shortlist={shortlist}
        onRemove={handleRemoveShortlist}
        onUpdateStatus={handleUpdateShortlistStatus}
        onUpdateNotes={handleUpdateShortlistNotes}
        onViewDetails={prof => setActiveModalProf(prof)}
        onDraftEmail={prof => setActiveEmailProf(prof)}
      />

      <DatasetUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onApplyDataset={handleApplyCustomDataset}
        onResetDefault={handleResetDataset}
        currentCount={professors.length}
      />

      <StatsOverview
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats || {
          totalProfessors: professors.length,
          totalUniversities: universities.length,
          r1Count: professors.filter(p => p.r_tier === 'R1').length,
          r2Count: professors.filter(p => p.r_tier === 'R2').length,
          avgHIndex: Math.round((professors.reduce((acc, p) => acc + (p.h_index || 0), 0) / (professors.length || 1)) * 10) / 10,
          totalCitations: professors.reduce((acc, p) => acc + (p.total_citations || 0), 0),
          topVenues: popularVenues.slice(0, 15).map(v => ({ name: v.venue, count: v.count })),
          topTopics: allResearchAreas.slice(0, 20).map(t => ({ name: t.area, count: t.count }))
        }}
        onSelectTopic={topic => setFilters(prev => ({
          ...prev,
          selectedResearchAreas: prev.selectedResearchAreas.includes(topic) ? prev.selectedResearchAreas : [...prev.selectedResearchAreas, topic]
        }))}
        onSelectVenue={venue => setFilters(prev => ({
          ...prev,
          selectedVenues: prev.selectedVenues.includes(venue) ? prev.selectedVenues : [...prev.selectedVenues, venue]
        }))}
      />

    </div>
  );
}
