import React from 'react';

/**
 * Handcrafted Human-Centric HR Pulse Logo Component
 * Represents people, human workforce connection, and vital pulse rhythm
 */
const Logo = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`inline-flex items-center justify-center rounded-2xl bg-black text-white p-2 shadow-xs transition-transform duration-200 hover:scale-105 ${dim} ${className}`}
      title="HR Pulse - Human Resource Management"
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-white"
      >
        {/* Central Human Silhouette Head */}
        <circle cx="20" cy="11" r="5" fill="currentColor" />
        
        {/* Human Shoulders & Torso */}
        <path
          d="M10 27C10 21.4772 14.4772 17 20 17C25.5228 17 30 21.4772 30 27V28H10V27Z"
          fill="currentColor"
        />

        {/* Dynamic Human Vitality Pulse Wave Line running through the base */}
        <path
          d="M3 33H12L15 28L18 36L22 25L25 34L28 30L30 33H37"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Small Companion Human Figures (Team Connection) */}
        <circle cx="9" cy="14" r="3" fill="currentColor" opacity="0.85" />
        <path
          d="M3 26C3 22.5 5.5 19 9 19C10.8 19 12.3 19.8 13.3 21.1C12.5 22.8 12 24.8 12 27V28H3V26Z"
          fill="currentColor"
          opacity="0.85"
        />

        <circle cx="31" cy="14" r="3" fill="currentColor" opacity="0.85" />
        <path
          d="M37 26C37 22.5 34.5 19 31 19C29.2 19 27.7 19.8 26.7 21.1C27.5 22.8 28 24.8 28 27V28H37V26Z"
          fill="currentColor"
          opacity="0.85"
        />
      </svg>
    </div>
  );
};

export default Logo;
