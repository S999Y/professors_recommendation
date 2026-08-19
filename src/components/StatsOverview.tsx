import React from 'react';
import { 
  X, 
  BarChart3
} from 'lucide-react';
import { DatasetStats } from '../types';

interface StatsOverviewProps {
  isOpen: boolean;
  onClose: () => void;
  stats: DatasetStats | null;
  onSelectTopic?: (topic: string) => void;
  onSelectVenue?: (venue: string) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  isOpen,
  onClose,
  stats,
  onSelectTopic,
  onSelectVenue
}) => {
  if (!isOpen || !stats) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#0D1117] text-slate-900 dark:text-[#E6EDF3] rounded-xl shadow-2xl border border-slate-200 dark:border-[#30363D] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-50 dark:bg-[#010409] border-b border-slate-200 dark:border-[#30363D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-[#E6EDF3]">
                Dataset Analytics & Distribution
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#7D8590]">
                Aggregated metrics across indexed faculty records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md bg-slate-100 dark:bg-[#1C2128] border border-slate-200 dark:border-[#30363D] text-slate-500 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* Top 4 KPI metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-[#30363D] text-center">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-[#7D8590]">
                Total Faculty
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-[#E6EDF3] font-mono mt-1">
                {stats.totalProfessors}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-[#30363D] text-center">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-[#7D8590]">
                Universities
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-[#E6EDF3] font-mono mt-1">
                {stats.totalUniversities}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-[#30363D] text-center">
              <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Avg h-index
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-[#E6EDF3] font-mono mt-1">
                {stats.avgHIndex}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-[#30363D] text-center">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-[#7D8590]">
                Total Citations
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-[#E6EDF3] font-mono mt-1">
                {stats.totalCitations.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Carnegie Classification Ratio */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-[#30363D] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-[#7D8590]">
              <span>Carnegie Classification Breakdown</span>
              <span>{stats.r1Count} R1 ({Math.round((stats.r1Count / stats.totalProfessors) * 100 || 0)}%) • {stats.r2Count} R2 ({Math.round((stats.r2Count / stats.totalProfessors) * 100 || 0)}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-[#1C2128] overflow-hidden flex">
              <div 
                style={{ width: `${(stats.r1Count / (stats.totalProfessors || 1)) * 100}%` }} 
                className="bg-indigo-600 dark:bg-indigo-500 h-full"
                title={`R1: ${stats.r1Count}`}
              />
              <div 
                style={{ width: `${(stats.r2Count / (stats.totalProfessors || 1)) * 100}%` }} 
                className="bg-indigo-300 dark:bg-indigo-800 h-full"
                title={`R2: ${stats.r2Count}`}
              />
            </div>
          </div>

          {/* Top Publication Venues */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#7D8590]">
              Most Represented Publication Venues
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {stats.topVenues.slice(0, 9).map(({ name, count }) => (
                <button
                  key={name}
                  onClick={() => {
                    if (onSelectVenue) onSelectVenue(name);
                    onClose();
                  }}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#010409] hover:bg-slate-100 dark:hover:bg-[#1C2128] border border-slate-200 dark:border-[#30363D] hover:border-slate-300 dark:hover:border-[#8B949E] flex items-center justify-between text-xs transition-colors"
                >
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{name}</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#1C2128] text-slate-600 dark:text-[#8B949E] text-[10px] font-mono">
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Top Research Topics */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#7D8590]">
              Top Research Sub-disciplines
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {stats.topTopics.slice(0, 15).map(({ name, count }) => (
                <button
                  key={name}
                  onClick={() => {
                    if (onSelectTopic) onSelectTopic(name);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-md bg-slate-50 dark:bg-[#010409] hover:bg-slate-100 dark:hover:bg-[#1C2128] border border-slate-200 dark:border-[#30363D] hover:border-slate-300 dark:hover:border-[#8B949E] text-xs text-slate-600 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3] transition-colors flex items-center gap-1.5"
                >
                  <span>{name}</span>
                  <span className="text-[10px] text-slate-400 dark:text-[#484F58] font-mono">({count})</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
