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
        return 'bg-black text-white border-black font-semibold';
      
      case 'pending':
      case 'late':
      case 'screening':
      case 'interview':
      case 'draft':
      case 'in progress':
      case 'processing':
        return 'bg-neutral-100 text-neutral-900 border-neutral-300 font-medium';
      
      case 'absent':
      case 'rejected':
      case 'terminated':
      case 'cancelled':
      case 'closed':
        return 'bg-neutral-200 text-neutral-800 border-neutral-300 font-medium line-through';
      
      case 'half day':
      case 'on leave':
      case 'offered':
      case 'leave':
        return 'bg-neutral-100 text-neutral-900 border-neutral-300 font-medium';

      case 'admin':
        return 'bg-black text-white border-black font-semibold';

      case 'employee':
        return 'bg-neutral-100 text-neutral-800 border-neutral-300 font-medium';

      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-300 font-medium';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${getVariantStyles()} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
