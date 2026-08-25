import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers with window
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1; // Number of pages to show around current page

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (
        (i === currentPage - delta - 1 && i > 1) ||
        (i === currentPage + delta + 1 && i < totalPages)
      ) {
        pages.push("...");
      }
    }
    // Remove duplicate consecutive ellipsis
    return pages.filter((item, index) => item !== "..." || pages[index - 1] !== "...");
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}>
      {/* Items summary */}
      {totalItems !== undefined && (
        <div className="text-xs text-brand-on-surface-variant whitespace-nowrap shrink-0">
          총 <span className="font-semibold text-white">{totalItems}</span>개 항목 중{" "}
          <span className="font-semibold text-brand-primary">
            {Math.min((currentPage - 1) * (itemsPerPage || 6) + 1, totalItems)} -{" "}
            {Math.min(currentPage * (itemsPerPage || 6), totalItems)}
          </span>
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-brand-border/40 text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-high disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          title="첫 페이지"
          aria-label="첫 페이지"
        >
          <ChevronsLeft size={14} />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-brand-border/40 text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-high disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          title="이전 페이지"
          aria-label="이전 페이지"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((page, idx) =>
            typeof page === "number" ? (
              <button
                key={idx}
                onClick={() => onPageChange(page)}
                className={`min-w-[30px] h-[30px] text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                  currentPage === page
                    ? "bg-brand-primary-container text-white font-bold shadow-sm shadow-brand-primary/30"
                    : "border border-brand-border/40 text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-high hover:border-brand-border"
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={idx} className="px-1 text-xs text-brand-on-surface-variant/60 select-none">
                {page}
              </span>
            )
          )}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-brand-border/40 text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-high disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          title="다음 페이지"
          aria-label="다음 페이지"
        >
          <ChevronRight size={14} />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-brand-border/40 text-brand-on-surface-variant hover:text-white hover:bg-brand-surface-high disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          title="마지막 페이지"
          aria-label="마지막 페이지"
        >
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
}
