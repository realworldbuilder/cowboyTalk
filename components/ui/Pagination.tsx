import { useState } from 'react';

interface PaginationProps {
  totalItems?: number;
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rows: number) => void;
}

export default function Pagination({
  totalItems = 0,
  itemsPerPage = 10,
  currentPage = 1,
  onPageChange = () => {},
  onRowsPerPageChange = () => {},
}: PaginationProps) {
  const [rowsPerPage, setRowsPerPage] = useState(itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRowsPerPage = parseInt(e.target.value);
    setRowsPerPage(newRowsPerPage);
    onRowsPerPageChange(newRowsPerPage);
  };
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 3; // Show at most 3 page numbers
    
    // Always show current page
    pageNumbers.push(currentPage);
    
    // Add pages before current
    if (currentPage > 1) {
      pageNumbers.unshift(currentPage - 1);
    }
    
    // Add pages after current
    if (currentPage < totalPages) {
      pageNumbers.push(currentPage + 1);
    }
    
    // Fill remaining slots if needed
    while (pageNumbers.length < maxPagesToShow && pageNumbers.length < totalPages) {
      if (pageNumbers[0] > 1) {
        pageNumbers.unshift(pageNumbers[0] - 1);
      } else if (pageNumbers[pageNumbers.length - 1] < totalPages) {
        pageNumbers.push(pageNumbers[pageNumbers.length - 1] + 1);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="mt-4 flex items-center justify-between border-t border-gray-200 px-3 py-4 text-xs md:text-sm text-gray-700">
      <div className="flex items-center space-x-2">
        <div className="h-2 w-2 rounded-full bg-primary"></div>
        <p className="font-medium">Page {currentPage} of {totalPages}</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <p className="font-medium">Rows per page:</p>
          <select 
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="rounded border border-gray-300 bg-white px-2 py-1 font-medium text-gray-800"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <button 
            className="h-8 w-8 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors" 
            aria-label="First page"
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M7.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L3.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            className="h-8 w-8 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors" 
            aria-label="Previous page"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* Page number buttons */}
          {getPageNumbers().map(pageNum => (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              className={`h-8 w-8 rounded-md border font-medium transition-colors ${
                currentPage === pageNum 
                  ? 'border-primary bg-primary text-white' 
                  : 'border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary'
              }`}
              aria-label={`Page ${pageNum}`}
              aria-current={currentPage === pageNum ? 'page' : undefined}
            >
              {pageNum}
            </button>
          ))}
          
          <button 
            className="h-8 w-8 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors" 
            aria-label="Next page"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            className="h-8 w-8 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors" 
            aria-label="Last page"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 6.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M12.293 15.707a1 1 0 010-1.414L16.586 10l-4.293-3.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 