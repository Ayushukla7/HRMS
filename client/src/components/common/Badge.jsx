import React from 'react';

const Badge = ({ variant = 'default', children, className = '' }) => {
  const getVariantStyles = () => {
    switch (variant.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'present':
      case 'paid':
      case 'hired':
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50';
      
      case 'pending':
      case 'late':
      case 'screening':
      case 'interview':
      case 'draft':
      case 'in progress':
      case 'processing':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50';
      
      case 'absent':
      case 'rejected':
      case 'terminated':
      case 'cancelled':
      case 'closed':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50';
      
      case 'half day':
      case 'on leave':
      case 'offered':
      case 'leave':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50';

      case 'admin':
        return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 font-semibold';

      case 'employee':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700';

      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getVariantStyles()} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
