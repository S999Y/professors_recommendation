import React from 'react';
import { 
  Moon, 
  Sun, 
  Upload, 
  Bookmark, 
  BarChart3, 
  Database
} from 'lucide-react';
import { DatasetStats } from '../types';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  shortlistCount: number;
  onOpenShortlist: () => void;
  onOpenUpload: () => void;
  onOpenStats: () => void;
  onResetDataset: () => void;
  stats: DatasetStats | null;
  activeDatasetCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  shortlistCount,
  onOpenShortlist,
  onOpenUpload,
  onOpenStats,
  stats,
  activeDatasetCount
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-[#30363D] px-4 sm:px-8 flex items-center justify-between bg-white dark:bg-[#0D1117] transition-colors duration-200 shadow-xs">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-xs">
          S
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-semibold tracking-tight text-slate-900 dark:text-[#E6EDF3]">
            ScholarIndex <span className="text-slate-500 dark:text-[#7D8590] font-normal text-xs ml-1 font-mono">v2.4</span>
          </span>
          <span className="hidden sm:inline-block text-xs text-slate-500 dark:text-[#7D8590] border-l border-slate-200 dark:border-[#30363D] pl-2.5">
            Faculty Discovery Intelligence
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick dataset indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 dark:bg-[#010409] text-slate-600 dark:text-[#7D8590] text-xs border border-slate-200 dark:border-[#30363D]">
          <Database className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-slate-900 dark:text-[#E6EDF3] font-medium">{activeDatasetCount} Faculty</span>
          {stats && (
            <span className="text-slate-400 dark:text-[#484F58]">
              • {stats.r1Count} R1 / {stats.r2Count} R2
            </span>
          )}
        </div>

        {/* Analytics button */}
        <button
          id="btn-stats-overview"
          onClick={onOpenStats}
          title="View dataset analytics"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-slate-700 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3] bg-slate-100 dark:bg-[#1C2128] hover:bg-slate-200 dark:hover:bg-[#252c36] border border-slate-200 dark:border-[#30363D] transition-colors"
        >
          <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="hidden sm:inline">Analytics</span>
        </button>

        {/* Import / Upload JSON/CSV Modal */}
        <button
          id="btn-import-dataset"
          onClick={onOpenUpload}
          title="Import custom JSON / CSV dataset"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-indigo-600 dark:text-indigo-400 hover:text-white bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-600 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/50 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span className="font-semibold">Import JSON</span>
        </button>

        {/* Shortlisted Prospect Drawer */}
        <button
          id="btn-open-shortlist"
          onClick={onOpenShortlist}
          title="Shortlisted Faculty Prospect List"
          className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-slate-700 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3] bg-slate-100 dark:bg-[#1C2128] hover:bg-slate-200 dark:hover:bg-[#252c36] border border-slate-200 dark:border-[#30363D] transition-colors"
        >
          <Bookmark className={`w-4 h-4 ${shortlistCount > 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-400 dark:text-[#7D8590]'}`} />
          <span className="hidden sm:inline">Prospects</span>
          {shortlistCount > 0 && (
            <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold leading-none text-white bg-amber-600 rounded-full">
              {shortlistCount}
            </span>
          )}
        </button>

        {/* Dark / Light mode toggle */}
        <div className="border-l border-slate-200 dark:border-[#30363D] pl-2 sm:pl-3">
          <button
            id="btn-toggle-theme"
            onClick={() => setDarkMode(prev => !prev)}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
            className="p-1.5 rounded-full text-slate-600 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3] hover:bg-slate-100 dark:hover:bg-[#1C2128] border border-slate-200 dark:border-[#30363D] transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>
    </header>
  );
};
