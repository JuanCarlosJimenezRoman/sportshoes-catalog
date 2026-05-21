import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
      }
    }
    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-10">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-xl border border-[#E8E8E8] flex items-center justify-center
                 hover:bg-[#F5F5F5] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200
                 text-[#666666] hover:text-[#1A1A1A]"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      
      {getPageNumbers().map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
            currentPage === page
              ? 'bg-[#1A1A1A] text-white shadow-lg shadow-[#1A1A1A]/20'
              : 'border border-[#E8E8E8] text-[#666666] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]'
          }`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 rounded-xl border border-[#E8E8E8] flex items-center justify-center
                 hover:bg-[#F5F5F5] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200
                 text-[#666666] hover:text-[#1A1A1A]"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </nav>
  );
}