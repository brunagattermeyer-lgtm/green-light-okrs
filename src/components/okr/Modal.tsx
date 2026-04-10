import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  titleIcon?: React.ReactNode;
  maxWidth?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, titleIcon, maxWidth = '740px', children }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(13,38,1,0.55)' }}
      onClick={onClose}
    >
      <div
        className="bg-okr-su rounded-xl shadow-modal max-h-[85vh] overflow-y-auto"
        style={{ maxWidth, width: '100%' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-okr-bl sticky top-0 bg-okr-su rounded-t-xl z-10">
          <div className="flex items-center gap-2">
            {titleIcon}
            <h2 className="text-lg font-semibold text-okr-dk">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-okr-bg text-okr-mi hover:bg-okr-bl transition-colors text-lg"
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
