import React from 'react';
import { 
  X, 
  ExternalLink, 
  Mail, 
  Bookmark, 
  TrendingUp, 
  Link as LinkIcon,
  Copy,
  Check,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Professor } from '../types';

interface ProfessorModalProps {
  professor: Professor | null;
  isOpen: boolean;
  onClose: () => void;
  isShortlisted: boolean;
  onToggleShortlist: (prof: Professor) => void;
  onOpenEmailDrafter: (prof: Professor) => void;
}

export const ProfessorModal: React.FC<ProfessorModalProps> = ({
  professor,
  isOpen,
  onClose,
  isShortlisted,
  onToggleShortlist,
  onOpenEmailDrafter
}) => {
  const [copiedEmail, setCopiedEmail] = React.useState(false);

  if (!isOpen || !professor) return null;

  const handleCopyEmail = () => {
    if (professor.email) {
      navigator.clipboard.writeText(professor.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const citationChartData = Object.entries(professor.citations_per_year || {})
    .map(([year, citations]) => ({
      year,
      citations: Number(citations) || 0
    }))
    .sort((a, b) => Number(a.year) - Number(b.year));

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-[#0D1117] text-slate-900 dark:text-[#E6EDF3] rounded-xl shadow-2xl border border-slate-200 dark:border-[#30363D] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-50 dark:bg-[#010409] border-b border-slate-200 dark:border-[#30363D]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                  professor.r_tier === 'R1'
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/40'
                    : 'bg-slate-100 dark:bg-[#1C2128] text-slate-600 dark:text-[#8B949E] border border-slate-200 dark:border-[#30363D]'
                }`}>
                  {professor.r_tier} Tier
                </span>

                {professor.ranking && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-[#1C2128] text-slate-600 dark:text-[#7D8590] border border-slate-200 dark:border-[#30363D]">
                    National Rank #{professor.ranking}
                  </span>
                )}

                {professor.pickable_p && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60">
                    <UserCheck className="w-3 h-3" />
                    <span>Taking Students</span>
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#E6EDF3] tracking-tight">
                {professor.name}
              </h2>
              <p className="text-xs font-medium text-slate-600 dark:text-[#7D8590] mt-1">
                {professor.position} • <span className="text-slate-900 dark:text-[#E6EDF3] font-semibold">{professor.university}</span>
              </p>
            </div>

            {/* Close & Shortlist Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleShortlist(professor)}
                className={`p-2 rounded-md border transition-colors ${
                  isShortlisted
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/60 text-amber-600 dark:text-amber-400'
                    : 'bg-slate-100 dark:bg-[#1C2128] border-slate-200 dark:border-[#30363D] text-slate-500 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3]'
                }`}
                title={isShortlisted ? "Remove from shortlist" : "Add to prospective shortlist"}
              >
                <Bookmark className={`w-4 h-4 ${isShortlisted ? 'fill-amber-500 text-amber-500' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-md bg-slate-100 dark:bg-[#1C2128] border border-slate-200 dark:border-[#30363D] text-slate-500 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Contact & Action Links */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            {professor.email && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-500/50 shadow-xs">
                <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-semibold text-xs sm:text-sm font-mono tracking-tight">
                  <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <a 
                    href={`mailto:${professor.email}`}
                    className="hover:underline hover:text-indigo-900 dark:hover:text-white"
                    title={`Send email directly to ${professor.email}`}
                  >
                    {professor.email}
                  </a>
                </div>
                <div className="flex items-center gap-1 pl-1.5 border-l border-indigo-200 dark:border-indigo-500/40">
                  <button
                    onClick={handleCopyEmail}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-[#0D1117] hover:bg-indigo-100 dark:hover:bg-[#1C2128] text-indigo-700 dark:text-indigo-300 text-xs font-sans font-medium border border-indigo-200 dark:border-indigo-500/40 transition-colors"
                    title="Copy email to clipboard"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {professor.lab_link && (
              <a
                href={professor.lab_link}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1C2128] border border-slate-200 dark:border-[#30363D] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs font-medium transition-colors"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Lab Homepage</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              onClick={() => {
                onClose();
                onOpenEmailDrafter(professor);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-xs ml-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Draft Inquiry Pitch</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Scholarly Metrics 5-Box Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-[#30363D] text-center">
              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                Target Pubs
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                {professor.n_target_pubs ?? 0}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-[#30363D] text-center">
              <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                H-Index
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-[#E6EDF3] font-mono mt-1">
                {professor.h_index}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-[#30363D] text-center">
              <div className="text-[10px] font-bold text-slate-500 dark:text-[#7D8590] uppercase tracking-widest">
                Total Citations
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-[#E6EDF3] font-mono mt-1">
                {formatNumber(professor.total_citations)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-[#30363D] text-center">
              <div className="text-[10px] font-bold text-slate-500 dark:text-[#7D8590] uppercase tracking-widest">
                i10-Index
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-[#E6EDF3] font-mono mt-1">
                {professor.i10_index || '-'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-[#30363D] text-center col-span-2 sm:col-span-1">
              <div className="text-[10px] font-bold text-slate-500 dark:text-[#7D8590] uppercase tracking-widest">
                Total Pubs
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-[#E6EDF3] font-mono mt-1">
                {professor.total_publications}
              </div>
            </div>
          </div>

          {/* Yearly Citations Trend Area Chart */}
          {citationChartData.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-[#30363D]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#E6EDF3]">
                    Citations Growth & Trajectory (Yearly)
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-[#7D8590] font-mono">OpenAlex / Scholar Sync</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={citationChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCitations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-[#30363D]" opacity={0.6} />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748B' }} stroke="#CBD5E1" />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} stroke="#CBD5E1" tickFormatter={val => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '6px', color: '#F8FAFC', fontSize: '11px' }}
                      formatter={(val: any) => [formatNumber(Number(val)), 'Citations']}
                    />
                    <Area type="monotone" dataKey="citations" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCitations)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Research Focus */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#7D8590]">
              Research Focus & Specialization Areas
            </h3>
            <p className="text-xs text-slate-800 dark:text-[#E6EDF3] leading-relaxed">
              {professor.research_area}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {professor.research_topics.map(topic => (
                <span
                  key={topic}
                  className="px-2 py-0.5 bg-slate-100 dark:bg-[#1C2128] rounded text-[10px] uppercase font-bold text-slate-600 dark:text-[#8B949E] border border-slate-200 dark:border-[#30363D]"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Publication Venues & Venue Paper Counts Breakdown */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#7D8590]">
              Matched Publication Venues & Papers Breakdown
            </h3>
            <div className="flex flex-wrap gap-2">
              {professor.venue_paper_counts && professor.venue_paper_counts.length > 0 ? (
                professor.venue_paper_counts.map(vpc => (
                  <div
                    key={vpc.venue}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/30"
                  >
                    <span className="font-bold text-xs">{vpc.venue}</span>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-200/80 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-100 font-mono font-bold text-[10px]">
                      {vpc.papers} {vpc.papers === 1 ? 'paper' : 'papers'}
                    </span>
                  </div>
                ))
              ) : (
                professor.matched_conferences.map(conf => (
                  <span
                    key={conf}
                    className="px-2.5 py-1 rounded text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30"
                  >
                    {conf}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* External Scholarly Registry & Identifiers */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-[#30363D] space-y-2.5 text-xs">
            <h3 className="font-bold uppercase tracking-widest text-slate-500 dark:text-[#7D8590] text-[10px]">
              Academic Identifiers & Profiles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-900 dark:text-[#E6EDF3]">
              {professor.scholar_url && (
                <a 
                  href={professor.scholar_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#30363D] hover:border-indigo-500 transition-colors"
                >
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">Google Scholar Profile</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-[#7D8590]" />
                </a>
              )}

              {professor.dblp_pid && (
                <a 
                  href={`https://dblp.org/pid/${professor.dblp_pid}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#30363D] hover:border-indigo-500 transition-colors"
                >
                  <span>DBLP: <span className="font-mono text-slate-500 dark:text-[#7D8590]">{professor.dblp_pid}</span></span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-[#7D8590]" />
                </a>
              )}

              {professor.openalex_id && (
                <a
                  href={`https://openalex.org/authors/${professor.openalex_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#30363D] hover:border-indigo-500 transition-colors"
                >
                  <span>OpenAlex: <strong className="text-sky-600 dark:text-sky-400 font-mono">{professor.openalex_id}</strong></span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-[#7D8590]" />
                </a>
              )}

              {professor.orcid && (
                <div className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#30363D]">
                  <span className="text-slate-500 dark:text-[#7D8590]">ORCID: <strong className="text-slate-900 dark:text-[#E6EDF3] font-mono">{professor.orcid}</strong></span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
