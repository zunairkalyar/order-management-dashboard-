import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { OrderAppStatus, ActiveView } from '../types';
import { WrenchScrewdriverIcon } from './icons';

interface ChangeStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newStatus: OrderAppStatus) => void;
  selectedOrderCount: number;
  currentViewContext: ActiveView;
}

// Helper to get relevant next statuses based on current view context
const getAvailableStatusTransitions = (currentView: ActiveView): OrderAppStatus[] => {
    const allStatuses = Object.values(OrderAppStatus).filter(s => s !== OrderAppStatus.UNKNOWN && s !== OrderAppStatus.ARCHIVED); // Exclude UNKNOWN and ARCHIVED for direct selection here
    
    switch (currentView) {
        case 'STORE_ORDER_CREATED':
            return [OrderAppStatus.PROCESSING, OrderAppStatus.CANCELLED];
        case 'STORE_ORDER_CONFIRMED':
            return [OrderAppStatus.DISPATCHED, OrderAppStatus.CANCELLED];
        case 'STORE_ORDER_DISPATCHED_FROM_STORE':
            return [OrderAppStatus.IN_TRANSIT, OrderAppStatus.OUT_FOR_DELIVERY, OrderAppStatus.ADDRESS_ISSUE, OrderAppStatus.DELIVERED, OrderAppStatus.CANCELLED];
        
        case 'COURIER_SHIPMENT_PICKED_UP':
        case 'COURIER_IN_TRANSIT':
            return [OrderAppStatus.IN_TRANSIT, OrderAppStatus.OUT_FOR_DELIVERY, OrderAppStatus.ADDRESS_ISSUE, OrderAppStatus.DELIVERED, OrderAppStatus.CANCELLED];
        
        case 'COURIER_OUT_FOR_DELIVERY':
            return [OrderAppStatus.DELIVERED, OrderAppStatus.ADDRESS_ISSUE, OrderAppStatus.CANCELLED]; // e.g., if delivery fails and returns
        
        case 'COURIER_RECIPIENT_PREMISES_CLOSED':
        case 'COURIER_ADDRESS_ISSUE_BY_COURIER':
            return [OrderAppStatus.OUT_FOR_DELIVERY, OrderAppStatus.DELIVERED, OrderAppStatus.CANCELLED]; // After issue resolution, might go out again or get delivered or cancelled
        
        case 'STORE_ORDER_CANCELLED':
        case 'COURIER_DELIVERED_BY_COURIER':
             return []; // Typically no further status changes from these final states via this modal

        // For general views, offer more comprehensive options, excluding current or final states
        case 'CATEGORIZED_ORDER_VIEW':
        case 'COMPREHENSIVE_DATA_VIEW':
             return allStatuses.filter(s => s !== OrderAppStatus.DELIVERED && s !== OrderAppStatus.CANCELLED); // Broad changes allowed

        default:
            return allStatuses; // Default to all non-final statuses if view context is not specific enough
    }
};


export const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedOrderCount,
  currentViewContext,
}) => {
  const [selectedNewStatus, setSelectedNewStatus] = useState<OrderAppStatus | ''>('');
  const [availableStatuses, setAvailableStatuses] = useState<OrderAppStatus[]>([]);

  useEffect(() => {
    if (isOpen) {
      const statuses = getAvailableStatusTransitions(currentViewContext);
      setAvailableStatuses(statuses);
      setSelectedNewStatus(statuses.length > 0 ? statuses[0] : ''); // Default to first available or empty
    }
  }, [isOpen, currentViewContext]);

  const handleConfirmClick = () => {
    if (selectedNewStatus) {
      onConfirm(selectedNewStatus);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Order Status" size="md">
      <div className="space-y-6">
        <p className="text-sm text-gray-700">
          You are about to change the status for{' '}
          <span className="font-semibold text-purple-600">{selectedOrderCount}</span> order(s).
        </p>
        
        <div>
          <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 mb-1">
            Select New Status:
          </label>
          <select
            id="newStatus"
            name="newStatus"
            value={selectedNewStatus}
            onChange={(e) => setSelectedNewStatus(e.target.value as OrderAppStatus)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            disabled={availableStatuses.length === 0}
          >
            {availableStatuses.length > 0 ? (
                availableStatuses.map((status) => (
                    <option key={status} value={status}>
                    {status}
                    </option>
                ))
            ) : (
                <option value="" disabled>No further statuses applicable from this view.</option>
            )}
          </select>
        </div>

        {availableStatuses.length === 0 && (
            <p className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded-md">
                Orders in the current view or selected state typically don't have further manual status changes via this action (e.g., already Cancelled or Delivered).
            </p>
        )}

        <div className="flex justify-end items-center space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={!selectedNewStatus || availableStatuses.length === 0}
            className="px-6 py-2 bg-purple-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
            Confirm Status Change
          </button>
        </div>
      </div>
    </Modal>
  );
};