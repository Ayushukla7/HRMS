import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-[#090a0f]/80 backdrop-blur-md transition-opacity"
          onClick={onClose}
        />

        <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

        {/* Modal Panel */}
        <div
          className={`inline-block w-full ${maxWidth} p-6 my-8 text-left align-middle bg-[#121319] rounded-3xl shadow-2xl transform transition-all relative border border-white/[0.09] text-slate-100 backdrop-blur-xl`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/[0.08]">
            <h3 className="text-base font-bold text-white font-sans">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[75vh] overflow-y-auto pr-1 text-slate-200">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
