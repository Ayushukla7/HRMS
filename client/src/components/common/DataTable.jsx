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
      <div className="bg-white rounded-xl border border-neutral-200 p-12 flex flex-col items-center justify-center text-neutral-500">
        <Loader2 className="w-6 h-6 animate-spin text-black mb-2" />
        <p className="text-xs font-medium">Loading data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-12 flex flex-col items-center justify-center text-neutral-400 text-center">
        <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mb-2">
          <Inbox className="w-5 h-5 text-neutral-400" />
        </div>
        <p className="text-sm font-semibold text-neutral-900">{emptyMessage}</p>
        <p className="text-xs text-neutral-500 mt-0.5">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 text-neutral-900 text-sm">
            {data.map((row, rowIdx) => (
              <tr
                key={row._id || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-neutral-50'
                    : 'hover:bg-neutral-50/50'
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`px-4 py-3 whitespace-nowrap text-xs sm:text-sm ${col.className || ''}`}
                  >
                    {col.accessor
                      ? typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : row[col.accessor]
                      : col.render
                      ? col.render(row)
                      : null}
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
