
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string; // Tailwind color class e.g. 'text-blue-500'
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'text-blue-600', text }) => {
  let spinnerSize = 'w-8 h-8';
  if (size === 'sm') spinnerSize = 'w-5 h-5';
  if (size === 'lg') spinnerSize = 'w-12 h-12';

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div
        className={`animate-spin rounded-full ${spinnerSize} border-t-2 border-b-2 border-r-2 border-transparent ${color}`}
        style={{ borderTopColor: 'currentColor', borderRightColor: 'currentColor', borderBottomColor: 'currentColor' }} // Ensure Tailwind color applies
      ></div>
      {text && <p className={`text-sm ${color}`}>{text}</p>}
    </div>
  );
};
