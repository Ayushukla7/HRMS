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
        return 'bg-[#A56ABD]/20 text-[#F5EBFA] border-[#A56ABD]/50 shadow-xs';

      case 'pending':
      case 'late':
      case 'screening':
      case 'interview':
      case 'draft':
      case 'in progress':
      case 'processing':
        return 'bg-[#6E3482]/30 text-[#F5EBFA] border-[#A56ABD]/40 shadow-xs';

      case 'absent':
      case 'rejected':
      case 'terminated':
      case 'cancelled':
      case 'closed':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';

      case 'half day':
      case 'on leave':
      case 'offered':
      case 'leave':
        return 'bg-[#49225B]/60 text-[#E7DBEF] border-[#A56ABD]/40';

      case 'admin':
        return 'bg-gradient-to-r from-[#6E3482] to-[#49225B] text-[#F5EBFA] border-[#A56ABD]/60 font-bold shadow-sm';

      case 'employee':
        return 'bg-[#271337] text-[#E7DBEF] border-[#A56ABD]/30 font-medium';

      default:
        return 'bg-[#271337] text-[#E7DBEF] border-[#A56ABD]/30';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getVariantStyles()} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
