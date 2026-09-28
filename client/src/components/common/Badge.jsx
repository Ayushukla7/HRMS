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
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      
      case 'pending':
      case 'late':
      case 'screening':
      case 'interview':
      case 'draft':
      case 'in progress':
      case 'processing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      
      case 'absent':
      case 'rejected':
      case 'terminated':
      case 'cancelled':
      case 'closed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      
      case 'half day':
      case 'on leave':
      case 'offered':
      case 'leave':
        return 'bg-blue-50 text-blue-700 border-blue-200';

      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200 font-semibold';

      case 'employee':
        return 'bg-slate-100 text-slate-700 border-slate-200';

      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVariantStyles()} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
