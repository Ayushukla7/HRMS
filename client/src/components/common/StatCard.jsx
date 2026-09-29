import React from 'react';

const StatCard = ({ title, value, icon: Icon, subtitle, change, changeType = 'positive' }) => {
  return (
    <div className="bento-card p-5 relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#E7DBEF]/60">{title}</p>
          <h3 className="text-2xl font-black text-[#F5EBFA] font-mono tracking-tight mt-1">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className="p-2.5 rounded-2xl bg-[#6E3482]/20 text-[#A56ABD] border border-[#A56ABD]/30">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || change) && (
        <div className="mt-3 pt-3 border-t border-[#A56ABD]/15 flex items-center justify-between text-xs">
          {subtitle && <span className="text-[#E7DBEF]/60 font-medium">{subtitle}</span>}
          {change && (
            <span
              className={`font-bold ${
                changeType === 'positive' ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {change}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
