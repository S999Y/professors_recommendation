import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let leftBound = Math.max(2, currentPage - 1);
      let rightBound = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        leftBound = 2;
        rightBound = 4;
      } else if (currentPage >= totalPages - 2) {
        leftBound = totalPages - 3;
        rightBound = totalPages - 1;
      }

      if (leftBound > 2) {
        pages.push('...');
      }

      for (let i = leftBound; i <= rightBound; i++) {
        pages.push(i);
      }

      if (rightBound < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav 
      aria-label="Pagination Navigation" 
      className="flex items-center justify-center gap-1.5 py-2 select-none"
    >
      {/* Previous Page Button */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#0D1117] text-xs font-medium text-slate-700 dark:text-[#E6EDF3] hover:bg-slate-50 dark:hover:bg-[#161B22] hover:border-slate-300 dark:hover:border-[#8B949E] disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-2xs"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        <span>Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1 mx-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-1 text-xs text-slate-400 dark:text-[#484F58]"
              >
                …
              </span>
            );
          }

          const isCurrent = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              aria-current={isCurrent ? 'page' : undefined}
              className={`min-w-8 h-8 rounded-lg text-xs font-semibold font-mono border transition-all ${
                isCurrent
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#0D1117] border-slate-200 dark:border-[#30363D] text-slate-700 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3] hover:bg-slate-50 dark:hover:bg-[#161B22] hover:border-slate-300 dark:hover:border-[#8B949E]'
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Page Button */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#0D1117] text-xs font-medium text-slate-700 dark:text-[#E6EDF3] hover:bg-slate-50 dark:hover:bg-[#161B22] hover:border-slate-300 dark:hover:border-[#8B949E] disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-2xs"
      >
        <span>Next</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </nav>
  );
};
