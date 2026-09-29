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
      <div className="bg-[#121319] rounded-3xl border border-white/[0.07] p-12 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-7 h-7 animate-spin text-cyan-400 mb-2.5" />
        <p className="text-xs font-semibold text-slate-300">Loading dataset...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-[#121319] rounded-3xl border border-white/[0.07] p-12 flex flex-col items-center justify-center text-slate-400 text-center">
        <div className="w-12 h-12 bg-[#181922] border border-white/[0.06] rounded-2xl flex items-center justify-center mb-3">
          <Inbox className="w-6 h-6 text-slate-500" />
        </div>
        <p className="text-sm font-bold text-slate-200 mb-0.5">{emptyMessage}</p>
        <p className="text-xs text-slate-500">Try adjusting your filters, search terms, or date criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#121319] rounded-3xl border border-white/[0.07] shadow-2xl overflow-hidden backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/[0.06]">
          <thead className="bg-[#181922]">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className={`px-5 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] bg-[#121319] text-slate-200 font-medium">
            {data.map((row, rowIdx) => (
              <tr
                key={row._id || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors duration-150 ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-white/[0.04]'
                    : 'hover:bg-white/[0.02]'
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`px-5 py-4 whitespace-nowrap text-xs ${col.cellClassName || ''}`}>
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
