import React, { useState } from 'react';

const Avatar = ({ src, name = 'User', size = 'md', className = '', indicator }) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (n) => {
    if (!n) return 'U';
    const parts = n.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getBgColor = (n) => {
    const colors = [
      'bg-slate-700 text-slate-100',
      'bg-indigo-600 text-white',
      'bg-blue-600 text-white',
      'bg-emerald-600 text-white',
      'bg-teal-600 text-white',
      'bg-cyan-600 text-white',
      'bg-amber-600 text-white',
      'bg-violet-600 text-white',
    ];
    let hash = 0;
    for (let i = 0; i < n.length; i++) {
      hash = n.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-12 h-12 text-base font-bold',
    xl: 'w-16 h-16 text-xl font-bold',
    '2xl': 'w-24 h-24 text-3xl font-black',
  };

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}>
      {src && !imageError ? (
        <img
          src={src}
          alt={name}
          onError={() => setImageError(true)}
          className={`${sizeClasses[size]} rounded-lg object-cover border border-slate-200 dark:border-slate-800 shadow-sm`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-lg flex items-center justify-center ${getBgColor(
            name
          )} border border-slate-200 dark:border-slate-800 shadow-sm select-none`}
        >
          {getInitials(name)}
        </div>
      )}
      {indicator && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
            indicator === 'online'
              ? 'bg-emerald-500'
              : indicator === 'busy'
              ? 'bg-rose-500'
              : 'bg-amber-500'
          }`}
        />
      )}
    </div>
  );
};

export default Avatar;
