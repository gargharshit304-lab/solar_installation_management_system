import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
  className?: string;
  itemLabel?: string;
}

/**
 * Enterprise Reusable Pagination Component for SolarOS
 * Conforms to SolarOS Design System:
 * - Sand background (#E9E0D2 / bg-sand-50)
 * - Charcoal text (#30343B)
 * - Navy primary active states (#183153)
 * - Warm Grey borders (#D8D0C4)
 * - Muted Grey secondary labels (#777777)
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  isLoading = false,
  className = '',
  itemLabel = 'records'
}) => {
  const safeCurrentPage = Math.max(1, Math.min(currentPage || 1, Math.max(1, totalPages || 1)));
  const safeTotalPages = Math.max(1, totalPages || 1);

  // Calculate slice range (1-indexed for display)
  const startRecord = totalRecords === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endRecord = Math.min(safeCurrentPage * pageSize, totalRecords);

  // Generate intelligent page numbers with ellipses
  const getPageNumbers = (): (number | string)[] => {
    if (safeTotalPages <= 7) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    pages.push(1);

    if (safeCurrentPage > 3) {
      pages.push('...');
    }

    const start = Math.max(2, safeCurrentPage - 1);
    const end = Math.min(safeTotalPages - 1, safeCurrentPage + 1);

    for (let i = start; i <= end; i++) {
      if (i > 1 && i < safeTotalPages) {
        pages.push(i);
      }
    }

    if (safeCurrentPage < safeTotalPages - 2) {
      pages.push('...');
    }

    if (safeTotalPages > 1) {
      pages.push(safeTotalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white rounded-xl border border-warmGrey/70 shadow-xs text-xs select-none ${className}`}
      aria-label="Pagination Navigation"
    >
      {/* 1. Records Range & Page Size Selector */}
      <div className="flex flex-wrap items-center gap-3 text-mutedGrey w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex items-center space-x-1.5 font-medium">
          <span>Showing</span>
          <strong className="text-charcoal font-bold font-mono">
            {totalRecords === 0 ? '0' : `${startRecord}–${endRecord}`}
          </strong>
          <span>of</span>
          <strong className="text-charcoal font-bold font-mono">
            {totalRecords.toLocaleString('en-IN')}
          </strong>
          <span>{itemLabel}</span>
          {isLoading && (
            <div className="inline-block w-3 h-3 ml-1 border-2 border-navy/20 border-t-navy rounded-full animate-spin" />
          )}
        </div>

        {onPageSizeChange && (
          <div className="flex items-center space-x-1.5 pl-2 sm:border-l sm:border-warmGrey/60">
            <span className="text-[11px] text-mutedGrey font-medium">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                onPageSizeChange(newSize);
                onPageChange(1);
              }}
              disabled={isLoading}
              className="px-2 py-1 bg-sand-50 border border-warmGrey rounded-lg text-charcoal font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-navy hover:bg-white transition-colors cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Page Navigation Controls */}
      <div className="flex items-center space-x-1 w-full sm:w-auto justify-center sm:justify-end">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={safeCurrentPage <= 1 || isLoading}
          aria-label="First page"
          title="First page"
          className="p-1.5 rounded-lg border border-warmGrey/60 bg-white text-charcoal hover:bg-sand-100 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1 || isLoading}
          aria-label="Previous page"
          title="Previous page"
          className="px-2.5 py-1.5 rounded-lg border border-warmGrey/60 bg-white text-charcoal font-semibold hover:bg-sand-100 disabled:opacity-35 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Previous</span>
        </button>

        {/* Numbered Page Buttons with Ellipses */}
        <div className="flex items-center space-x-1">
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-mutedGrey font-mono text-xs select-none"
                >
                  …
                </span>
              );
            }

            const pageNum = Number(p);
            const isActive = pageNum === safeCurrentPage;

            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={() => onPageChange(pageNum)}
                disabled={isLoading}
                aria-current={isActive ? 'page' : undefined}
                className={`min-w-[28px] h-7 px-1.5 rounded-lg font-bold font-mono text-xs transition-colors ${
                  isActive
                    ? 'bg-navy text-white shadow-xs'
                    : 'bg-white border border-warmGrey/60 text-charcoal hover:bg-sand-100'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= safeTotalPages || isLoading}
          aria-label="Next page"
          title="Next page"
          className="px-2.5 py-1.5 rounded-lg border border-warmGrey/60 bg-white text-charcoal font-semibold hover:bg-sand-100 disabled:opacity-35 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
        >
          <span className="hidden md:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(safeTotalPages)}
          disabled={safeCurrentPage >= safeTotalPages || isLoading}
          aria-label="Last page"
          title="Last page"
          className="p-1.5 rounded-lg border border-warmGrey/60 bg-white text-charcoal hover:bg-sand-100 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
