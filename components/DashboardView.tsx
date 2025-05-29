
import React from 'react';
import { DashboardMetrics, OrderAppStatus, ActiveView as AppActiveView } from '../types';
import { 
    ChartBarIcon, CheckCircleIcon, CubeTransparentIcon, DocumentTextIcon, ExclamationCircleIcon, 
    InformationCircleIcon, PaperAirplaneIcon, SimpleTruckIcon, XCircleIcon,
    ArrowRightOnRectangleIcon, ArchiveBoxArrowDownIcon, CalendarDaysIcon 
} from './icons';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);


interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string; 
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, onClick }) => (
  <div 
    className={`p-6 rounded-xl shadow-lg flex items-center space-x-4 ${color} text-white transition-all duration-300 hover:shadow-xl hover:scale-105 ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <div className="flex-shrink-0 text-white/80">
      {icon}
    </div>
    <div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm font-medium opacity-90">{title}</p>
    </div>
  </div>
);

interface DashboardViewProps {
  metrics: DashboardMetrics | null;
  onNavigate: (view: AppActiveView) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ metrics, onNavigate }) => {
  if (!metrics) {
    return <div className="text-center py-10 text-gray-500">Loading dashboard data...</div>;
  }

  const orderStatusData = {
    labels: [
      OrderAppStatus.PENDING_CONFIRMATION, 
      OrderAppStatus.PROCESSING, 
      OrderAppStatus.DISPATCHED,
      OrderAppStatus.OUT_FOR_DELIVERY,
      OrderAppStatus.ADDRESS_ISSUE,
      OrderAppStatus.DELIVERED,
      OrderAppStatus.CANCELLED
    ],
    datasets: [
      {
        label: 'Order Count',
        data: [
          metrics.pendingConfirmation,
          metrics.processing,
          metrics.dispatched,
          metrics.outForDelivery,
          metrics.addressIssue,
          metrics.delivered,
          metrics.cancelled
        ],
        backgroundColor: [
          'rgba(250, 204, 21, 0.7)',  // Yellow - Pending Confirmation
          'rgba(59, 130, 246, 0.7)', // Blue - Processing
          'rgba(99, 102, 241, 0.7)', // Indigo - Dispatched
          'rgba(168, 85, 247, 0.7)', // Purple - Out for Delivery
          'rgba(239, 68, 68, 0.7)',  // Red - Address Issue
          'rgba(34, 197, 94, 0.7)', // Green - Delivered
          'rgba(107, 114, 128, 0.7)' // Gray - Cancelled
        ],
        borderColor: [
          'rgba(250, 204, 21, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(99, 102, 241, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(107, 114, 128, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Order Status Overview',
      },
    },
  };

  const ordersLast7DaysData = {
    labels: metrics.ordersCreatedLast7Days?.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
    datasets: [
      {
        label: 'Orders Created',
        data: metrics.ordersCreatedLast7Days?.map(d => d.count) || [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };
  const lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' as const },
        title: { display: true, text: 'Orders Created (Last 7 Days)'}
      },
      scales: { y: { beginAtZero: true, suggestedMax: Math.max(...(metrics.ordersCreatedLast7Days?.map(d => d.count) || [5])) + 2  } } 
  };


  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Order Dashboard</h1>
      
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4 mt-6 pb-2 border-b border-gray-300">Store Order Lifecycle</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <MetricCard title="Total Orders" value={metrics.totalOrders} icon={<DocumentTextIcon className="w-10 h-10" />} color="bg-gradient-to-br from-blue-500 to-blue-700" onClick={() => onNavigate('CATEGORIZED_ORDER_VIEW')}/>
          <MetricCard title="New Order (Pending Confirm)" value={metrics.pendingConfirmation} icon={<PaperAirplaneIcon className="w-10 h-10" />} color="bg-gradient-to-br from-yellow-400 to-yellow-600" onClick={() => onNavigate('NEW_ORDERS')} />
          <MetricCard title="Processing" value={metrics.processing} icon={<CubeTransparentIcon className="w-10 h-10" />} color="bg-gradient-to-br from-sky-500 to-sky-700" onClick={() => onNavigate('PROCESSING_ORDERS')} />
          <MetricCard title="Order Dispatch" value={metrics.dispatched} icon={<SimpleTruckIcon className="w-10 h-10" />} color="bg-gradient-to-br from-indigo-500 to-indigo-700" onClick={() => onNavigate('DISPATCHED_ORDERS')} />
          <MetricCard title="Order Cancelled" value={metrics.cancelled} icon={<XCircleIcon className="w-10 h-10" />} color="bg-gradient-to-br from-gray-500 to-gray-700" onClick={() => onNavigate('CANCELLED_ORDERS')} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4 mt-8 pb-2 border-b border-gray-300">TCS Courier Statuses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <MetricCard title="Shipment Picked Up" value={metrics.shipmentPickedUp} icon={<ArchiveBoxArrowDownIcon className="w-10 h-10" />} color="bg-gradient-to-br from-lime-500 to-lime-700" onClick={() => onNavigate('TCS_TRACKING')} />
          <MetricCard title="Departed From TCS Facility" value={metrics.departedFromFacility} icon={<ArrowRightOnRectangleIcon className="w-10 h-10" />} color="bg-gradient-to-br from-teal-500 to-teal-700" onClick={() => onNavigate('TCS_TRACKING')} />
          <MetricCard title="Scheduled for Next Cycle" value={metrics.scheduledNextCycle} icon={<CalendarDaysIcon className="w-10 h-10" />} color="bg-gradient-to-br from-orange-500 to-orange-700" onClick={() => onNavigate('TCS_TRACKING')} />
          <MetricCard title="Out for Delivery" value={metrics.outForDelivery} icon={<SimpleTruckIcon className="w-10 h-10 transform -scale-x-100" />} color="bg-gradient-to-br from-purple-500 to-purple-700" onClick={() => onNavigate('TCS_TRACKING')} />
          <MetricCard title="Address Issues" value={metrics.addressIssue} icon={<ExclamationCircleIcon className="w-10 h-10" />} color="bg-gradient-to-br from-red-500 to-red-700" onClick={() => onNavigate('TCS_TRACKING')} />
          <MetricCard title="Shipment Delivered" value={metrics.delivered} icon={<CheckCircleIcon className="w-10 h-10" />} color="bg-gradient-to-br from-green-500 to-green-700" onClick={() => onNavigate('DELIVERED_ORDERS')} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-lg h-96">
          <Bar options={chartOptions} data={orderStatusData} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg h-96">
          {metrics.ordersCreatedLast7Days && metrics.ordersCreatedLast7Days.length > 0 ? (
            <Line options={lineChartOptions} data={ordersLast7DaysData} />
          ) : (
            <p className="text-gray-500 text-center pt-10">No data for 'Orders Created Last 7 Days' chart.</p>
          )}
        </div>
      </div>
    </div>
  );
};
