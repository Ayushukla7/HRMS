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
        return 'bg-neutral-900 text-white border-neutral-900 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50';
      
      case 'pending':
      case 'late':
      case 'screening':
      case 'interview':
      case 'draft':
      case 'in progress':
      case 'processing':
        return 'bg-neutral-100 text-neutral-800 border-neutral-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50';
      
      case 'absent':
      case 'rejected':
      case 'terminated':
      case 'cancelled':
      case 'closed':
        return 'bg-neutral-200 text-neutral-700 border-neutral-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50';
      
      case 'half day':
      case 'on leave':
      case 'offered':
      case 'leave':
        return 'bg-neutral-100 text-neutral-900 border-neutral-300 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50';

      case 'admin':
        return 'bg-black text-white border-black dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 font-semibold';

      case 'employee':
        return 'bg-neutral-100 text-neutral-800 border-neutral-300 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700';

      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
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
