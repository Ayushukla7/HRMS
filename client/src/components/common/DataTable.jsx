import React from 'react';
import { Loader2, Inbox } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const DataTable = ({
  columns,
  data = [],
  loading = false,
  emptyMessage = 'No records found',
  onRowClick,
}) => {
  const { isDark } = useTheme();

  if (loading) {
    return (
      <div className="glass-panel rounded-3xl p-12 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-3" />
        <p className="text-sm font-medium">Loading data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-12 flex flex-col items-center justify-center text-slate-400 text-center">
        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3">
          <Inbox className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-sm font-semibold mb-1">{emptyMessage}</p>
        <p className="text-xs text-slate-500">Try adjusting your filters or adding a new record.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className={isDark ? 'bg-white/[0.02]' : 'bg-black/[0.02]'}>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className={`px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((row, rowIdx) => (
              <tr
                key={row._id || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors duration-100 ${
                  onRowClick
                    ? isDark ? 'cursor-pointer hover:bg-white/[0.06]' : 'cursor-pointer hover:bg-black/[0.03]'
                    : isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-black/[0.02]'
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`px-5 py-4 whitespace-nowrap text-sm ${col.cellClassName || ''}`}>
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
