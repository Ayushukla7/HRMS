import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete Record',
  confirmVariant = 'danger',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">{message}</p>
          <div className="flex items-center justify-end gap-2.5">
            <Button variant="secondary" size="sm" onClick={onClose} disabled={loading} className="bg-[#181922] text-slate-300">
              Cancel
            </Button>
            <Button variant={confirmVariant} size="sm" onClick={onConfirm} loading={loading}>
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
