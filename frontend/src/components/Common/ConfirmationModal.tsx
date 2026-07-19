import React from 'react';
import { FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info' | 'success';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'info',
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400">
            <FiAlertTriangle className="h-6 w-6" />
          </div>
        );
      case 'warning':
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <FiAlertTriangle className="h-6 w-6" />
          </div>
        );
      case 'success':
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400">
            <FiCheckCircle className="h-6 w-6" />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <FiInfo className="h-6 w-6" />
          </div>
        );
    }
  };

  const getConfirmButtonStyles = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/20';
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-500/20';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500/20';
      case 'info':
      default:
        return 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 transition-all">
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in p-6">
        
        {/* Close Button */}
        <button 
          onClick={onCancel} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Close dialog"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="text-center mt-3">
          {getIcon()}
          
          <h3 className="mt-4 text-xl font-bold font-heading text-slate-900 dark:text-white">
            {title}
          </h3>
          
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
            {message}
          </p>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end sm:items-center">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all focus:outline-none"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            className={`w-full sm:w-auto px-5 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-md focus:outline-none focus:ring-2 ${getConfirmButtonStyles()}`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmationModal;
