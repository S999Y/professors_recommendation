import React from 'react';
import { 
  X, 
  Trash2, 
  ExternalLink, 
  Mail, 
  Bookmark, 
  FileSpreadsheet
} from 'lucide-react';
import { ShortlistedProfessor, Professor } from '../types';

interface ShortlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  shortlist: ShortlistedProfessor[];
  onRemove: (profId: string) => void;
  onUpdateStatus: (profId: string, status: ShortlistedProfessor['status']) => void;
  onUpdateNotes: (profId: string, notes: string) => void;
  onViewDetails: (prof: Professor) => void;
  onDraftEmail: (prof: Professor) => void;
}

export const ShortlistDrawer: React.FC<ShortlistDrawerProps> = ({
  isOpen,
  onClose,
  shortlist,
  onRemove,
  onUpdateStatus,
  onUpdateNotes,
  onViewDetails,
  onDraftEmail
}) => {
  if (!isOpen) return null;

  const exportToCSV = () => {
    if (shortlist.length === 0) return;
    const headers = ['Professor Name', 'University', 'R Tier', 'Ranking', 'Email', 'Position', 'Research Area', 'H-Index', 'Citations', 'Status', 'Notes'];
    const rows = shortlist.map(s => [
      `"${s.professor.name}"`,
      `"${s.professor.university}"`,
      `"${s.professor.r_tier}"`,
      `"${s.professor.ranking || ''}"`,
      `"${s.professor.email}"`,
      `"${s.professor.position}"`,
      `"${s.professor.research_area.replace(/"/g, '""')}"`,
      s.professor.h_index,
      s.professor.total_citations,
      `"${s.status || 'Shortlisted'}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shortlisted_faculty_prospects_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 dark:bg-black/80 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-xl bg-white dark:bg-[#0D1117] text-slate-900 dark:text-[#E6EDF3] h-full shadow-2xl border-l border-slate-200 dark:border-[#30363D] flex flex-col animate-in slide-in-from-right duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-50 dark:bg-[#010409] border-b border-slate-200 dark:border-[#30363D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-500/40">
              <Bookmark className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-[#E6EDF3]">
                Shortlisted Prospects
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#7D8590]">
                {shortlist.length} faculty members saved
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {shortlist.length > 0 && (
              <button
                onClick={exportToCSV}
                title="Export prospect list to CSV"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-[#1C2128] hover:bg-slate-200 dark:hover:bg-[#252c36] text-slate-900 dark:text-[#E6EDF3] border border-slate-200 dark:border-[#30363D] transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Export CSV</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md bg-slate-100 dark:bg-[#1C2128] border border-slate-200 dark:border-[#30363D] text-slate-500 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Shortlist Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {shortlist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-[#30363D] flex items-center justify-center text-slate-400 dark:text-[#7D8590]">
                <Bookmark className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-[#E6EDF3]">
                No Shortlisted Faculty Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#7D8590] max-w-xs leading-relaxed">
                Click the bookmark icon on any professor card to add them to your prospective advisor list, track application status, and add custom notes.
              </p>
            </div>
          ) : (
            shortlist.map(({ professor, status = 'Shortlisted', notes = '' }) => (
              <div
                key={professor.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-[#30363D] space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 
                      onClick={() => onViewDetails(professor)}
                      className="text-sm font-semibold text-slate-900 dark:text-[#E6EDF3] hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      {professor.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-[#7D8590]">
                      {professor.position} • {professor.university}
                    </p>
                    {professor.email && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span>{professor.email}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onRemove(professor.id)}
                    className="p-1 text-slate-400 dark:text-[#7D8590] hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                    title="Remove from shortlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Status selector */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 dark:text-[#7D8590]">Status:</span>
                  <select
                    value={status}
                    onChange={e => onUpdateStatus(professor.id, e.target.value as any)}
                    className="py-1 px-2.5 rounded-md border border-slate-300 dark:border-[#30363D] bg-white dark:bg-[#0D1117] text-slate-900 dark:text-[#E6EDF3] text-xs font-medium focus:border-indigo-500 outline-none"
                  >
                    <option value="Shortlisted">★ Shortlisted</option>
                    <option value="Contacted">✉ Email Sent</option>
                    <option value="Interviewing">💬 Interviewing</option>
                    <option value="Applied">📝 Applied</option>
                    <option value="Accepted">🎉 Offer / Accepted</option>
                  </select>

                  <div className="ml-auto text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                    h: {professor.h_index} | {professor.total_citations.toLocaleString()} cites
                  </div>
                </div>

                {/* Notes textarea */}
                <div>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={e => onUpdateNotes(professor.id, e.target.value)}
                    placeholder="Add personal notes (e.g. 'Emailed on Nov 1st', 'Fit with vision research')..."
                    className="w-full p-2.5 rounded-md bg-white dark:bg-[#0D1117] border border-slate-300 dark:border-[#30363D] text-xs text-slate-900 dark:text-[#E6EDF3] placeholder:text-slate-400 dark:placeholder:text-[#484F58] resize-none focus:border-indigo-500 outline-none"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    onClick={() => onDraftEmail(professor)}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 font-medium"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Draft Inquiry Email</span>
                  </button>

                  <button
                    onClick={() => onViewDetails(professor)}
                    className="text-slate-500 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3] flex items-center gap-1"
                  >
                    <span>Full Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
