import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl'
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-charcoal/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center text-center sm:p-4">
        <div 
          className={`relative transform overflow-hidden rounded-none bg-white text-left shadow-dropdown transition-all w-full ${maxWidthClass} h-[100dvh] border-0 sm:h-auto sm:max-h-[92vh] sm:my-8 sm:rounded-2xl sm:border sm:border-warmGrey animate-in zoom-in-95 duration-200`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-warmGrey/60 bg-sand-50/95 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-4">
            <div className="min-w-0 pr-3">
              <h3 className="truncate text-base font-bold text-charcoal sm:text-lg">{title}</h3>
              {subtitle && <p className="mt-0.5 truncate text-[11px] text-mutedGrey sm:text-xs">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 p-2 rounded-lg text-mutedGrey hover:text-charcoal hover:bg-warmGrey/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="h-[calc(100dvh-61px)] overflow-y-auto overscroll-contain p-4 sm:h-auto sm:max-h-[calc(92vh-73px)] sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
