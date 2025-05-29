
import React from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from './icons';

interface NotificationBannerProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onDismiss?: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ message, type, onDismiss }) => {
  if (!message) return null;

  let bgColor = 'bg-blue-500';
  let textColor = 'text-white';
  let IconComponent = InformationCircleIcon;

  switch (type) {
    case 'success':
      bgColor = 'bg-green-500';
      IconComponent = CheckCircleIcon;
      break;
    case 'error':
      bgColor = 'bg-red-500';
      IconComponent = XCircleIcon;
      break;
    case 'warning':
      bgColor = 'bg-yellow-500';
      textColor = 'text-yellow-800';
      IconComponent = ExclamationCircleIcon;
      break;
    case 'info':
      bgColor = 'bg-sky-500';
      IconComponent = InformationCircleIcon;
      break;
  }

  return (
    <div className={`fixed top-5 right-5 p-4 rounded-md shadow-lg ${bgColor} ${textColor} flex items-center z-50 transition-opacity duration-300 animate-fadeIn`}>
      <IconComponent className="w-6 h-6 mr-3 flex-shrink-0" />
      <span className="flex-grow">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className={`ml-4 p-1 rounded-full hover:bg-white/20 focus:outline-none`}>
          <XCircleIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
