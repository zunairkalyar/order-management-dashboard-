
import React, { useState, useEffect, useRef } from 'react';
import { Order, OrderAppStatus, MessageStatus, SortableOrderKeys, FilterCriteria, MessageTypeKey } from '../types';
import { EyeIcon, PaperAirplaneIcon, PencilIcon, DocumentTextIcon as TemplateIcon, TrashIcon, CheckCircleIcon as ConfirmIcon, EllipsisVerticalIcon, FunnelIcon } from './icons'; // Changed SparklesIcon to TemplateIcon
import { LoadingSpinner } from './LoadingSpinner'; 
import { TCS_TRACKING_URL_PREFIX, STATUS_KEYWORDS } from '../constants';

interface OrderTableProps {
  orders: Order[];
  title: string;
  onViewOrder: (order: Order) => void;
  onProcessOrder: (order: Order, messageContent?: string, messageTypeKey?: MessageTypeKey) => void; 
  onPrepareTemplateMessage: (order: Order, messageTypeKey: MessageTypeKey) => void; 
  onEditOrder: (order: Order) => void; 
  onCancelOrder?: (order: Order) => void; 
  onSimulateConfirmation?: (order: Order) => void;
  requestSort?: (key: SortableOrderKeys) => void;
  sortConfig?: { key: SortableOrderKeys | null; direction: 'ascending' | 'descending' } | null;
  processingOrderId?: string | null;
  selectedOrderIds: Set<string>;
  setSelectedOrderIds: (ids: Set<string>) => void;
  filterCriteria: FilterCriteria;
  setFilterCriteria: (criteria: FilterCriteria) => void;
}

const getStatusColor = (status: OrderAppStatus | MessageStatus) => {
  switch (status) {
    case OrderAppStatus.PENDING_CONFIRMATION:
    case MessageStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case OrderAppStatus.PROCESSING:
    case MessageStatus.CUSTOMER_CONFIRMED:
      return 'bg-blue-100 text-blue-800';
    case OrderAppStatus.DISPATCHED:
    case OrderAppStatus.IN_TRANSIT:
      return 'bg-indigo-100 text-indigo-800';
    case OrderAppStatus.OUT_FOR_DELIVERY:
      return 'bg-purple-100 text-purple-800';
    case OrderAppStatus.ADDRESS_ISSUE:
      return 'bg-red-100 text-red-800';
    case OrderAppStatus.DELIVERED:
    case MessageStatus.SENT:
    case MessageStatus.CONFIRMATION_SENT:
    case MessageStatus.NOTIFIED:
      return 'bg-green-100 text-green-800';
    case OrderAppStatus.CANCELLED:
      return 'bg-gray-200 text-gray-700';
    case OrderAppStatus.ARCHIVED:
      return 'bg-slate-200 text-slate-700';
    case MessageStatus.ERROR_MISSING_CN:
    case MessageStatus.ERROR_MISSING_DATA:
    case MessageStatus.ERROR_SENDING_FAILED:
        return 'bg-red-200 text-red-900';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const SortableHeader: React.FC<{
  label: string;
  sortKey: SortableOrderKeys;
  requestSort?: (key: SortableOrderKeys) => void;
  sortConfig?: { key: SortableOrderKeys | null; direction: 'ascending' | 'descending' } | null;
}> = ({ label, sortKey, requestSort, sortConfig }) => {
  const isSorted = sortConfig?.key === sortKey;
  const directionIndicator = isSorted ? (sortConfig?.direction === 'ascending' ? '↑' : '↓') : '';
  return (
    <th 
        scope="col" 
        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
        onClick={() => requestSort && requestSort(sortKey)}
    >
      {label} {directionIndicator}
    </th>
  );
};


export const OrderTable: React.FC<OrderTableProps> = ({ 
    orders, 
    title, 
    onViewOrder, 
    onProcessOrder, 
    onPrepareTemplateMessage, 
    onEditOrder, 
    onCancelOrder,
    onSimulateConfirmation,
    requestSort,
    sortConfig,
    processingOrderId,
    selectedOrderIds,
    setSelectedOrderIds,
    filterCriteria,
    setFilterCriteria
}) => {
  const [openActionMenuOrderId, setOpenActionMenuOrderId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrderIds(new Set(orders.map(o => o.id)));
    } else {
      setSelectedOrderIds(new Set());
    }
  };

  const handleSelectRow = (orderId: string, checked: boolean) => {
    const newSelectedIds = new Set(selectedOrderIds);
    if (checked) {
      newSelectedIds.add(orderId);
    } else {
      newSelectedIds.delete(orderId);
    }
    setSelectedOrderIds(newSelectedIds);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenActionMenuOrderId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleActionMenu = (orderId: string) => {
    setOpenActionMenuOrderId(prev => (prev === orderId ? null : orderId));
  };
  
  const handleActionClick = (action: () => void) => {
    action();
    setOpenActionMenuOrderId(null);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilterCriteria({ ...filterCriteria, [name]: value });
  };

  const appStatusOptions = Object.values(OrderAppStatus).filter(status => status !== OrderAppStatus.UNKNOWN);
  const paymentMethodOptions = ['COD', 'Easypaisa (Advance)', 'Bank Transfer (Advance)'];


  const getMessageTypeForPrepare = (order: Order): MessageTypeKey => {
    if (order.appStatus === OrderAppStatus.PENDING_CONFIRMATION && order.messageStatus === MessageStatus.PENDING) return MessageTypeKey.NEW_ORDER_INITIAL;
    if (order.appStatus === OrderAppStatus.PENDING_CONFIRMATION) return MessageTypeKey.ORDER_CONFIRMATION_REMINDER;
    if (order.appStatus === OrderAppStatus.PROCESSING) return MessageTypeKey.ORDER_PROCESSING_CONFIRMED;
    if (order.appStatus === OrderAppStatus.DISPATCHED && order.messageStatus === MessageStatus.PENDING) return MessageTypeKey.ORDER_DISPATCH; // For initial dispatch
    if (order.appStatus === OrderAppStatus.OUT_FOR_DELIVERY) return MessageTypeKey.TCS_OUT_FOR_DELIVERY;
    if (order.appStatus === OrderAppStatus.ADDRESS_ISSUE) {
        if (order.latestTCSStatus?.toLowerCase().includes(STATUS_KEYWORDS.RECIPIENT_PREMISES_CLOSED.toLowerCase())) return MessageTypeKey.COURIER_RECIPIENT_PREMISES_CLOSED;
        return MessageTypeKey.TCS_ADDRESS_NEEDED;
    }
    if (order.appStatus === OrderAppStatus.DELIVERED) return MessageTypeKey.TCS_DELIVERED_THANK_YOU;
    if (order.appStatus === OrderAppStatus.CANCELLED) return MessageTypeKey.ORDER_CANCELLED;
    
    // For other TCS-related PENDING messages when DISPATCHED or IN_TRANSIT
    if (order.trackingNumber && (order.appStatus === OrderAppStatus.DISPATCHED || order.appStatus === OrderAppStatus.IN_TRANSIT)) {
        if (order.latestTCSStatus?.toLowerCase().includes(STATUS_KEYWORDS.BOOKED.toLowerCase()) || order.latestTCSStatus?.toLowerCase().includes('picked up')) {
           return MessageTypeKey.COURIER_SHIPMENT_PICKED_UP;
        } else if (order.appStatus === OrderAppStatus.IN_TRANSIT) {
           return MessageTypeKey.COURIER_IN_TRANSIT_UPDATE;
        }
    }
    return MessageTypeKey.TCS_GENERIC_UPDATE; // Fallback
  };


  return (
    <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6 overflow-x-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-0">{title}</h2>
        <div className="flex items-center space-x-2 text-sm">
            <FunnelIcon className="w-5 h-5 text-gray-500 mr-1"/>
            <select
                name="appStatus"
                value={filterCriteria.appStatus || ''}
                onChange={handleFilterChange}
                className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-xs"
            >
                <option value="">All App Statuses</option>
                {appStatusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </select>
            <select
                name="paymentMethod"
                value={filterCriteria.paymentMethod || ''}
                onChange={handleFilterChange}
                className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-xs"
            >
                <option value="">All Payment Methods</option>
                {paymentMethodOptions.map(method => (
                    <option key={method} value={method}>{method}</option>
                ))}
            </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-500 py-4">No orders match the current filters.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left">
                <input 
                  type="checkbox" 
                  className="form-checkbox h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  checked={selectedOrderIds.size > 0 && selectedOrderIds.size === orders.length}
                  onChange={handleSelectAll}
                  aria-label="Select all orders"
                />
              </th>
              <SortableHeader label="Order ID" sortKey="id" requestSort={requestSort} sortConfig={sortConfig} />
              <SortableHeader label="Customer" sortKey="customerName" requestSort={requestSort} sortConfig={sortConfig} />
              <SortableHeader label="Amount" sortKey="price" requestSort={requestSort} sortConfig={sortConfig} />
              <SortableHeader label="App Status" sortKey="appStatus" requestSort={requestSort} sortConfig={sortConfig} />
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Msg Status</th>
              <SortableHeader label="Tracking #" sortKey="trackingNumber" requestSort={requestSort} sortConfig={sortConfig} />
              <SortableHeader label="City" sortKey="city" requestSort={requestSort} sortConfig={sortConfig} />
              <SortableHeader label="Last Update" sortKey="messageSentTimestamp" requestSort={requestSort} sortConfig={sortConfig} />
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => {
              let showPaperAirplaneButton = false;
              const isErrorStatus = order.messageStatus === MessageStatus.ERROR_MISSING_CN || order.messageStatus === MessageStatus.ERROR_MISSING_DATA;
              const isArchived = order.appStatus === OrderAppStatus.ARCHIVED;

              if (!isErrorStatus && !isArchived) {
                  if (order.appStatus === OrderAppStatus.PENDING_CONFIRMATION) {
                      if (order.messageStatus === MessageStatus.PENDING || order.messageStatus === MessageStatus.SENT) {
                          showPaperAirplaneButton = true;
                      }
                  } else if (order.appStatus === OrderAppStatus.PROCESSING) {
                      if (order.messageStatus === MessageStatus.PENDING || order.messageStatus === MessageStatus.CUSTOMER_CONFIRMED) {
                          showPaperAirplaneButton = true;
                      }
                  } else if (order.appStatus === OrderAppStatus.DISPATCHED) {
                      if (order.messageStatus === MessageStatus.PENDING) { // Covers initial dispatch and pending TCS updates for dispatched orders
                          showPaperAirplaneButton = true;
                      }
                  } else if (order.appStatus === OrderAppStatus.IN_TRANSIT) {
                      if (order.messageStatus === MessageStatus.PENDING) { // Covers pending TCS updates for in-transit orders
                          showPaperAirplaneButton = true;
                      }
                  } else if (order.appStatus === OrderAppStatus.OUT_FOR_DELIVERY && !order.outForDeliveryMsgSent) {
                      showPaperAirplaneButton = true;
                  } else if (order.appStatus === OrderAppStatus.ADDRESS_ISSUE && !order.addressNeededMsgSent) {
                      showPaperAirplaneButton = true;
                  } else if (order.appStatus === OrderAppStatus.DELIVERED && order.messageStatus !== MessageStatus.NOTIFIED && order.messageStatus !== MessageStatus.CUSTOMER_CONFIRMED) {
                      showPaperAirplaneButton = true;
                  } else if (order.appStatus === OrderAppStatus.CANCELLED && order.messageStatus === MessageStatus.PENDING) {
                      showPaperAirplaneButton = true;
                  }
              }
            
              return (
              <tr key={order.id} className={`hover:bg-gray-50 transition-colors duration-150 ${selectedOrderIds.has(order.id) ? 'bg-purple-50' : ''}`}>
                <td className="px-4 py-3">
                  <input 
                    type="checkbox" 
                    className="form-checkbox h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    checked={selectedOrderIds.has(order.id)}
                    onChange={(e) => handleSelectRow(order.id, e.target.checked)}
                    aria-label={`Select order ${order.id}`}
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  <div>{order.customerName}</div>
                  <div className="text-xs text-gray-500">{order.phoneNumber}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.currencySymbol} {order.price.toFixed(2)}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.appStatus)}`}>
                    {order.appStatus}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.messageStatus)}`}>
                    {order.messageStatus}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {order.trackingNumber ? (
                    <a href={`${TCS_TRACKING_URL_PREFIX}${order.trackingNumber}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
                      {order.trackingNumber}
                    </a>
                  ) : 'N/A'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.city}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {order.messageSentTimestamp 
                    ? new Date(order.messageSentTimestamp).toLocaleDateString() 
                    : (order.orderTimestamp ? new Date(order.orderTimestamp).toLocaleDateString() : 'N/A')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-1 relative">
                    <button 
                      onClick={() => onViewOrder(order)} 
                      title="View Details" 
                      aria-label="View Details"
                      className="text-gray-500 hover:text-blue-700 transition-colors p-1 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <EyeIcon className="w-5 h-5" />
                    </button>

                    {processingOrderId === order.id ? (
                        <div className="p-1"><LoadingSpinner size="sm" color="text-green-700" /></div>
                    ) : (
                        showPaperAirplaneButton && (
                        <button 
                            onClick={() => onProcessOrder(order)} 
                            title="Process Order (Send Notification)" 
                            aria-label="Process Order (Send Notification)"
                            className="text-gray-500 hover:text-green-700 transition-colors p-1 rounded-full hover:bg-green-100 focus:outline-none focus:ring-1 focus:ring-green-500">
                        <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    ))}
                    
                    {order.appStatus !== OrderAppStatus.ARCHIVED && (
                      <button 
                        onClick={() => onPrepareTemplateMessage(order, getMessageTypeForPrepare(order))} 
                        title="Prepare Message from Template" 
                        aria-label="Prepare Message from Template"
                        className="text-gray-500 hover:text-purple-700 transition-colors p-1 rounded-full hover:bg-purple-100 focus:outline-none focus:ring-1 focus:ring-purple-500">
                        <TemplateIcon className="w-5 h-5" />
                      </button>
                    )}

                    {order.appStatus !== OrderAppStatus.ARCHIVED && (onEditOrder || onCancelOrder || onSimulateConfirmation) && (
                      <button
                        onClick={() => toggleActionMenu(order.id)}
                        title="More actions"
                        aria-label="More actions"
                        className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      >
                        <EllipsisVerticalIcon className="w-5 h-5" />
                      </button>
                    )}

                    {openActionMenuOrderId === order.id && (
                      <div ref={menuRef} className="absolute right-0 top-8 mt-1 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 py-1">
                        {onEditOrder && order.appStatus !== OrderAppStatus.CANCELLED && order.appStatus !== OrderAppStatus.DELIVERED && order.appStatus !== OrderAppStatus.ARCHIVED && (
                          <button 
                            onClick={() => handleActionClick(() => onEditOrder(order))} 
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
                          >
                            <PencilIcon className="w-4 h-4 mr-2 text-yellow-600" /> Edit Order
                          </button>
                        )}
                        {onCancelOrder && order.appStatus !== OrderAppStatus.CANCELLED && order.appStatus !== OrderAppStatus.DELIVERED && order.appStatus !== OrderAppStatus.ARCHIVED && (
                          <button 
                            onClick={() => handleActionClick(() => onCancelOrder(order))}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
                          >
                            <TrashIcon className="w-4 h-4 mr-2 text-red-600" /> Cancel Order
                          </button>
                        )}
                         {onSimulateConfirmation && order.appStatus === OrderAppStatus.PENDING_CONFIRMATION && (order.messageStatus === MessageStatus.SENT || order.messageStatus === MessageStatus.CONFIRMATION_SENT) && (
                          <button 
                            onClick={() => handleActionClick(() => onSimulateConfirmation(order))} 
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
                          >
                            <ConfirmIcon className="w-4 h-4 mr-2 text-teal-600" /> Confirm Order
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      )}
    </div>
  );
};
