
import React, { useEffect, useRef } from 'react';
import { XCircleIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Set focus to the modal container itself or the first focusable element
      // For simplicity, focusing the container allows screen readers to announce modal role.
      modalRef.current.focus(); 
    }
  }, [isOpen]);


  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
        role="dialog" 
        aria-modal="true"
        aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        tabIndex={-1} // Make the div focusable
        className={`relative w-full mx-auto my-6 ${sizeClasses[size]} p-4 md:p-0 outline-none`}
      >
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-2xl outline-none focus:outline-none max-h-[90vh]">
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-solid border-gray-200 rounded-t">
            <h3 id="modal-title" className="text-2xl font-semibold text-gray-800">{title}</h3>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-gray-600 hover:text-gray-900 float-right text-3xl leading-none font-semibold outline-none focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full"
              onClick={onClose}
              aria-label="Close modal"
            >
              <XCircleIcon className="w-7 h-7" />
            </button>
          </div>
          {/* Body */}
          <div className="relative p-6 flex-auto overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
