import React, { useEffect } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 min-w-[280px] bg-white p-4 rounded-xl shadow-2xl border-l-4 ${type === 'success' ? 'border-l-primary' : 'border-l-accent'}`}>
      <div className={`flex items-center justify-center w-6 h-6 rounded-full text-white ${type === 'success' ? 'bg-primary' : 'bg-accent'}`}>
        {type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
      </div>
      <div className="text-sm font-medium text-text-primary">{message}</div>
      <button onClick={onClose} className="ml-auto text-text-muted hover:text-text-primary">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
