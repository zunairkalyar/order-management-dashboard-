
import React, { useState } from 'react';
import { Order, OrderAppStatus, MessageStatus, SortableOrderKeys, FilterCriteria } from '../types';
import { TCS_TRACKING_URL_PREFIX, ALL_DATA_TABLE_COLUMNS } from '../constants';
import { FunnelIcon, TableCellsIcon, DownloadIcon, ChevronDownIcon } from './icons'; // Added ChevronDownIcon

interface AllDataTableProps {
  orders: Order[];
  title: string;
  requestSort?: (key: SortableOrderKeys) => void;
  sortConfig?: { key: SortableOrderKeys | null; direction: 'ascending' | 'descending' } | null;
  selectedOrderIds: Set<string>; // For potential bulk actions
  setSelectedOrderIds: (ids: Set<string>) => void; // For potential bulk actions
  filterCriteria: FilterCriteria;
  setFilterCriteria: (criteria: FilterCriteria) => void;
  visibleColumns: (keyof Order | 'itemsSummary')[];
  setVisibleColumns: (columns: (keyof Order | 'itemsSummary')[]) => void;
  allPossibleColumns: typeof ALL_DATA_TABLE_COLUMNS;
}

const getStatusColor = (status: OrderAppStatus | MessageStatus) => {
  // (Same as in OrderTable.tsx - consider moving to a shared utility if used more)
  switch (status) {
    case OrderAppStatus.PENDING_CONFIRMATION: case MessageStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
    case OrderAppStatus.PROCESSING: case MessageStatus.CUSTOMER_CONFIRMED: return 'bg-blue-100 text-blue-800';
    case OrderAppStatus.DISPATCHED: case OrderAppStatus.IN_TRANSIT: return 'bg-indigo-100 text-indigo-800';
    case OrderAppStatus.OUT_FOR_DELIVERY: return 'bg-purple-100 text-purple-800';
    case OrderAppStatus.ADDRESS_ISSUE: return 'bg-red-100 text-red-800';
    case OrderAppStatus.DELIVERED: case MessageStatus.SENT: case MessageStatus.CONFIRMATION_SENT: case MessageStatus.NOTIFIED: return 'bg-green-100 text-green-800';
    case OrderAppStatus.CANCELLED: return 'bg-gray-200 text-gray-700';
    case OrderAppStatus.ARCHIVED: return 'bg-slate-200 text-slate-700';
    case MessageStatus.ERROR_MISSING_CN: case MessageStatus.ERROR_MISSING_DATA: case MessageStatus.ERROR_SENDING_FAILED: return 'bg-red-200 text-red-900';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const SortableHeader: React.FC<{
  label: string;
  sortKey: SortableOrderKeys;
  requestSort?: (key: SortableOrderKeys) => void;
  sortConfig?: { key: SortableOrderKeys | null; direction: 'ascending' | 'descending' } | null;
  className?: string;
}> = ({ label, sortKey, requestSort, sortConfig, className = "px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap" }) => {
  const isSorted = sortConfig?.key === sortKey;
  const directionIndicator = isSorted ? (sortConfig?.direction === 'ascending' ? '↑' : '↓') : '';
  return (
    <th 
        scope="col" 
        className={`${className} cursor-pointer hover:bg-gray-100`}
        onClick={() => { if (requestSort) requestSort(sortKey);}}
        aria-sort={isSorted ? (sortConfig?.direction === 'ascending' ? 'ascending' : 'descending') : 'none'}
    >
      {label} {directionIndicator}
    </th>
  );
};

const getCellContent = (order: Order, columnKey: keyof Order | 'itemsSummary'): React.ReactNode => {
    if (columnKey === 'itemsSummary') {
      return order.items.map(item => `${item.name} (Qty: ${item.quantity})`).join('; ');
    }
    if (columnKey === 'orderTimestamp' || columnKey === 'messageSentTimestamp') {
      const timestamp = order[columnKey as keyof Order];
      return timestamp ? new Date(timestamp as string).toLocaleDateString('en-CA') : 'N/A';
    }
    if (columnKey === 'price') {
        return `${order.currencySymbol} ${order.price.toFixed(2)}`;
    }
    if (columnKey === 'appStatus' || columnKey === 'messageStatus') {
        const status = order[columnKey as keyof Order] as OrderAppStatus | MessageStatus;
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(status)}`}>{status}</span>;
    }
    if (columnKey === 'trackingNumber' && order.trackingNumber) {
        return <a href={`${TCS_TRACKING_URL_PREFIX}${order.trackingNumber}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">{order.trackingNumber}</a>;
    }
    const value = order[columnKey as keyof Order];
    return value === undefined || value === null ? 'N/A' : String(value);
};


export const AllDataTable: React.FC<AllDataTableProps> = ({ 
    orders, 
    title, 
    requestSort,
    sortConfig,
    selectedOrderIds,
    setSelectedOrderIds,
    filterCriteria,
    setFilterCriteria,
    visibleColumns,
    setVisibleColumns,
    allPossibleColumns
}) => {
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);

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
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilterCriteria({ ...filterCriteria, [name]: value });
  };

  const handleColumnVisibilityChange = (columnKey: keyof Order | 'itemsSummary') => {
    const newVisibleColumns = visibleColumns.includes(columnKey)
      ? visibleColumns.filter(key => key !== columnKey)
      : [...visibleColumns, columnKey];
    setVisibleColumns(newVisibleColumns);
  };

  const exportToCSV = () => {
    const headers = allPossibleColumns.filter(col => visibleColumns.includes(col.key)).map(col => col.label);
    const rows = orders.map(order => {
      return allPossibleColumns
        .filter(col => visibleColumns.includes(col.key))
        .map(col => {
          let cellValue = '';
          if (col.key === 'itemsSummary') {
            cellValue = order.items.map(item => `${item.name} (Qty: ${item.quantity})`).join('; ');
          } else {
            const val = order[col.key as keyof Order];
            if (val instanceof Date) cellValue = val.toLocaleDateString('en-CA');
            else if (typeof val === 'number') cellValue = val.toString();
            else if (typeof val === 'boolean') cellValue = val ? 'Yes' : 'No';
            else cellValue = String(val || '');
          }
          return `"${cellValue.replace(/"/g, '""')}"`; // Escape quotes
        });
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "order_data.csv");
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
  };
  
  const appStatusOptions = Object.values(OrderAppStatus).filter(status => status !== OrderAppStatus.UNKNOWN);
  const paymentMethodOptions = ['COD', 'Easypaisa (Advance)', 'Bank Transfer (Advance)'];


  return (
    <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-0">{title}</h2>
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <div className="relative">
                <button
                    onClick={() => setIsColumnSelectorOpen(!isColumnSelectorOpen)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center"
                >
                    <TableCellsIcon className="w-4 h-4 mr-1.5" /> Customize Columns <ChevronDownIcon className="w-3 h-3 ml-1"/>
                </button>
                {isColumnSelectorOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 py-1">
                    {allPossibleColumns.map(col => (
                        <label key={col.key} className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mr-2"
                            checked={visibleColumns.includes(col.key)}
                            onChange={() => handleColumnVisibilityChange(col.key)}
                        />
                        {col.label}
                        </label>
                    ))}
                    </div>
                )}
            </div>
            <button
                onClick={exportToCSV}
                className="px-3 py-2 border border-green-300 rounded-md shadow-sm text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
            >
               <DownloadIcon className="w-4 h-4 mr-1.5" /> Export to CSV
            </button>
        </div>
      </div>
       {/* Filter UI */}
      <div className="flex items-center space-x-2 text-sm mb-4">
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


      {orders.length === 0 ? (
        <p className="text-gray-500 py-4">No orders to display with current filters.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-3">
                    <input 
                    type="checkbox" 
                    className="form-checkbox h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    checked={selectedOrderIds.size > 0 && selectedOrderIds.size === orders.length && orders.length > 0}
                    onChange={handleSelectAll}
                    disabled={orders.length === 0}
                    aria-label="Select all orders"
                    />
                </th>
                {allPossibleColumns.filter(col => visibleColumns.includes(col.key)).map(col => (
                     <SortableHeader 
                        key={col.key}
                        label={col.label} 
                        sortKey={col.key as SortableOrderKeys} // Cast, ensure keys are valid SortableOrderKeys
                        requestSort={requestSort} 
                        sortConfig={sortConfig} />
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className={`hover:bg-gray-50 transition-colors duration-150 ${selectedOrderIds.has(order.id) ? 'bg-purple-50' : ''}`}>
                  <td className="px-3 py-3">
                    <input 
                        type="checkbox" 
                        className="form-checkbox h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        checked={selectedOrderIds.has(order.id)}
                        onChange={(e) => handleSelectRow(order.id, e.target.checked)}
                        aria-label={`Select order ${order.id}`}
                    />
                  </td>
                  {allPossibleColumns.filter(col => visibleColumns.includes(col.key)).map(colDef => (
                    <td 
                        key={colDef.key} 
                        className="px-3 py-3 whitespace-nowrap text-sm text-gray-700 max-w-[200px] truncate"
                        title={String(getCellContent(order, colDef.key))}
                    >
                      {getCellContent(order, colDef.key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
