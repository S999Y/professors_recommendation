import React, { useState } from 'react';
import { 
  Bookmark, 
  ExternalLink, 
  Globe,
  Mail,
  Copy,
  Check
} from 'lucide-react';
import { Professor } from '../types';

interface ProfessorCardProps {
  professor: Professor;
  isShortlisted: boolean;
  onToggleShortlist: (prof: Professor) => void;
  onViewDetails: (prof: Professor) => void;
  onDraftEmail?: (prof: Professor) => void;
}

export const ProfessorCard: React.FC<ProfessorCardProps> = ({
  professor,
  isShortlisted,
  onToggleShortlist,
  onViewDetails
}) => {
  const [copied, setCopied] = useState(false);
  const profileOrLabUrl = professor.lab_link || professor.scholar_url || (professor.dblp_pid ? `https://dblp.org/pid/${professor.dblp_pid}` : null);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (professor.email) {
      navigator.clipboard.writeText(professor.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      onClick={() => onViewDetails(professor)}
      id={`prof-card-${professor.id}`}
      className="bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#30363D] rounded-xl p-5 hover:border-indigo-500/80 dark:hover:border-indigo-500/80 transition-all duration-200 cursor-pointer group shadow-xs hover:shadow-md flex flex-col justify-between"
    >
      <div>
        {/* Tier & Ranking Badge Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
              professor.r_tier === 'R1'
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/40'
                : 'bg-slate-100 dark:bg-[#1C2128] text-slate-600 dark:text-[#8B949E] border border-slate-200 dark:border-[#30363D]'
            }`}>
              {professor.r_tier} Tier
            </span>

            {professor.ranking && (
              <span className="text-[10px] font-mono text-slate-600 dark:text-[#7D8590] bg-slate-100 dark:bg-[#1C2128] px-2 py-0.5 rounded border border-slate-200 dark:border-[#30363D]">
                Rank #{professor.ranking}
              </span>
            )}
          </div>

          {/* Action icons: Direct Profile/Lab Link & Shortlist Bookmark */}
          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
            {profileOrLabUrl && (
              <a
                href={profileOrLabUrl}
                target="_blank"
                rel="noreferrer"
                title="Visit Professor's Lab / Profile Page"
                className="p-1.5 rounded-md bg-slate-100 dark:bg-[#1C2128] hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-[#30363D] hover:border-indigo-500 transition-colors flex items-center justify-center"
              >
                <Globe className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={() => onToggleShortlist(professor)}
              className={`p-1.5 rounded-md border transition-colors ${
                isShortlisted
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/60 text-amber-600 dark:text-amber-400'
                  : 'bg-slate-100 dark:bg-[#1C2128] border-slate-200 dark:border-[#30363D] text-slate-400 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3] hover:border-slate-300 dark:hover:border-[#8B949E]'
              }`}
              title={isShortlisted ? "Remove from shortlist" : "Add to prospective shortlist"}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Professor Name & Position */}
        <div className="mt-1">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-[#E6EDF3] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">
            {professor.name}
          </h3>
          <p className="text-sm font-medium text-slate-600 dark:text-[#7D8590] group-hover:text-slate-900 dark:group-hover:text-[#8B949E] transition-colors">
            {professor.university}
          </p>
        </div>

        {/* Research Area Tag & OpenAlex ID */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-[#1C2128] text-slate-700 dark:text-[#E6EDF3] border border-slate-200 dark:border-[#30363D]">
            {professor.research_area || 'Computer Science'}
          </span>

          {professor.openalex_id && (
            <a
              href={`https://openalex.org/authors/${professor.openalex_id}`}
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800/40 hover:underline"
              title="OpenAlex Author Profile"
            >
              OpenAlex: {professor.openalex_id}
            </a>
          )}
        </div>

        {/* Venue Paper Counts & Matched Conferences */}
        {((professor.venue_paper_counts && professor.venue_paper_counts.length > 0) || (professor.matched_conferences && professor.matched_conferences.length > 0)) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {professor.venue_paper_counts && professor.venue_paper_counts.length > 0 ? (
              professor.venue_paper_counts.map(vpc => (
                <span
                  key={vpc.venue}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-500/30"
                >
                  <span className="font-semibold">{vpc.venue}</span>
                  <span className="px-1 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 font-mono font-bold text-[9px]">
                    {vpc.papers}
                  </span>
                </span>
              ))
            ) : (
              professor.matched_conferences.slice(0, 4).map(conf => (
                <span
                  key={conf}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-[#1C2128] text-slate-700 dark:text-[#8B949E] border border-slate-200 dark:border-[#30363D]"
                >
                  {conf}
                </span>
              ))
            )}
          </div>
        )}

        {/* Prominent Email Pill or Status */}
        {professor.email ? (
          <div 
            onClick={handleCopyEmail}
            className="mt-3.5 flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-500/40 hover:border-indigo-400 dark:hover:border-indigo-400 text-indigo-950 dark:text-indigo-200 transition-colors group/mail"
            title="Click to copy email address"
          >
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="text-xs font-mono font-medium truncate">{professor.email}</span>
            </div>
            <span className="text-[10px] font-sans font-semibold text-indigo-600 dark:text-indigo-400 shrink-0 flex items-center gap-0.5">
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </span>
          </div>
        ) : (
          <div className="mt-3.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-[#30363D] text-slate-400 dark:text-[#7D8590] text-xs">
            <Mail className="w-3.5 h-3.5 opacity-50" />
            <span className="text-[11px] italic">No public email listed</span>
          </div>
        )}
      </div>

      {/* Subtle Hint to View Full Profile */}
      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-[#30363D]/60 flex items-center justify-between text-xs text-slate-500 dark:text-[#7D8590] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        <span className="text-[11px]">Click card for full details</span>
        <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
};
