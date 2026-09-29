import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  icon: Icon,
  className = '',
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#A56ABD] focus:ring-offset-2 focus:ring-offset-[#12071a] disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-md';

  const sizeStyles = {
    xs: 'px-3 py-1 text-xs gap-1.5',
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#6E3482] to-[#49225B] hover:from-[#7f3d96] hover:to-[#5c2b73] text-[#F5EBFA] border border-[#A56ABD]/40 shadow-lg shadow-[#49225B]/40 hover:shadow-[#6E3482]/50 active:scale-[0.98]',
    accent:
      'bg-[#A56ABD] hover:bg-[#b57dce] text-[#12071a] font-black border border-[#E7DBEF]/40 shadow-md shadow-[#A56ABD]/30 active:scale-[0.98]',
    secondary:
      'bg-[#271337] hover:bg-[#381a4e] text-[#E7DBEF] border border-[#A56ABD]/30 hover:border-[#A56ABD]/60 active:scale-[0.98]',
    outline:
      'bg-transparent border border-[#A56ABD]/40 text-[#E7DBEF] hover:bg-[#6E3482]/20 hover:border-[#A56ABD] hover:text-[#F5EBFA]',
    danger:
      'bg-rose-600/90 hover:bg-rose-600 text-white border border-rose-400/30 shadow-md shadow-rose-900/30',
    success:
      'bg-emerald-600/90 hover:bg-emerald-600 text-white border border-emerald-400/30 shadow-md shadow-emerald-900/30',
    ghost:
      'text-[#E7DBEF] hover:text-[#F5EBFA] hover:bg-[#6E3482]/20',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-[#F5EBFA]" />
      ) : (
        Icon && <Icon className="w-4 h-4" />
      )}
      {children}
    </button>
  );
};

export default Button;
