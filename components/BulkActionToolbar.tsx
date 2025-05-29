import React from 'react';
import { SimpleTruckIcon, PaperAirplaneIcon, ArchiveBoxIcon, WrenchScrewdriverIcon } from './icons';

interface BulkActionToolbarProps {
  selectedCount: number;
  onDispatch?: () => void; 
  onSendNotification?: () => void;
  onArchive?: () => void; 
  onChangeStatus?: () => void; // New prop
}

export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({ 
    selectedCount, 
    onDispatch,
    onSendNotification,
    onArchive,
    onChangeStatus // New prop
}) => {
  if (selectedCount === 0) {
    return null;
  }

  const baseButtonClass = "px-3 py-2 text-xs font-medium text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 flex items-center transition-all duration-200 ease-in-out hover:shadow-lg hover:brightness-105 active:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg shadow-sm flex items-center justify-between">
      <span className="text-sm font-medium text-purple-700">
        {selectedCount} order{selectedCount > 1 ? 's' : ''} selected
      </span>
      <div className="flex items-center space-x-2">
        {onChangeStatus && (
            <button
            onClick={onChangeStatus}
            className={`${baseButtonClass} bg-orange-500 hover:bg-orange-600 focus:ring-orange-400`}
            title="Change status of selected orders"
            >
            <WrenchScrewdriverIcon className="w-4 h-4 mr-1.5" /> Change Status
            </button>
        )}
        {onDispatch && (
            <button
            onClick={onDispatch}
            className={`${baseButtonClass} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`}
            title="Mark selected as Dispatched"
            >
            <SimpleTruckIcon className="w-4 h-4 mr-1.5" /> Dispatch
            </button>
        )}
        {onSendNotification && (
            <button
            onClick={onSendNotification}
            className={`${baseButtonClass} bg-green-600 hover:bg-green-700 focus:ring-green-500`}
            title="Send batch notification to selected"
            >
            <PaperAirplaneIcon className="w-4 h-4 mr-1.5" /> Send Notification
            </button>
        )}
        {onArchive && (
            <button
            onClick={onArchive}
            className={`${baseButtonClass} bg-slate-500 hover:bg-slate-600 focus:ring-slate-400`}
            title="Archive selected orders"
            >
            <ArchiveBoxIcon className="w-4 h-4 mr-1.5" /> Archive
            </button>
        )}
      </div>
    </div>
  );
};