import React, { useState } from 'react';
import { 
  Bookmark, 
  ExternalLink, 
  Mail, 
  Globe, 
  ArrowUpDown,
  Copy,
  Check
} from 'lucide-react';
import { Professor } from '../types';

interface ProfessorTableProps {
  professors: Professor[];
  shortlistIds: Set<string>;
  onToggleShortlist: (prof: Professor) => void;
  onViewDetails: (prof: Professor) => void;
  onDraftEmail: (prof: Professor) => void;
  onSortChange: (sortBy: 'citations' | 'h_index' | 'publications' | 'target_pubs' | 'ranking' | 'name') => void;
  currentSortBy: string;
  currentSortOrder: 'asc' | 'desc';
}

export const ProfessorTable: React.FC<ProfessorTableProps> = ({
  professors,
  shortlistIds,
  onToggleShortlist,
  onViewDetails,
  onDraftEmail,
  onSortChange,
  currentSortBy,
  currentSortOrder
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const renderSortIndicator = (key: string) => {
    if (currentSortBy !== key) return <ArrowUpDown className="w-3 h-3 text-slate-400 dark:text-[#484F58] opacity-0 group-hover:opacity-100" />;
    return <span className="text-indigo-600 dark:text-indigo-400 font-bold ml-1">{currentSortOrder === 'asc' ? '▲' : '▼'}</span>;
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#0D1117] shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#30363D] bg-slate-50 dark:bg-[#010409] text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-[#7D8590]">
              <th className="py-3.5 px-3 w-10 text-center">★</th>
              <th 
                onClick={() => onSortChange('name')} 
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-[#E6EDF3] transition-colors group"
              >
                <div className="flex items-center gap-1">
                  <span>Professor Name</span>
                  {renderSortIndicator('name')}
                </div>
              </th>
              <th 
                onClick={() => onSortChange('ranking')} 
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-[#E6EDF3] transition-colors group"
              >
                <div className="flex items-center gap-1">
                  <span>University / Tier</span>
                  {renderSortIndicator('ranking')}
                </div>
              </th>
              <th className="py-3.5 px-4">Research Specialization</th>
              <th 
                onClick={() => onSortChange('target_pubs')} 
                className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-[#E6EDF3] transition-colors group"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Target Pubs</span>
                  {renderSortIndicator('target_pubs')}
                </div>
              </th>
              <th 
                onClick={() => onSortChange('h_index')} 
                className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-[#E6EDF3] transition-colors group"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>h-index</span>
                  {renderSortIndicator('h_index')}
                </div>
              </th>
              <th 
                onClick={() => onSortChange('citations')} 
                className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-[#E6EDF3] transition-colors group"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Citations</span>
                  {renderSortIndicator('citations')}
                </div>
              </th>
              <th 
                onClick={() => onSortChange('publications')} 
                className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-[#E6EDF3] transition-colors group"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Total Pubs</span>
                  {renderSortIndicator('publications')}
                </div>
              </th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200 dark:divide-[#30363D]/60 text-slate-700 dark:text-slate-300">
            {professors.map((professor) => {
              const isShortlisted = shortlistIds.has(professor.id);
              const profileOrLabUrl = professor.lab_link || professor.scholar_url || (professor.dblp_pid ? `https://dblp.org/pid/${professor.dblp_pid}` : null);

              return (
                <tr 
                  key={professor.id} 
                  className="hover:bg-slate-50 dark:hover:bg-[#1C2128]/70 transition-colors group"
                >
                  {/* Shortlist star */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onToggleShortlist(professor)}
                      className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-[#0D1117] transition-colors ${
                        isShortlisted ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-[#484F58] hover:text-slate-600 dark:hover:text-[#7D8590]'
                      }`}
                      title={isShortlisted ? "Remove from shortlist" : "Bookmark professor"}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-amber-500 dark:fill-amber-400' : ''}`} />
                    </button>
                  </td>

                  {/* Professor Name & Position */}
                  <td className="py-3 px-4">
                    <div 
                      onClick={() => onViewDetails(professor)}
                      className="font-medium text-slate-900 dark:text-[#E6EDF3] hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{professor.name}</span>
                      {professor.pickable_p && (
                        <span className="text-[9px] px-1 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60 font-semibold" title="Accepting students">
                          Open
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-[#7D8590] flex items-center gap-1.5 flex-wrap">
                      <span>{professor.position}</span>
                      {professor.openalex_id && (
                        <a
                          href={`https://openalex.org/authors/${professor.openalex_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-mono text-sky-600 dark:text-sky-400 hover:underline"
                        >
                          ({professor.openalex_id})
                        </a>
                      )}
                    </div>
                    {professor.email ? (
                      <div 
                        onClick={(e) => handleCopy(professor.id, professor.email, e)}
                        className="mt-1 inline-flex items-center gap-1 text-[11px] font-mono text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white cursor-pointer px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-500/30"
                        title="Click to copy email"
                      >
                        <Mail className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>{professor.email}</span>
                        {copiedId === professor.id ? (
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 ml-0.5" />
                        ) : (
                          <Copy className="w-3 h-3 text-indigo-400 dark:text-indigo-400 ml-0.5" />
                        )}
                      </div>
                    ) : (
                      <div className="mt-1 text-[10px] text-slate-400 dark:text-[#7D8590] italic">
                        No email listed
                      </div>
                    )}
                  </td>

                  {/* University & R-Tier */}
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900 dark:text-[#E6EDF3] flex items-center gap-1.5">
                      <span>{professor.university}</span>
                      <span className={`px-1 rounded text-[9px] uppercase font-bold tracking-wider ${
                        professor.r_tier === 'R1' 
                          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30' 
                          : 'bg-slate-100 dark:bg-[#1C2128] text-slate-600 dark:text-[#8B949E] border border-slate-200 dark:border-[#30363D]'
                      }`}>
                        {professor.r_tier}
                      </span>
                    </div>
                    {professor.ranking && (
                      <div className="text-[11px] text-slate-500 dark:text-[#7D8590] font-mono">
                        National Rank #{professor.ranking}
                      </div>
                    )}
                  </td>

                  {/* Research Topics & Venue Counts */}
                  <td className="py-3 px-4 max-w-xs">
                    <div className="text-[11px] text-slate-600 dark:text-[#8B949E] truncate mb-1">
                      {professor.research_area}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {professor.venue_paper_counts && professor.venue_paper_counts.length > 0 ? (
                        professor.venue_paper_counts.slice(0, 3).map(vpc => (
                          <span key={vpc.venue} className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-500/30">
                            {vpc.venue} ({vpc.papers})
                          </span>
                        ))
                      ) : (
                        professor.matched_conferences.slice(0, 2).map(c => (
                          <span key={c} className="px-1.5 py-0.2 rounded text-[9px] uppercase font-bold bg-slate-100 dark:bg-[#1C2128] text-indigo-700 dark:text-indigo-400 border border-slate-200 dark:border-indigo-500/30">
                            {c}
                          </span>
                        ))
                      )}
                    </div>
                  </td>

                  {/* Target Pubs */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {professor.n_target_pubs ?? 0}
                  </td>

                  {/* H-Index */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                    {professor.h_index}
                  </td>

                  {/* Citations */}
                  <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 dark:text-[#E6EDF3]">
                    {formatNumber(professor.total_citations)}
                  </td>

                  {/* Publications */}
                  <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-[#8B949E]">
                    {professor.total_publications}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {profileOrLabUrl && (
                        <a
                          href={profileOrLabUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#1C2128] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                          title="Visit Lab or Profile Homepage"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => onDraftEmail(professor)}
                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#1C2128] text-slate-500 dark:text-[#7D8590] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        title="Draft tailored inquiry email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onViewDetails(professor)}
                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#1C2128] text-slate-500 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3] transition-colors"
                        title="View profile modal"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
