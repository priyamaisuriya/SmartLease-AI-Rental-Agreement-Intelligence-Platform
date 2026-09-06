import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';

const DataTable = ({ columns, data, itemsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Reset to page 1 if data changes (e.g. searching/filtering)
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="bg-paper-card border-y border-border">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`px-6 py-4 text-[10.5px] font-semibold text-text-muted uppercase tracking-[0.1em] ${col.accessor ? 'cursor-pointer hover:bg-[#E6E2D6]/30 transition-colors select-none' : ''}`}
                  onClick={() => col.accessor && handleSort(col.accessor)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.accessor && (
                      <span className="text-text-faint flex flex-col items-center justify-center h-4">
                        {sortConfig.key === col.accessor ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="w-3 h-3 text-ink" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-ink" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-50" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-text-faint">
                  No data available
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className="hover:bg-[#FBFAF7] transition-colors"
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-3.5 text-[14px] text-ink">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-white">
          <div className="text-[13px] text-text-muted">
            Showing <span className="font-semibold text-ink">{startIndex + 1}</span> to <span className="font-semibold text-ink">{Math.min(startIndex + itemsPerPage, sortedData.length)}</span> of <span className="font-semibold text-ink">{sortedData.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="p-1.5 rounded-[6px] border border-border text-ink hover:bg-paper-card disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 flex items-center justify-center rounded-[6px] text-[13px] font-semibold transition-colors ${
                    currentPage === i + 1 
                      ? 'bg-ink text-white' 
                      : 'text-text-muted hover:bg-paper-card hover:text-ink'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-[6px] border border-border text-ink hover:bg-paper-card disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
