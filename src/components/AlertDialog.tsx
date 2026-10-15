import React from 'react';

interface AlertDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({ isOpen, title, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="alert-card" onClick={e => e.stopPropagation()}>
        <h3 className="alert-title">{title}</h3>
        <p className="alert-message">{message}</p>
        <div className="alert-action">
          <button className="btn btn-primary" onClick={onClose} style={{ padding: '8px 20px' }}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
