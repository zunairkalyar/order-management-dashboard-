
import React from 'react';
import { APP_NAME } from '../constants';
import { 
    ChartBarIcon, DocumentTextIcon, PaperAirplaneIcon, CubeTransparentIcon, 
    SimpleTruckIcon, CheckCircleIcon, XCircleIcon, PlusIcon, PencilIcon, 
    Cog6ToothIcon, MagnifyingGlassIcon, PencilRulerIcon, ArchiveBoxArrowDownIcon,
    InformationCircleIcon, EyeIcon, TrashIcon, LightBulbIcon, QuestionMarkCircleIcon, ShieldCheckIcon, StarIcon,
    UsersIcon, ClipboardDocumentCheckIcon, FunnelIcon, TableCellsIcon, ArchiveBoxIcon as RealArchiveIcon, DownloadIcon,
    DocumentTextIcon as TemplateIcon // Using DocumentTextIcon for templates
} from './icons';

const FeatureSection: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="mb-8 p-6 bg-white rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
    <h2 className="text-2xl font-semibold text-purple-700 mb-4 flex items-center">
      {icon && <span className="mr-3 text-purple-600">{icon}</span>}
      {title}
    </h2>
    <div className="space-y-3 text-gray-700 leading-relaxed">
      {children}
    </div>
  </div>
);

const SubFeature: React.FC<{ title: React.ReactNode; children: React.ReactNode }> = ({ title, children }) => (
  <div className="ml-4 pl-4 border-l-2 border-purple-200 py-2">
    <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
    <div className="text-sm text-gray-600 space-y-1">
      {children}
    </div>
  </div>
);

export const AboutAppView: React.FC = () => {
  const appVersion = "1.2.0"; 
  const lastUpdatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="p-4 sm:p-6 bg-gray-50 rounded-xl max-h-[calc(100vh-80px)] overflow-y-auto">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-purple-800 mb-2 flex items-center justify-center">
          <InformationCircleIcon className="w-10 h-10 mr-3 text-purple-700" /> About {APP_NAME}
        </h1>
        <p className="text-lg text-gray-600">
          A comprehensive guide to understanding and utilizing the features of this order management dashboard.
        </p>
      </header>

      <FeatureSection title="Introduction" icon={<StarIcon className="w-7 h-7" />}>
        <p>
          The <strong>{APP_NAME}</strong> is a React-based web application designed to help e-commerce businesses (particularly in a Pakistani context) manage customer orders efficiently. It simulates the entire order lifecycle, from creation to delivery, including notifications and TCS courier tracking, all based on customizable message templates.
        </p>
        <p>
          Key benefits include streamlined order processing and improved customer communication through timely updates (mocked WhatsApp messages) using pre-defined and editable templates. This version introduces foundational elements for bulk actions, advanced filtering, data export, customer management, user preferences, and audit trails.
        </p>
      </FeatureSection>

      <FeatureSection title="Quick Start Guide" icon={<StarIcon className="w-7 h-7" />}>
        <ol className="list-decimal list-inside space-y-2">
          <li><strong>Explore the Dashboard:</strong> Get an overview of current order statuses and key metrics.</li>
          <li><strong>Create a New Order:</strong> Click the <PlusIcon className="w-4 h-4 inline-block mx-1"/> "Create New Order" button in the sidebar. Fill in the details and see an initial notification being prepared using a template.</li>
          <li><strong>Process an Order:</strong> Navigate to "Order Created". Click the <PaperAirplaneIcon className="w-4 h-4 inline-block mx-1"/> (Process Order) icon to prepare and (simulate) send a message based on a template.</li>
          <li><strong>Try Bulk Actions:</strong> In "Categorized Orders," select multiple orders using checkboxes. A toolbar will appear with options like "Dispatch," "Send Notification," or "Archive." (Currently mocked).</li>
          <li><strong>Filter Orders:</strong> Use the <FunnelIcon className="w-4 h-4 inline-block mx-1"/> dropdowns above order tables to filter by "App Status" or "Payment Method."</li>
          <li><strong>Export Data:</strong> Go to "Full Order Data Table," click the <DownloadIcon className="w-4 h-4 inline-block mx-1"/> "Export to CSV" button.</li>
          <li><strong>Customize Columns:</strong> In "Full Order Data Table," use the <TableCellsIcon className="w-4 h-4 inline-block mx-1"/> "Customize Columns" button to show/hide columns.</li>
          <li><strong>Customize Settings:</strong>
            <ul className="list-disc list-inside ml-6 mt-1">
              <li>Visit <Cog6ToothIcon className="w-4 h-4 inline-block mr-1"/> "App Settings" to adjust polling intervals or payment details.</li>
              <li>Go to <PencilRulerIcon className="w-4 h-4 inline-block mr-1"/> "Message Templates" to customize automated messages.</li>
            </ul>
          </li>
        </ol>
      </FeatureSection>

      <FeatureSection title="Core Features" icon={<ChartBarIcon className="w-7 h-7" />}>
        <SubFeature title="Dashboard Overview">
          <p>Provides a quick snapshot of your order statistics and recent activity. Metrics now include "Archived Orders."</p>
        </SubFeature>

        <SubFeature title="Order Management">
            <p>Central hub for all order-related activities. Includes creating, viewing details (<EyeIcon className="w-4 h-4 inline-block ml-1"/>), editing (<PencilIcon className="w-4 h-4 inline-block ml-1"/>), and cancelling (<TrashIcon className="w-4 h-4 inline-block ml-1"/>) orders.</p>
            <p><strong>Bulk Actions:</strong> Select multiple orders in tables (like "Categorized Orders") to perform actions like Dispatch, Send Batch Notification, or Archive (mocked functionality). A toolbar appears when items are selected.</p>
        </SubFeature>
        
        <SubFeature title="Order Status Views">
            <p>Dedicated views under "Order Status from Store" and "Order Status from Courier Service" track orders at different lifecycle stages. Includes an "Archived Orders" <RealArchiveIcon className="w-4 h-4 inline-block mx-1"/> view. A "Change Status" button in the bulk action toolbar allows manual status updates for selected orders.</p>
        </SubFeature>

        <SubFeature title={<>Notifications & Messaging <TemplateIcon className="w-4 h-4 inline-block ml-1"/> </>}>
            <p>Simulates sending WhatsApp messages using customizable Roman Urdu templates. You can edit these templates in the "Message Templates" settings. Message History in Order Details now includes an 'actor' field (e.g., "System", "User: Action", "User: Template Message") for better context.</p>
        </SubFeature>
        
        <SubFeature title="TCS Tracking Simulation">
            <p>Simulates courier tracking for orders dispatched via TCS. The Message History for TCS updates now also logs the 'actor' as "System: TCS Polling."</p>
        </SubFeature>

        <SubFeature title={<>Search & Advanced Filtering <MagnifyingGlassIcon className="w-4 h-4 inline-block ml-1"/> <FunnelIcon className="w-4 h-4 inline-block ml-1"/></>}>
          <p>Efficiently find and organize orders.</p>
          <ul className="list-disc list-inside ml-4">
            <li><strong>Global Search:</strong> Filters orders by various fields.</li>
            <li><strong>Table Sorting:</strong> Most columns are sortable.</li>
            <li><strong>Advanced Filters (Basic):</strong> Dropdown filters for "Application Status" and "Payment Method" are available above order tables. (Future: Date ranges, saved filters).</li>
          </ul>
        </SubFeature>

        <SubFeature title={<>Data Export <DownloadIcon className="w-4 h-4 inline-block ml-1"/> </>}>
           <p><strong>CSV Export:</strong> The "Full Order Data Table" now has an "Export to CSV" button to download the currently displayed (filtered and sorted) data.</p>
        </SubFeature>

        <SubFeature title={<>Customer Management (Placeholder) <UsersIcon className="w-4 h-4 inline-block ml-1"/> </>}>
           <p>A "Customers" navigation item leads to a placeholder view. Future development will allow viewing aggregated customer data, order history, etc.</p>
        </SubFeature>
        
        <SubFeature title={<>Audit Trail (Enhanced History & Placeholder) <ClipboardDocumentCheckIcon className="w-4 h-4 inline-block ml-1"/> </>}>
           <p>Message History entries in Order Details are now more descriptive with an 'actor' field. A new "Audit Trail" navigation item leads to a placeholder view for a future system-wide log.</p>
        </SubFeature>

      </FeatureSection>

      <FeatureSection title="Settings & Configuration" icon={<Cog6ToothIcon className="w-7 h-7" />}>
        <SubFeature title="App Settings, WhatsApp API Configuration, Custom Message Templates">
          <p>These sections allow customization of application behavior, API details, and message content. Settings are stored in local browser storage.</p>
        </SubFeature>
         <SubFeature title={<>User Preferences (Column Visibility) <TableCellsIcon className="w-4 h-4 inline-block ml-1"/> </>}>
           <p>In the "Full Order Data Table," users can customize which columns are visible via a "Customize Columns" dropdown. These preferences are saved in local browser storage.</p>
        </SubFeature>
      </FeatureSection>
      
      <FeatureSection title="Data Persistence & Local Storage" icon={<ShieldCheckIcon className="w-7 h-7" />}>
        <p>This application is a demo and handles data as follows:</p>
        <ul className="list-disc list-inside ml-4">
            <li><strong>Order Data:</strong> Managed in-memory (resets on hard refresh or "Reset Mock Data").</li>
            <li><strong>Application Settings & Preferences:</strong> Configurations for App Settings, WhatsApp API, Custom Messages, and Table Column Visibility are stored in your browser's <strong>local storage</strong>.</li>
        </ul>
      </FeatureSection>

      <FeatureSection title="Troubleshooting & FAQ" icon={<QuestionMarkCircleIcon className="w-7 h-7" />}>
        <SubFeature title="Messages are not being prepared or sent.">
          <p>Ensure the order is in a state that expects a message (e.g., "Pending" message status). Check template configurations in "Message Templates" settings. Review the browser console for any errors.</p>
        </SubFeature>
        <SubFeature title="My settings (WhatsApp, App, Templates, Column choices) are gone or reset.">
          <p>Settings are stored in local storage. They might be cleared if you cleared browser data, used "Clear All Local Settings," or are in incognito mode.</p>
        </SubFeature>
      </FeatureSection>
      
      <FeatureSection title="Accessibility Note" icon={<LightBulbIcon className="w-7 h-7" />}>
        <p>
            This application aims to adhere to web accessibility best practices, including semantic HTML, ARIA attributes, keyboard navigability, and color contrast considerations.
        </p>
      </FeatureSection>

      <FeatureSection title="Technology Stack">
        <ul className="list-disc list-inside ml-4">
            <li><strong>Frontend:</strong> React with TypeScript.</li>
            <li><strong>Styling:</strong> Tailwind CSS.</li>
            <li><strong>Charting:</strong> Chart.js with <code>react-chartjs-2</code>.</li>
        </ul>
      </FeatureSection>

      <footer className="mt-12 text-center text-sm text-gray-500 border-t border-gray-200 pt-6">
        <p>Version: {appVersion} | Last Updated: {lastUpdatedDate}</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} {APP_NAME}. All features are for demonstration and development purposes.</p>
      </footer>
    </div>
  );
};