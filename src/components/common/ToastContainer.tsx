import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-start space-x-3 p-3.5 rounded-xl shadow-dropdown border text-xs font-medium transition-all animate-in slide-in-from-bottom-3 duration-200
              ${isSuccess ? 'bg-white border-sage/40 text-charcoal' : ''}
              ${isError ? 'bg-white border-terracotta/40 text-charcoal' : ''}
              ${isWarning ? 'bg-white border-amber/40 text-charcoal' : ''}
              ${toast.type === 'info' ? 'bg-white border-navy/30 text-charcoal' : ''}
            `}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-sage" />}
              {isError && <XCircle className="w-4 h-4 text-terracotta" />}
              {isWarning && <AlertTriangle className="w-4 h-4 text-amber" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-navy" />}
            </div>

            <div className="flex-1 pr-1 leading-relaxed">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-mutedGrey hover:text-charcoal p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
