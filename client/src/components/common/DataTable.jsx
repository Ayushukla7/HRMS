import React from 'react';
import { Loader2, Inbox } from 'lucide-react';

const DataTable = ({
  columns,
  data = [],
  loading = false,
  emptyMessage = 'No records found',
  onRowClick,
}) => {
  if (loading) {
    return (
      <div className="bg-[#1c0d28] rounded-3xl border border-[#A56ABD]/25 p-12 flex flex-col items-center justify-center text-[#E7DBEF]">
        <Loader2 className="w-7 h-7 animate-spin text-[#A56ABD] mb-2.5" />
        <p className="text-xs sm:text-sm font-semibold text-[#F5EBFA]">Loading dataset...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-[#1c0d28] rounded-3xl border border-[#A56ABD]/25 p-12 flex flex-col items-center justify-center text-[#E7DBEF] text-center shadow-xl">
        <div className="w-12 h-12 bg-[#271337] border border-[#A56ABD]/30 rounded-2xl flex items-center justify-center mb-3">
          <Inbox className="w-6 h-6 text-[#A56ABD]" />
        </div>
        <p className="text-sm sm:text-base font-bold text-[#F5EBFA] mb-0.5">{emptyMessage}</p>
        <p className="text-xs text-[#A56ABD]">Try adjusting your filters, search terms, or date criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1c0d28] rounded-3xl border border-[#A56ABD]/22 shadow-2xl overflow-hidden backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#A56ABD]/15">
          <thead className="bg-[#271337]">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className={`px-5 py-4 text-left text-[11px] sm:text-xs font-bold text-[#E7DBEF] uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#A56ABD]/10 bg-[#1c0d28] text-[#F5EBFA] font-medium">
            {data.map((row, rowIdx) => (
              <tr
                key={row._id || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors duration-150 ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-[#271337]/70'
                    : 'hover:bg-[#271337]/40'
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`px-5 py-4 whitespace-nowrap text-xs sm:text-sm ${col.cellClassName || ''}`}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
