
import React from 'react';
import { Order, TCSStatusUpdate, MessageHistoryEntry } from '../types';
import { Modal } from './Modal';
import { TCS_TRACKING_URL_PREFIX } from '../constants';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const DetailItem: React.FC<{ label: string; value?: string | number | null | React.ReactNode }> = ({ label, value }) => (
  <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value || 'N/A'}</dd>
  </div>
);

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, isOpen, onClose }) => {
  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Order Details: ${order.id}`} size="3xl">
      <div className="space-y-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Customer & Order Information</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <DetailItem label="Order ID" value={order.id} />
              <DetailItem label="Customer Name" value={order.customerName} />
              <DetailItem label="Phone Number" value={order.phoneNumber} />
              <DetailItem label="Address" value={`${order.address}, ${order.city}`} />
              <DetailItem label="Order Date" value={new Date(order.orderTimestamp).toLocaleString()} />
              <DetailItem label="Payment Method" value={order.paymentMethod} />
              <DetailItem label="Total Amount" value={`${order.currencySymbol} ${order.price.toFixed(2)}`} />
              <DetailItem label="Delivery Method" value={order.deliveryMethod} />
            </dl>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Items Ordered</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <ul className="divide-y divide-gray-200">
              {order.items.map((item, index) => (
                <li key={index} className="px-4 py-3 sm:px-6 flex justify-between items-center">
                  <span className="text-sm text-gray-800">{item.name}</span>
                  <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Internal Order Status Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Internal Order Status</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <DetailItem label="Application Status" value={order.appStatus} />
              <DetailItem label="Last Message Status" value={order.messageStatus} />
              <DetailItem label="Last Message Sent" value={order.messageSentTimestamp ? new Date(order.messageSentTimestamp).toLocaleString() : 'N/A'} />
            </dl>
          </div>
        </div>

        {/* Courier Tracking Details Section */}
        {(order.trackingNumber || order.latestTCSStatus) && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Courier Tracking Details</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                {order.trackingNumber && (
                  <DetailItem 
                    label="Tracking Number (TCS)" 
                    value={
                      <a href={`${TCS_TRACKING_URL_PREFIX}${order.trackingNumber}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {order.trackingNumber}
                      </a>
                    } 
                  />
                )}
                <DetailItem label="Latest TCS Status" value={order.latestTCSStatus} />
              </dl>
            </div>
          </div>
        )}
        
        {order.messageHistory && order.messageHistory.length > 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Message History</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0 max-h-60 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {order.messageHistory.slice().reverse().map((entry: MessageHistoryEntry, index: number) => (
                  <li key={index} className="px-4 py-3 sm:px-6">
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-800">{entry.type} {entry.actor ? `(${entry.actor.split(':')[0]})` : ''}</p>
                        <p className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleString()}</p>
                    </div>
                    <p className="text-sm text-gray-600 truncate" title={entry.contentSnippet}>{entry.contentSnippet}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {order.tcsStatusHistory && order.tcsStatusHistory.length > 0 && (
           <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">TCS Status Log</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0 max-h-60 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {order.tcsStatusHistory.slice().reverse().map((status: TCSStatusUpdate, index: number) => ( // Show newest first
                  <li key={index} className="px-4 py-3 sm:px-6">
                    <p className="text-sm text-gray-800">{status.fullLog}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
       <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};
