import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const { isDark } = useTheme();

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
          {label} {required && <span className="text-orange-500">*</span>}
        </label>
      )}
      <div className="relative rounded-2xl shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`block w-full rounded-2xl border text-sm transition-all duration-150 py-2.5 ${
            Icon ? 'pl-10' : 'pl-4'
          } pr-4 ${
            error
              ? 'border-rose-500 text-rose-400 placeholder-rose-300'
              : isDark
              ? 'border-white/10 bg-[#101115] text-white placeholder-slate-500 focus:border-orange-500'
              : 'border-black/10 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-orange-500'
          } disabled:opacity-50`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
};

export default Input;
