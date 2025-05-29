
import React from 'react';
import { UsersIcon } from './icons';

export const CustomerListView: React.FC = () => {
  // In a real application, this view would fetch and display customer data.
  // Customers could be aggregated from orders.
  // Features might include:
  // - List of unique customers (Name, Phone, Total Orders, Total Spent)
  // - Clicking a customer navigates to a CustomerDetailView
  // - Search/filter customers

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <UsersIcon className="w-7 h-7 mr-3 text-purple-600" />
        Customer Management
      </h2>
      <div className="text-center py-10 bg-gray-50 rounded-lg">
        <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-700">Customer List View</h3>
        <p className="text-gray-500 mt-2">
          This section is a placeholder for customer relationship management features.
        </p>
        <p className="text-sm text-gray-400 mt-4">
          Future enhancements could include: viewing customer order history, contact details, and notes.
        </p>
      </div>
    </div>
  );
};
