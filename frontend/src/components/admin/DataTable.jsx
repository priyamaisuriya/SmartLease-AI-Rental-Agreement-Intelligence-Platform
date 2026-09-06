import React from 'react';

const DataTable = ({ columns, data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left whitespace-nowrap">
        <thead>
          <tr className="bg-paper-card border-y border-border">
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className="px-6 py-4 text-[10.5px] font-semibold text-text-muted uppercase tracking-[0.1em]"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-text-faint">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
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
  );
};

export default DataTable;
