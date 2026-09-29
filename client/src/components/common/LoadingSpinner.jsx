import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-slate-500">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-3" />
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
