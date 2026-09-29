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
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeStyles = {
    xs: 'px-2.5 py-1 text-xs gap-1.5',
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2',
  };

  const variantStyles = {
    primary: 'bg-black text-white hover:bg-neutral-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white shadow-xs',
    accent: 'bg-black text-white hover:bg-neutral-800 dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-700 shadow-xs',
    secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 border border-neutral-300 dark:border-slate-700',
    outline: 'bg-transparent border border-neutral-300 dark:border-slate-700 text-neutral-900 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-slate-800',
    danger: 'bg-neutral-900 text-white hover:bg-black dark:bg-rose-600 dark:text-white dark:hover:bg-rose-700 shadow-xs',
    success: 'bg-black text-white hover:bg-neutral-800 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-700 shadow-xs',
    ghost: 'text-neutral-700 dark:text-slate-400 hover:bg-neutral-100 dark:hover:bg-slate-800 hover:text-black dark:hover:text-slate-100',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        Icon && <Icon className="w-4 h-4" />
      )}
      {children}
    </button>
  );
};

export default Button;
