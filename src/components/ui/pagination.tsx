import React from "react";
import { Button } from "./button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  // Helper to generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("ellipsis", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "ellipsis");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1, "ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("ellipsis", totalPages);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-6"
      aria-label="Pagination"
    >
      <div className="flex-1 flex items-center justify-center sm:justify-start text-sm text-muted-foreground">
        Page <span className="font-semibold mx-1">{currentPage}</span> of{" "}
        <span className="font-semibold mx-1">{totalPages}</span>
      </div>
      <div className="flex gap-1 flex-wrap justify-center">
        <Button
          variant="outline"
          size="icon"
          aria-label="First page"
          tabIndex={0}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="w-8 h-8"
        >
          <span className="sr-only">First</span>
          &laquo;
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous page"
          tabIndex={0}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8"
        >
          <span className="sr-only">Previous</span>
          &lsaquo;
        </Button>
        {/* Page number btns */}
        {pageNumbers.map((page, idx) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 text-muted-foreground select-none"
              aria-hidden="true"
            >
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="icon"
              aria-label={`Page ${page}`}
              tabIndex={0}
              onClick={() => onPageChange(page as number)}
              disabled={page === currentPage}
              className={
                page === currentPage
                  ? "w-8 h-8 bg-primary text-primary-foreground font-bold pointer-events-none"
                  : "w-8 h-8"
              }
            >
              {page}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="icon"
          aria-label="Next page"
          tabIndex={0}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8"
        >
          <span className="sr-only">Next</span>
          &rsaquo;
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Last page"
          tabIndex={0}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="w-8 h-8"
        >
          <span className="sr-only">Last</span>
          &raquo;
        </Button>
      </div>
    </nav>
  );
};
