import React from 'react';

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
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-xs font-bold uppercase tracking-wider text-[#E7DBEF] mb-1.5">
          {label} {required && <span className="text-[#A56ABD]">*</span>}
        </label>
      )}
      <div className="relative rounded-2xl shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A56ABD]">
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
          className={`block w-full rounded-2xl border text-xs sm:text-sm transition-all duration-150 py-2.5 ${
            Icon ? 'pl-10' : 'pl-3.5'
          } pr-3.5 ${
            error
              ? 'border-rose-400 bg-rose-950/20 text-rose-200 placeholder-rose-400/60 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500'
              : 'border-[#A56ABD]/30 bg-[#271337] text-[#F5EBFA] placeholder-[#A56ABD]/50 focus:border-[#A56ABD] focus:bg-[#341a49] focus:outline-none focus:ring-1 focus:ring-[#A56ABD]'
          } disabled:bg-[#1c0d28]/60 disabled:text-[#A56ABD]/50`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
};

export default Input;
