import React from 'react';

const DataTable = ({ columns, data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left whitespace-nowrap">
        <thead>
          <tr className="bg-canvas border-y border-line">
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className="px-6 py-4 text-xs font-semibold text-ink-soft uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-ink-faint">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className="hover:bg-canvas/50 transition-colors"
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 text-sm text-ink">
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
