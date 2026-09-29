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
    const gradients = [
      'bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white',
      'bg-gradient-to-tr from-emerald-600 to-teal-400 text-white',
      'bg-gradient-to-tr from-purple-600 to-pink-500 text-white',
      'bg-gradient-to-tr from-blue-600 to-indigo-400 text-white',
      'bg-gradient-to-tr from-amber-600 to-yellow-400 text-white',
      'bg-gradient-to-tr from-cyan-600 to-blue-400 text-white',
    ];
    let hash = 0;
    for (let i = 0; i < n.length; i++) {
      hash = n.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  const sizeClasses = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-9 h-9 text-xs font-bold',
    md: 'w-11 h-11 text-sm font-bold',
    lg: 'w-14 h-14 text-base font-bold',
    xl: 'w-18 h-18 text-2xl font-black',
    '2xl': 'w-24 h-24 text-3xl font-black',
  };

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}>
      {src && !imageError ? (
        <img
          src={src}
          alt={name}
          onError={() => setImageError(true)}
          className={`${sizeClasses[size]} rounded-2xl object-cover object-top border border-white/[0.12] shadow-md ring-1 ring-white/[0.05]`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-2xl flex items-center justify-center ${getBgColor(
            name
          )} border border-white/[0.12] shadow-md select-none`}
        >
          {getInitials(name)}
        </div>
      )}
      {indicator && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-[#08090d] ${
            indicator === 'online'
              ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
              : indicator === 'busy'
              ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
              : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
          }`}
        />
      )}
    </div>
  );
};

export default Avatar;
