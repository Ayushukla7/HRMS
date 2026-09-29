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
        <label htmlFor={name} className="block text-xs font-semibold text-neutral-800 mb-1.5">
          {label} {required && <span className="text-black">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
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
          className={`block w-full rounded-lg border text-sm transition-colors duration-150 py-2 ${
            Icon ? 'pl-9' : 'pl-3'
          } pr-3 ${
            error
              ? 'border-neutral-900 text-neutral-900 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black'
              : 'border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black'
          } disabled:bg-neutral-100 disabled:text-neutral-500`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-neutral-900 font-medium">{error}</p>}
    </div>
  );
};

export default Input;
