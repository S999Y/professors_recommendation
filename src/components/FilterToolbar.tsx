import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  X, 
  ChevronDown, 
  SlidersHorizontal,
  LayoutGrid,
  List,
  ArrowUpDown,
  Check,
  Hash
} from 'lucide-react';
import { FilterState, UniversityMeta } from '../types';

interface FilterToolbarProps {
  filters: FilterState;
  onFilterChange: (updater: (prev: FilterState) => FilterState) => void;
  onResetFilters: () => void;
  universities: UniversityMeta[];
  allResearchAreas: { area: string; count: number }[];
  popularVenues: { venue: string; count: number }[];
  allProfessorsNames: string[];
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  resultCount: number;
  totalCount: number;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  universities,
  allResearchAreas,
  popularVenues,
  allProfessorsNames,
  viewMode,
  setViewMode,
  resultCount,
  totalCount
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);
  const [venueDropdownOpen, setVenueDropdownOpen] = useState(false);
  const [areaSearchQuery, setAreaSearchQuery] = useState('');
  const [venueSearchQuery, setVenueSearchQuery] = useState('');
  const [isCustomTopN, setIsCustomTopN] = useState(false);
  const [customInputValue, setCustomInputValue] = useState(
    typeof filters.topN === 'number' && ![5, 10, 20].includes(filters.topN) ? String(filters.topN) : '15'
  );

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const venueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (areaRef.current && !areaRef.current.contains(e.target as Node)) {
        setAreaDropdownOpen(false);
      }
      if (venueRef.current && !venueRef.current.contains(e.target as Node)) {
        setVenueDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchSuggestions = React.useMemo(() => {
    if (!filters.searchQuery || filters.searchQuery.length < 2) return [];
    const q = filters.searchQuery.toLowerCase();
    
    const profMatches = allProfessorsNames
      .filter(n => n.toLowerCase().includes(q))
      .slice(0, 3)
      .map(n => ({ type: 'Professor', text: n }));

    const univMatches = universities
      .filter(u => u.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map(u => ({ type: 'University', text: u.name }));

    const areaMatches = allResearchAreas
      .filter(a => a.area.toLowerCase().includes(q))
      .slice(0, 3)
      .map(a => ({ type: 'Research Area', text: a.area }));

    const venueMatches = popularVenues
      .filter(v => v.venue.toLowerCase().includes(q))
      .slice(0, 3)
      .map(v => ({ type: 'Venue', text: v.venue }));

    return [...profMatches, ...univMatches, ...areaMatches, ...venueMatches];
  }, [filters.searchQuery, allProfessorsNames, universities, allResearchAreas, popularVenues]);

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.university) count++;
    if (filters.r_tier !== 'all') count++;
    if (filters.rankingRange[1] < 500) count++;
    if (filters.selectedResearchAreas.length > 0) count += filters.selectedResearchAreas.length;
    if (filters.selectedVenues.length > 0) count += filters.selectedVenues.length;
    if (filters.position !== 'all') count++;
    if (filters.topN !== 'all') count++;
    if (filters.pickableOnly) count++;
    if (filters.hasTargetPaperOnly) count++;
    return count;
  }, [filters]);

  const toggleResearchArea = (area: string) => {
    onFilterChange(prev => {
      const exists = prev.selectedResearchAreas.includes(area);
      return {
        ...prev,
        selectedResearchAreas: exists 
          ? prev.selectedResearchAreas.filter(item => item !== area) 
          : [...prev.selectedResearchAreas, area]
      };
    });
  };

  const removeResearchArea = (area: string) => {
    onFilterChange(prev => ({
      ...prev,
      selectedResearchAreas: prev.selectedResearchAreas.filter(item => item !== area)
    }));
  };

  const toggleVenue = (venue: string) => {
    onFilterChange(prev => {
      const exists = prev.selectedVenues.includes(venue);
      return {
        ...prev,
        selectedVenues: exists 
          ? prev.selectedVenues.filter(item => item !== venue) 
          : [...prev.selectedVenues, venue]
      };
    });
  };

  const removeVenue = (venue: string) => {
    onFilterChange(prev => ({
      ...prev,
      selectedVenues: prev.selectedVenues.filter(item => item !== venue)
    }));
  };

  const handleCustomTopNChange = (val: string) => {
    setCustomInputValue(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      onFilterChange(prev => ({ ...prev, topN: parsed }));
    }
  };

  const filteredAreasList = React.useMemo(() => {
    if (!areaSearchQuery.trim()) return allResearchAreas;
    const q = areaSearchQuery.toLowerCase();
    return allResearchAreas.filter(a => a.area.toLowerCase().includes(q));
  }, [allResearchAreas, areaSearchQuery]);

  const filteredVenuesList = React.useMemo(() => {
    if (!venueSearchQuery.trim()) return popularVenues;
    const q = venueSearchQuery.toLowerCase();
    return popularVenues.filter(v => v.venue.toLowerCase().includes(q));
  }, [popularVenues, venueSearchQuery]);

  return (
    <div className="bg-white dark:bg-[#0D1117] border-b border-slate-200 dark:border-[#30363D] transition-colors duration-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
        
        {/* Row 1: Global Autocomplete Search & Quick Limit Selectors */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          
          {/* Autocomplete Search */}
          <div ref={searchContainerRef} className="relative flex-1">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#7D8590]" />
              <input
                id="input-global-search"
                type="text"
                value={filters.searchQuery}
                onChange={e => onFilterChange(prev => ({ ...prev, searchQuery: e.target.value }))}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search professor name, university, research areas, or publication venues..."
                className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-[#010409] border border-slate-300 dark:border-[#30363D] rounded-md text-sm text-slate-900 dark:text-[#E6EDF3] placeholder:text-slate-400 dark:placeholder:text-[#484F58] focus:border-indigo-500 focus:bg-white dark:focus:bg-[#010409] outline-none transition-colors"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => onFilterChange(prev => ({ ...prev, searchQuery: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#7D8590] hover:text-slate-700 dark:hover:text-[#E6EDF3]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Autocomplete dropdown */}
            {searchFocused && searchSuggestions.length > 0 && (
              <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-[#0D1117] rounded-md shadow-xl border border-slate-200 dark:border-[#30363D] overflow-hidden py-1 max-h-72 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#7D8590]">
                  Suggestions
                </div>
                {searchSuggestions.map((item, idx) => (
                  <button
                    key={`${item.type}-${item.text}-${idx}`}
                    onClick={() => {
                      if (item.type === 'University') {
                        onFilterChange(prev => ({ ...prev, university: item.text, searchQuery: '' }));
                      } else if (item.type === 'Research Area') {
                        toggleResearchArea(item.text);
                        onFilterChange(prev => ({ ...prev, searchQuery: '' }));
                      } else if (item.type === 'Venue') {
                        toggleVenue(item.text);
                        onFilterChange(prev => ({ ...prev, searchQuery: '' }));
                      } else {
                        onFilterChange(prev => ({ ...prev, searchQuery: item.text }));
                      }
                      setSearchFocused(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-[#1C2128] transition-colors"
                  >
                    <span className="font-medium text-slate-900 dark:text-[#E6EDF3]">{item.text}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 dark:bg-[#1C2128] text-slate-600 dark:text-[#8B949E] border border-slate-200 dark:border-[#30363D]">
                      {item.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ranking Tier Selector (R1 / R2) */}
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={() => onFilterChange(prev => ({ ...prev, r_tier: 'all' }))}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                filters.r_tier === 'all'
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'bg-slate-100 dark:bg-[#1C2128] border-slate-200 dark:border-[#30363D] text-slate-600 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3]'
              }`}
            >
              All Tiers
            </button>
            <button
              onClick={() => onFilterChange(prev => ({ ...prev, r_tier: 'R1' }))}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                filters.r_tier === 'R1'
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'bg-slate-100 dark:bg-[#1C2128] border-slate-200 dark:border-[#30363D] text-slate-600 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3]'
              }`}
            >
              R1
            </button>
            <button
              onClick={() => onFilterChange(prev => ({ ...prev, r_tier: 'R2' }))}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                filters.r_tier === 'R2'
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'bg-slate-100 dark:bg-[#1C2128] border-slate-200 dark:border-[#30363D] text-slate-600 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3]'
              }`}
            >
              R2
            </button>
          </div>

          {/* Show Top Selector: All, 5, 10, 20, Custom */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#7D8590] hidden lg:inline">Show Top:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsCustomTopN(false);
                  onFilterChange(prev => ({ ...prev, topN: 'all' }));
                }}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  filters.topN === 'all' && !isCustomTopN
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'bg-slate-100 dark:bg-[#1C2128] border-slate-200 dark:border-[#30363D] text-slate-600 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3]'
                }`}
              >
                All
              </button>

              {[5, 10, 20].map(n => (
                <button
                  key={n}
                  onClick={() => {
                    setIsCustomTopN(false);
                    onFilterChange(prev => ({ ...prev, topN: n }));
                  }}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    filters.topN === n && !isCustomTopN
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'bg-slate-100 dark:bg-[#1C2128] border-slate-200 dark:border-[#30363D] text-slate-600 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3]'
                  }`}
                >
                  {n}
                </button>
              ))}

              {/* Custom Top N Toggle & Input */}
              {isCustomTopN ? (
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-[#010409] border border-indigo-500 rounded-md px-2 py-0.5">
                  <Hash className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    value={customInputValue}
                    onChange={e => handleCustomTopNChange(e.target.value)}
                    placeholder="N"
                    className="w-12 bg-transparent text-xs text-slate-900 dark:text-[#E6EDF3] font-bold outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setIsCustomTopN(false);
                      onFilterChange(prev => ({ ...prev, topN: 'all' }));
                    }}
                    className="text-slate-400 dark:text-[#7D8590] hover:text-slate-700 dark:hover:text-[#E6EDF3] ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsCustomTopN(true);
                    const parsed = parseInt(customInputValue, 10) || 15;
                    onFilterChange(prev => ({ ...prev, topN: parsed }));
                  }}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    typeof filters.topN === 'number' && ![5, 10, 20].includes(filters.topN)
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'bg-slate-100 dark:bg-[#1C2128] border-slate-200 dark:border-[#30363D] text-slate-600 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3]'
                  }`}
                >
                  Custom
                </button>
              )}
            </div>
          </div>

          {/* Advanced Filter Expander */}
          <button
            onClick={() => setShowAdvanced(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              showAdvanced || activeFilterCount > 0
                ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'bg-slate-100 dark:bg-[#1C2128] border-slate-200 dark:border-[#30363D] text-slate-600 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          {/* Grid / Table View Switcher */}
          <div className="flex items-center rounded-md bg-slate-100 dark:bg-[#010409] border border-slate-200 dark:border-[#30363D] p-0.5 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-[#1C2128] text-indigo-600 dark:text-indigo-400 shadow-xs' 
                  : 'text-slate-500 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table' 
                  ? 'bg-white dark:bg-[#1C2128] text-indigo-600 dark:text-indigo-400 shadow-xs' 
                  : 'text-slate-500 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3]'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Row 2: Advanced Filter Controls & Multi-Select Dropdowns */}
        {showAdvanced && (
          <div className="pt-3 pb-1 border-t border-slate-200 dark:border-[#30363D] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in duration-150">
            
            {/* University Selector */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-[#7D8590] uppercase tracking-wider mb-1.5 block">
                University
              </label>
              <select
                value={filters.university}
                onChange={e => onFilterChange(prev => ({ ...prev, university: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-[#010409] border border-slate-300 dark:border-[#30363D] rounded-md px-3 py-2 text-xs text-slate-900 dark:text-[#E6EDF3] focus:border-indigo-500 focus:bg-white dark:focus:bg-[#010409] outline-none"
              >
                <option value="">All Universities ({universities.length})</option>
                {universities.map(u => (
                  <option key={u.name} value={u.name}>
                    {u.name} ({u.r_tier} • {u.professor_count} faculty)
                  </option>
                ))}
              </select>
            </div>

            {/* University Ranking Tier */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-[#7D8590] uppercase tracking-wider mb-1.5 block">
                Ranking Tier
              </label>
              <select
                value={filters.rankingRange[1]}
                onChange={e => onFilterChange(prev => ({ ...prev, rankingRange: [1, Number(e.target.value)] }))}
                className="w-full bg-slate-50 dark:bg-[#010409] border border-slate-300 dark:border-[#30363D] rounded-md px-3 py-2 text-xs text-slate-900 dark:text-[#E6EDF3] focus:border-indigo-500 focus:bg-white dark:focus:bg-[#010409] outline-none"
              >
                <option value={999}>Any Ranking</option>
                <option value={10}>Top 10 Ranked Only</option>
                <option value={25}>Top 25 Ranked Only</option>
                <option value={50}>Top 50 Ranked Only</option>
                <option value={100}>Top 100 Ranked Only</option>
              </select>
            </div>

            {/* Multi-Select Research Areas (Loaded Dynamically from Dataset File) */}
            <div ref={areaRef} className="relative">
              <label className="text-xs font-bold text-slate-500 dark:text-[#7D8590] uppercase tracking-wider mb-1.5 block flex items-center justify-between">
                <span>Research Areas</span>
                <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 lowercase">({allResearchAreas.length} loaded from file)</span>
              </label>
              
              <button
                type="button"
                onClick={() => setAreaDropdownOpen(prev => !prev)}
                className="w-full text-left text-xs py-2 px-3 rounded-md bg-slate-50 dark:bg-[#010409] border border-slate-300 dark:border-[#30363D] text-slate-900 dark:text-[#E6EDF3] flex items-center justify-between focus:border-indigo-500"
              >
                <span className="truncate">
                  {filters.selectedResearchAreas.length === 0 
                    ? 'Select Research Areas...' 
                    : `${filters.selectedResearchAreas.length} areas selected`}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-[#7D8590] shrink-0 ml-1" />
              </button>

              {areaDropdownOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-[#0D1117] rounded-md shadow-2xl border border-slate-200 dark:border-[#30363D] max-h-72 overflow-y-auto p-2 space-y-2">
                  
                  {/* Selected items displayed at top of selection menu with remove (x) icon */}
                  {filters.selectedResearchAreas.length > 0 && (
                    <div className="p-2 rounded bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-[#30363D] space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-[#7D8590] flex items-center justify-between">
                        <span>Selected ({filters.selectedResearchAreas.length})</span>
                        <button
                          onClick={() => onFilterChange(prev => ({ ...prev, selectedResearchAreas: [] }))}
                          className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {filters.selectedResearchAreas.map(area => (
                          <span
                            key={area}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/40 font-medium"
                          >
                            <span className="truncate max-w-[140px]">{area}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeResearchArea(area);
                              }}
                              className="hover:text-indigo-900 dark:hover:text-white"
                              title="Remove"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Filter / Search inside dropdown */}
                  <div className="relative">
                    <input
                      type="text"
                      value={areaSearchQuery}
                      onChange={e => setAreaSearchQuery(e.target.value)}
                      placeholder="Search research areas..."
                      className="w-full bg-slate-50 dark:bg-[#010409] border border-slate-300 dark:border-[#30363D] rounded px-2.5 py-1 text-xs text-slate-900 dark:text-[#E6EDF3] placeholder:text-slate-400 dark:placeholder:text-[#484F58] outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Options List */}
                  <div className="space-y-0.5 max-h-48 overflow-y-auto">
                    {filteredAreasList.length === 0 ? (
                      <div className="p-2 text-center text-xs text-slate-500 dark:text-[#7D8590]">No research areas found</div>
                    ) : (
                      filteredAreasList.map(({ area, count }) => {
                        const isSelected = filters.selectedResearchAreas.includes(area);
                        return (
                          <button
                            key={area}
                            type="button"
                            onClick={() => toggleResearchArea(area)}
                            className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                              isSelected 
                                ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold' 
                                : 'text-slate-700 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3] hover:bg-slate-100 dark:hover:bg-[#1C2128]'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                                isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-[#30363D]'
                              }`}>
                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span className="truncate">{area}</span>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#1C2128] text-slate-600 dark:text-[#8B949E] shrink-0 ml-1">
                              {count}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Multi-Select Publication Venues */}
            <div ref={venueRef} className="relative">
              <label className="text-xs font-bold text-slate-500 dark:text-[#7D8590] uppercase tracking-wider mb-1.5 block flex items-center justify-between">
                <span>Publication Venue</span>
                <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 lowercase">({popularVenues.length} indexed)</span>
              </label>

              <button
                type="button"
                onClick={() => setVenueDropdownOpen(prev => !prev)}
                className="w-full text-left text-xs py-2 px-3 rounded-md bg-slate-50 dark:bg-[#010409] border border-slate-300 dark:border-[#30363D] text-slate-900 dark:text-[#E6EDF3] flex items-center justify-between focus:border-indigo-500"
              >
                <span className="truncate">
                  {filters.selectedVenues.length === 0 
                    ? 'Select Publication Venues...' 
                    : `${filters.selectedVenues.length} venues selected`}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-[#7D8590] shrink-0 ml-1" />
              </button>

              {venueDropdownOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-[#0D1117] rounded-md shadow-2xl border border-slate-200 dark:border-[#30363D] max-h-72 overflow-y-auto p-2 space-y-2">
                  
                  {/* Selected venues displayed at top with remove (x) icon */}
                  {filters.selectedVenues.length > 0 && (
                    <div className="p-2 rounded bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-[#30363D] space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-[#7D8590] flex items-center justify-between">
                        <span>Selected ({filters.selectedVenues.length})</span>
                        <button
                          onClick={() => onFilterChange(prev => ({ ...prev, selectedVenues: [] }))}
                          className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {filters.selectedVenues.map(venue => (
                          <span
                            key={venue}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/40 font-medium"
                          >
                            <span className="truncate max-w-[140px]">{venue}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeVenue(venue);
                              }}
                              className="hover:text-indigo-900 dark:hover:text-white"
                              title="Remove"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Filter inside venue dropdown */}
                  <div className="relative">
                    <input
                      type="text"
                      value={venueSearchQuery}
                      onChange={e => setVenueSearchQuery(e.target.value)}
                      placeholder="Search conference / venue..."
                      className="w-full bg-slate-50 dark:bg-[#010409] border border-slate-300 dark:border-[#30363D] rounded px-2.5 py-1 text-xs text-slate-900 dark:text-[#E6EDF3] placeholder:text-slate-400 dark:placeholder:text-[#484F58] outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Options list */}
                  <div className="space-y-0.5 max-h-48 overflow-y-auto">
                    {filteredVenuesList.length === 0 ? (
                      <div className="p-2 text-center text-xs text-slate-500 dark:text-[#7D8590]">No publication venues found</div>
                    ) : (
                      filteredVenuesList.map(({ venue, count }) => {
                        const isSelected = filters.selectedVenues.includes(venue);
                        return (
                          <button
                            key={venue}
                            type="button"
                            onClick={() => toggleVenue(venue)}
                            className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                              isSelected 
                                ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold' 
                                : 'text-slate-700 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3] hover:bg-slate-100 dark:hover:bg-[#1C2128]'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                                isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-[#30363D]'
                              }`}>
                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span className="truncate">{venue}</span>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#1C2128] text-slate-600 dark:text-[#8B949E] shrink-0 ml-1">
                              {count}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Position */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-[#7D8590] uppercase tracking-wider mb-1.5 block">
                Position
              </label>
              <select
                value={filters.position}
                onChange={e => onFilterChange(prev => ({ ...prev, position: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-[#010409] border border-slate-300 dark:border-[#30363D] rounded-md px-3 py-2 text-xs text-slate-900 dark:text-[#E6EDF3] focus:border-indigo-500 focus:bg-white dark:focus:bg-[#010409] outline-none"
              >
                <option value="all">All Positions</option>
                <option value="assistant">Assistant Professor</option>
                <option value="associate">Associate Professor</option>
                <option value="full">Full Professor</option>
                <option value="distinguished">Distinguished / Chair</option>
              </select>
            </div>

            {/* Sort Metric */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-[#7D8590] uppercase tracking-wider mb-1.5 block">
                Sort Metric
              </label>
              <div className="flex gap-1.5">
                <select
                  value={filters.sortBy}
                  onChange={e => onFilterChange(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="flex-1 bg-slate-50 dark:bg-[#010409] border border-slate-300 dark:border-[#30363D] rounded-md px-3 py-2 text-xs text-slate-900 dark:text-[#E6EDF3] focus:border-indigo-500 focus:bg-white dark:focus:bg-[#010409] outline-none"
                >
                  <option value="h_index">h-index (High to Low)</option>
                  <option value="citations">Citations (High to Low)</option>
                  <option value="publications">Total Publications</option>
                  <option value="target_pubs">Target Venue Papers</option>
                  <option value="ranking">University Ranking</option>
                  <option value="name">Name (A-Z)</option>
                </select>
                <button
                  onClick={() => onFilterChange(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
                  title={`Order: ${filters.sortOrder.toUpperCase()}`}
                  className="p-2 rounded-md bg-slate-100 dark:bg-[#1C2128] border border-slate-200 dark:border-[#30363D] text-slate-600 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3]"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Special Flags Checkboxes */}
            <div className="flex flex-col justify-end space-y-2 pt-1 sm:col-span-2 lg:col-span-2">
              <div className="flex flex-wrap gap-4 items-center">
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filters.pickableOnly}
                    onChange={e => onFilterChange(prev => ({ ...prev, pickableOnly: e.target.checked }))}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-[#30363D] bg-slate-50 dark:bg-[#010409] text-indigo-600 focus:ring-0"
                  />
                  <span>Taking Students Only (<code className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">pickable_p</code>)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filters.hasTargetPaperOnly}
                    onChange={e => onFilterChange(prev => ({ ...prev, hasTargetPaperOnly: e.target.checked }))}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-[#30363D] bg-slate-50 dark:bg-[#010409] text-indigo-600 focus:ring-0"
                  />
                  <span>Has Target Venue Paper (<code className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">has_target_paper</code>)</span>
                </label>
              </div>
            </div>

          </div>
        )}

        {/* Active Filter Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500 dark:text-[#7D8590]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span>
              Showing <strong className="text-slate-900 dark:text-[#E6EDF3] font-semibold">{resultCount}</strong> of {totalCount} professors
            </span>

            {/* Selected Research Area tags with cross icon */}
            {filters.selectedResearchAreas.map(area => (
              <span
                key={area}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-50 dark:bg-[#1C2128] text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/40"
              >
                <span>{area}</span>
                <button 
                  onClick={() => removeResearchArea(area)} 
                  className="hover:text-indigo-900 dark:hover:text-white"
                  title="Remove research area"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Selected Venue tags with cross icon */}
            {filters.selectedVenues.map(venue => (
              <span
                key={venue}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-50 dark:bg-[#1C2128] text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30"
              >
                <span>{venue}</span>
                <button 
                  onClick={() => removeVenue(venue)} 
                  className="hover:text-indigo-900 dark:hover:text-white"
                  title="Remove publication venue"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {filters.university && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 dark:bg-[#1C2128] text-slate-700 dark:text-[#8B949E] border border-slate-200 dark:border-[#30363D]">
                <span>{filters.university}</span>
                <button onClick={() => onFilterChange(prev => ({ ...prev, university: '' }))} className="hover:text-slate-900 dark:hover:text-[#E6EDF3]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Clear all filters ({activeFilterCount})
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
