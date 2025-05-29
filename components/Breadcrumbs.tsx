
import React from 'react';
import { BreadcrumbItem, ActiveView } from '../types';
import { ChevronRightIcon, HomeIcon } from './icons';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (view: ActiveView) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-2">
        <li>
          <div>
            <button
              onClick={() => items[0].view ? onNavigate(items[0].view) : items[0].onClick?.()}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500 rounded-sm"
            >
              <HomeIcon className="flex-shrink-0 h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </button>
          </div>
        </li>
        {items.slice(1).map((item, index) => (
          <li key={item.label}>
            <div className="flex items-center">
              <ChevronRightIcon className="flex-shrink-0 h-5 w-5 text-gray-400" aria-hidden="true" />
              {item.view ? (
                <button
                  onClick={() => onNavigate(item.view!)}
                  className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500 rounded-sm"
                  aria-current={index === items.length - 2 ? 'page' : undefined}
                >
                  {item.label}
                </button>
              ) : (
                 <span 
                    className="ml-2 text-sm font-medium text-gray-700"
                    aria-current={index === items.length - 2 ? 'page' : undefined}
                  >
                    {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};
