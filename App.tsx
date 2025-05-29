
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Order, MessageStatus, OrderAppStatus, OrderType, DashboardMetrics, 
    WhatsAppAPIConfig, ActiveView, AppSettingsConfig, SortableOrderKeys,
    OrderFormData, OrderItem, CustomMessagesConfig, BreadcrumbItem, FilterCriteria,
    ChangeStatusModalContext, MessageTypeKey 
} from './types';
import { OrderTable } from './components/OrderTable';
import { AllDataTable } from './components/AllDataTable';
import { DashboardView } from './components/DashboardView';
import { OrderDetailsModal } from './components/OrderDetailsModal';
import { MessageGenerationModal } from './components/MessageGenerationModal';
import { OrderFormModal } from './components/OrderFormModal';
import { WhatsAppAPISettingsView } from './components/WhatsAppAPISettingsView';
import { AppSettingsView } from './components/AppSettingsView';
import { CustomMessagesSettingsView } from './components/CustomMessagesSettingsView'; 
import { AboutAppView } from './components/AboutAppView';
import { CustomerListView } from './components/CustomerListView'; 
import { AuditTrailView } from './components/AuditTrailView';   
import { NotificationBanner } from './components/NotificationBanner';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Breadcrumbs } from './components/Breadcrumbs'; 
import { BulkActionToolbar } from './components/BulkActionToolbar'; 
import { ChangeStatusModal } from './components/ChangeStatusModal'; 
import * as OrderService from './services/orderMockService';
import * as WhatsAppService from './services/whatsappMockService';
import { 
  DocumentTextIcon, ChartBarIcon, SimpleTruckIcon, CubeTransparentIcon, PaperAirplaneIcon, 
  SparklesIcon, CheckCircleIcon, XCircleIcon, PlusIcon, Cog6ToothIcon, MagnifyingGlassIcon,
  PencilRulerIcon, ArchiveBoxArrowDownIcon, InformationCircleIcon, AdjustmentsHorizontalIcon, 
  RectangleStackIcon, ChevronDownIcon, ChevronRightIcon, HomeIcon, UsersIcon, 
  ClipboardDocumentCheckIcon, FunnelIcon, ArchiveBoxIcon as ArchiveIcon,
  BuildingStorefrontIcon, TruckIcon, WrenchScrewdriverIcon 
} from './components/icons'; 
import { 
    APP_NAME, 
    DEFAULT_APP_SETTINGS as APP_DEFAULTS,
    DEFAULT_CUSTOM_MESSAGES,
    DEFAULT_VISIBLE_COLUMNS, 
    ALL_DATA_TABLE_COLUMNS,
    STATUS_KEYWORDS 
} from './constants';


interface AppNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const DEFAULT_WHATSAPP_CONFIG: WhatsAppAPIConfig = {
  apiUrl: 'https://btn.pushflow.xyz/api/send',
  instanceId: '609ACF283XXXX',
  accessToken: '671f379aa48d0',
};

const DEFAULT_FILTER_CRITERIA: FilterCriteria = {
    appStatus: '',
    paymentMethod: '',
};

function loadJSONFromLocalStorage<T extends object>(key: string, defaultValue: T, itemName: string): T {
  const savedString = localStorage.getItem(key);
  if (savedString) {
    try {
      const parsed = JSON.parse(savedString);
      const result: Partial<T> = {};
      for (const k of Object.keys(defaultValue) as Array<keyof T>) {
        result[k] = parsed[k] !== undefined ? parsed[k] : defaultValue[k];
      }
      return result as T;
    } catch (error) {
      console.warn(`Error parsing ${itemName} from localStorage. Using default values. Error:`, error);
      return defaultValue;
    }
  }
  return defaultValue;
}


const App: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>('DASHBOARD');
  
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);
  const [selectedOrderForMessage, setSelectedOrderForMessage] = useState<Order | null>(null);
  const [targetMessageTypeKeyForModal, setTargetMessageTypeKeyForModal] = useState<MessageTypeKey | null>(null); 

  const [isOrderFormModalOpen, setIsOrderFormModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);

  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [whatsAppApiConfig, setWhatsAppApiConfig] = useState<WhatsAppAPIConfig>(() => 
    loadJSONFromLocalStorage<WhatsAppAPIConfig>('whatsAppApiConfig', DEFAULT_WHATSAPP_CONFIG, 'WhatsApp API Config')
  );

  const [appSettings, setAppSettings] = useState<AppSettingsConfig>(() => 
    loadJSONFromLocalStorage<AppSettingsConfig>('appSettingsConfig', APP_DEFAULTS, 'App Settings')
  );
  
  const [customMessagesConfig, setCustomMessagesConfig] = useState<CustomMessagesConfig>(() =>
    loadJSONFromLocalStorage<CustomMessagesConfig>('customMessagesConfig', DEFAULT_CUSTOM_MESSAGES, 'Custom Messages Config')
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableOrderKeys | null; direction: 'ascending' | 'descending' }>({ key: 'orderTimestamp', direction: 'descending' });
  
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null); 

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['orderStatusStore', 'orderStatusCourier'])); 

  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>(DEFAULT_FILTER_CRITERIA);
  const [visibleColumns, setVisibleColumns] = useState<(keyof Order | 'itemsSummary')[]>(() => {
    const saved = localStorage.getItem('visibleDataTableColumns');
    return saved ? JSON.parse(saved) : DEFAULT_VISIBLE_COLUMNS;
  });

  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [changeStatusModalContext, setChangeStatusModalContext] = useState<ChangeStatusModalContext | null>(null);


  const addNotification = useCallback((message: string, type: AppNotification['type']) => {
    const newNotif = { id: Date.now().toString(), message, type };
    setNotifications(prev => [newNotif, ...prev.slice(0, 2)]); 
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 5000);
  }, []);

  const loadData = useCallback(async (includeArchived = false) => {
    const initialLoad = orders.length === 0 && !['APP_SETTINGS', 'WHATSAPP_API_SETTINGS', 'CUSTOM_MESSAGES_SETTINGS', 'ABOUT_APP', 'CUSTOMER_LIST', 'AUDIT_TRAIL'].includes(activeView);
    if (initialLoad) {
      setIsLoading(true);
    }
    try {
      const ordersPromise = includeArchived ? OrderService.getAllOrdersIncludingArchived() : OrderService.getOrders();
      const [ordersData, metricsData] = await Promise.all([
        ordersPromise,
        OrderService.getDashboardMetrics()
      ]);
      setOrders(ordersData);
      setDashboardMetrics(metricsData);
    } catch (error) {
      console.error("Failed to load data:", error);
      addNotification("Failed to load initial data.", "error");
    } finally {
       if (initialLoad) {
         setIsLoading(false);
       }
    }
  }, [addNotification, orders.length, activeView]); 

  useEffect(() => {
    loadData(activeView === 'ARCHIVED_ORDERS');
  }, [loadData, activeView]);

  useEffect(() => {
    const pollTCS = async () => {
      const activeTrackingOrders = orders.filter(o => o.trackingNumber && o.appStatus !== OrderAppStatus.DELIVERED && o.appStatus !== OrderAppStatus.CANCELLED && o.appStatus !== OrderAppStatus.ARCHIVED);
      let changed = false;
      for (const order of activeTrackingOrders) {
        if (order.trackingNumber) {
          const updatedOrder = await OrderService.fetchAndUpdateTCSStatus(order.trackingNumber);
          if (updatedOrder) {
            setOrders(prevOrders => prevOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
            changed = true;
            // Check if a specific TCS event needs a notification
            if (updatedOrder.appStatus === OrderAppStatus.OUT_FOR_DELIVERY && !updatedOrder.outForDeliveryMsgSent) {
                 handlePrepareMessageForModal(updatedOrder, MessageTypeKey.TCS_OUT_FOR_DELIVERY);
            } else if (updatedOrder.appStatus === OrderAppStatus.ADDRESS_ISSUE && !updatedOrder.addressNeededMsgSent) {
                 handlePrepareMessageForModal(updatedOrder, MessageTypeKey.TCS_ADDRESS_NEEDED);
            } else if (updatedOrder.appStatus === OrderAppStatus.DELIVERED && updatedOrder.messageStatus !== MessageStatus.NOTIFIED && updatedOrder.messageStatus !== MessageStatus.CUSTOMER_CONFIRMED) {
                 handlePrepareMessageForModal(updatedOrder, MessageTypeKey.TCS_DELIVERED_THANK_YOU);
            }
          }
        }
      }
      if (changed) {
        const metrics = await OrderService.getDashboardMetrics();
        setDashboardMetrics(metrics);
      }
    };

    const intervalId = setInterval(pollTCS, appSettings.pollingIntervalSeconds * 1000);
    return () => clearInterval(intervalId);
  }, [orders, appSettings.pollingIntervalSeconds]);


  const handleOpenCreateOrderModal = () => {
    setOrderToEdit(null);
    setIsOrderFormModalOpen(true);
  };

  const handleOpenEditOrderModal = (order: Order) => {
    setOrderToEdit(order);
    setIsOrderFormModalOpen(true);
  };

  const handleCloseOrderFormModal = () => {
    setIsOrderFormModalOpen(false);
    setOrderToEdit(null);
  };

  const handleSaveOrder = async (formData: OrderFormData, itemsData: OrderItem[]) => {
    setIsLoading(true);
    try {
      let savedOrder: Order | undefined;
      if (orderToEdit) {
        savedOrder = await OrderService.editOrder(orderToEdit.id, formData, itemsData);
        addNotification(`Order ${savedOrder?.id} updated successfully!`, "success");
      } else {
        savedOrder = await OrderService.addOrder(formData, itemsData);
        addNotification(`New order ${savedOrder?.id} created successfully!`, "success");
         if (savedOrder) {
            handlePrepareMessageForModal(savedOrder, MessageTypeKey.NEW_ORDER_INITIAL);
        }
      }
      await loadData(activeView === 'ARCHIVED_ORDERS'); 
    } catch (error) {
      console.error("Failed to save order:", error);
      addNotification("Failed to save order.", "error");
    } finally {
      setIsLoading(false);
      handleCloseOrderFormModal();
    }
  };

  const handlePrepareMessageForModal = (order: Order, messageTypeKey: MessageTypeKey) => {
    setProcessingOrderId(null); 
    setSelectedOrderForMessage(order);
    setTargetMessageTypeKeyForModal(messageTypeKey);
  };

  const handleProcessOrder = async (order: Order, messageContent?: string, messageTypeKey?: MessageTypeKey) => {
    let effectiveMessageTypeKey = messageTypeKey;

    if (!messageContent || !effectiveMessageTypeKey) { 
        setProcessingOrderId(null); 
        let keyToOpenWith: MessageTypeKey | null = null;

        if (order.appStatus === OrderAppStatus.PENDING_CONFIRMATION && order.messageStatus === MessageStatus.PENDING) {
            keyToOpenWith = MessageTypeKey.NEW_ORDER_INITIAL;
        } else if (order.appStatus === OrderAppStatus.PENDING_CONFIRMATION && order.messageStatus === MessageStatus.SENT) {
            keyToOpenWith = MessageTypeKey.ORDER_CONFIRMATION_REMINDER;
        } else if (order.appStatus === OrderAppStatus.PROCESSING && (order.messageStatus === MessageStatus.PENDING || order.messageStatus === MessageStatus.CUSTOMER_CONFIRMED)) { 
            keyToOpenWith = MessageTypeKey.ORDER_PROCESSING_CONFIRMED;
        } else if (order.appStatus === OrderAppStatus.DISPATCHED && order.messageStatus === MessageStatus.PENDING) { 
            if (!order.trackingNumber) {
                addNotification(`Order ${order.id} is missing a tracking number. Cannot send dispatch notification.`, "warning");
                await OrderService.updateOrderStatus(order.id, MessageStatus.ERROR_MISSING_CN, order.appStatus, undefined, undefined, "Dispatch attempted, missing CN.", OrderType.DISPATCHED, undefined, "System: Validation");
                loadData(activeView === 'ARCHIVED_ORDERS');
                return;
            }
            keyToOpenWith = MessageTypeKey.ORDER_DISPATCH;
        } else if (order.appStatus === OrderAppStatus.OUT_FOR_DELIVERY && !order.outForDeliveryMsgSent) {
            keyToOpenWith = MessageTypeKey.TCS_OUT_FOR_DELIVERY;
        } else if (order.appStatus === OrderAppStatus.ADDRESS_ISSUE && !order.addressNeededMsgSent) {
            if (order.latestTCSStatus?.toLowerCase().includes(STATUS_KEYWORDS.RECIPIENT_PREMISES_CLOSED.toLowerCase())) {
                keyToOpenWith = MessageTypeKey.COURIER_RECIPIENT_PREMISES_CLOSED;
            } else {
                keyToOpenWith = MessageTypeKey.TCS_ADDRESS_NEEDED;
            }
        } else if (order.appStatus === OrderAppStatus.DELIVERED && order.messageStatus !== MessageStatus.NOTIFIED && order.messageStatus !== MessageStatus.CUSTOMER_CONFIRMED ) {
            keyToOpenWith = MessageTypeKey.TCS_DELIVERED_THANK_YOU;
        } else if (order.appStatus === OrderAppStatus.CANCELLED && order.messageStatus === MessageStatus.PENDING) {
            keyToOpenWith = MessageTypeKey.ORDER_CANCELLED;
        } else if (order.trackingNumber && (order.appStatus === OrderAppStatus.DISPATCHED || order.appStatus === OrderAppStatus.IN_TRANSIT) && order.messageStatus === MessageStatus.PENDING) {
             if (order.latestTCSStatus?.toLowerCase().includes(STATUS_KEYWORDS.BOOKED.toLowerCase()) || order.latestTCSStatus?.toLowerCase().includes('picked up')) {
                keyToOpenWith = MessageTypeKey.COURIER_SHIPMENT_PICKED_UP;
             } else if (order.appStatus === OrderAppStatus.IN_TRANSIT) {
                keyToOpenWith = MessageTypeKey.COURIER_IN_TRANSIT_UPDATE;
             } else {
                 keyToOpenWith = MessageTypeKey.TCS_GENERIC_UPDATE; 
             }
        }
        
        if (keyToOpenWith) {
            handlePrepareMessageForModal(order, keyToOpenWith);
        } else {
            addNotification(`No appropriate message template found for order ${order.id} in its current state.`, "info");
        }
        return; 
    }
    
    setProcessingOrderId(order.id); 
    addNotification(`Processing message for order ${order.id}...`, "info");

    try {
      const { success } = await WhatsAppService.sendWhatsappMessage(order.phoneNumber, messageContent);
      let newAppStatus = order.appStatus;
      let newMessageStatus = MessageStatus.SENT;
      let tcsUpdates: Partial<Order> = {};
      let orderTypeForHistory: OrderType | undefined = undefined; 

      if (success) {
        addNotification(`Notification for order ${order.id} sent successfully!`, "success");
        
        switch (effectiveMessageTypeKey) {
            case MessageTypeKey.NEW_ORDER_INITIAL:
                newMessageStatus = MessageStatus.SENT;
                orderTypeForHistory = OrderType.CREATED;
                break;
            case MessageTypeKey.ORDER_CONFIRMATION_REMINDER:
                newMessageStatus = MessageStatus.CONFIRMATION_SENT;
                orderTypeForHistory = OrderType.CREATED;
                break;
            case MessageTypeKey.ORDER_PROCESSING_CONFIRMED:
                newMessageStatus = MessageStatus.SENT; 
                break;
            case MessageTypeKey.ORDER_DISPATCH:
                newAppStatus = OrderAppStatus.DISPATCHED;
                newMessageStatus = MessageStatus.SENT;
                orderTypeForHistory = OrderType.DISPATCHED;
                break;
            case MessageTypeKey.ORDER_CANCELLED:
                newMessageStatus = MessageStatus.SENT;
                orderTypeForHistory = OrderType.CANCELLED;
                break;
            case MessageTypeKey.COURIER_SHIPMENT_PICKED_UP:
            case MessageTypeKey.COURIER_IN_TRANSIT_UPDATE:
            case MessageTypeKey.TCS_GENERIC_UPDATE:
                newMessageStatus = MessageStatus.NOTIFIED;
                orderTypeForHistory = OrderType.TCS_STATUS;
                break;
            case MessageTypeKey.TCS_OUT_FOR_DELIVERY:
                newMessageStatus = MessageStatus.NOTIFIED;
                tcsUpdates.outForDeliveryMsgSent = true;
                orderTypeForHistory = OrderType.TCS_STATUS;
                break;
            case MessageTypeKey.TCS_ADDRESS_NEEDED:
            case MessageTypeKey.COURIER_RECIPIENT_PREMISES_CLOSED:
                newMessageStatus = MessageStatus.NOTIFIED;
                tcsUpdates.addressNeededMsgSent = true; 
                orderTypeForHistory = OrderType.TCS_STATUS;
                break;
            case MessageTypeKey.TCS_DELIVERED_THANK_YOU:
                newMessageStatus = MessageStatus.NOTIFIED;
                orderTypeForHistory = OrderType.TCS_STATUS;
                break;
            case MessageTypeKey.MANUAL_STATUS_CHANGE_NOTIFICATION:
                newMessageStatus = MessageStatus.NOTIFIED; 
                break;
        }
        
        await OrderService.updateOrderStatus(
            order.id, 
            newMessageStatus, 
            newAppStatus, 
            new Date().toISOString(), 
            tcsUpdates, 
            messageContent, 
            orderTypeForHistory, 
            undefined, 
            `User: Template (${effectiveMessageTypeKey})`
        );
      } else {
        addNotification(`Failed to send notification for order ${order.id}.`, "error");
        await OrderService.updateOrderStatus(order.id, MessageStatus.ERROR_SENDING_FAILED, order.appStatus, undefined, undefined, "Message sending failed.", orderTypeForHistory, undefined, `System: Send Error`);
      }
    } catch (e) {
      console.error("Error processing order:", e);
      addNotification(`Error processing order ${order.id}.`, "error");
       await OrderService.updateOrderStatus(order.id, MessageStatus.ERROR_SENDING_FAILED, order.appStatus, undefined, undefined, `Error: ${e instanceof Error ? e.message : 'Unknown'}`, undefined, undefined, `System: Exception`);
    } finally {
      await loadData(activeView === 'ARCHIVED_ORDERS');
      setSelectedOrderForMessage(null); 
      setTargetMessageTypeKeyForModal(null);
      setProcessingOrderId(null); 
    }
  };

  const handleViewOrder = (orderToView: Order) => setSelectedOrderForDetails(orderToView);
  
  const handleUserCancelOrder = async (orderToCancel: Order) => {
    if (window.confirm(`Are you sure you want to mark order ${orderToCancel.id} as cancelled and queue a cancellation message?`)) {
      setIsLoading(true);
      try {
        await OrderService.markOrderAsCancelled(orderToCancel.id);
        addNotification(`Order ${orderToCancel.id} marked as cancelled. Opening message generator...`, "info");
         const updatedOrder = await OrderService.getOrderById(orderToCancel.id);
         if (updatedOrder) handlePrepareMessageForModal(updatedOrder, MessageTypeKey.ORDER_CANCELLED); 
      } catch (e) {
        console.error("Error cancelling order:", e);
        addNotification(`Failed to mark order ${orderToCancel.id} as cancelled.`, "error");
      } finally {
        await loadData(activeView === 'ARCHIVED_ORDERS');
        setIsLoading(false);
      }
    }
  };

  const handleSimulateCustomerConfirmation = async (orderToConfirm: Order) => {
    setIsLoading(true);
    try {
      const updatedOrder = await OrderService.simulateCustomerConfirmation(orderToConfirm.id);
      if (updatedOrder) {
        addNotification(`Order ${updatedOrder.id} confirmed by customer (simulated). Status set to Processing.`, "success");
        await loadData(activeView === 'ARCHIVED_ORDERS');
      } else {
        addNotification(`Failed to simulate confirmation for order ${orderToConfirm.id}.`, "warning");
      }
    } catch (error) {
      console.error("Error simulating confirmation:", error);
      addNotification(`Error simulating confirmation for ${orderToConfirm.id}.`, "error");
    } finally {
      setIsLoading(false);
    }
  };


  const handleSaveWhatsAppConfig = (newConfig: WhatsAppAPIConfig) => {
    setWhatsAppApiConfig(newConfig);
    localStorage.setItem('whatsAppApiConfig', JSON.stringify(newConfig));
    addNotification("WhatsApp API settings saved!", "success");
  };

  const handleSendTestWhatsAppMessage = async (recipient: string, message: string, config: WhatsAppAPIConfig): Promise<{ success: boolean; response: any }> => {
    addNotification(`Sending test message to ${recipient}...`, "info");
    const result = await WhatsAppService.sendWhatsappMessage(recipient, message);
    if (result.success) {
      addNotification(`Test message to ${recipient} "sent" (mocked).`, "success");
    } else {
      addNotification(`Failed to "send" test message to ${recipient} (mocked).`, "error");
    }
    return { success: result.success, response: result.message || { status: result.success ? 'sent' : 'failed'} };
  };

  const handleSaveAppSettings = (newSettings: AppSettingsConfig) => {
    setAppSettings(newSettings);
    localStorage.setItem('appSettingsConfig', JSON.stringify(newSettings));
    addNotification("App settings saved!", "success");
  };

  const handleSaveCustomMessagesConfig = (newConfig: CustomMessagesConfig) => {
    setCustomMessagesConfig(newConfig);
    localStorage.setItem('customMessagesConfig', JSON.stringify(newConfig));
    addNotification("Custom message templates saved!", "success");
  };

  const handleResetMockData = async () => {
    setIsLoading(true); 
    try {
      await OrderService.resetAllOrders();
      await loadData(activeView === 'ARCHIVED_ORDERS'); 
      addNotification("Mock order data has been reset to initial state.", "success");
    } catch (error) {
      console.error("Failed to reset mock data:", error);
      addNotification("Failed to reset mock data.", "error");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClearLocalSettings = () => {
    if (window.confirm("Are you sure you want to clear all locally stored settings (WhatsApp API, App Settings, Custom Messages, Column Visibility)? The app will use defaults.")) {
        localStorage.removeItem('whatsAppApiConfig');
        localStorage.removeItem('appSettingsConfig');
        localStorage.removeItem('customMessagesConfig');
        localStorage.removeItem('visibleDataTableColumns');
        setWhatsAppApiConfig(DEFAULT_WHATSAPP_CONFIG);
        setAppSettings(APP_DEFAULTS);
        setCustomMessagesConfig(DEFAULT_CUSTOM_MESSAGES);
        setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
        addNotification("All local settings cleared. App is now using defaults.", "info");
    }
  };

  useEffect(() => {
    const checkConfirmations = async () => {
      const ordersNeedingReminder = orders.filter(o => 
        o.appStatus === OrderAppStatus.PENDING_CONFIRMATION && 
        o.messageStatus === MessageStatus.SENT && 
        o.messageSentTimestamp &&
        (new Date().getTime() - new Date(o.messageSentTimestamp).getTime()) / (1000 * 60 * 60) >= appSettings.confirmationDelayHours
      );

      for (const order of ordersNeedingReminder) {
          if (!selectedOrderForMessage || selectedOrderForMessage.id !== order.id || targetMessageTypeKeyForModal !== MessageTypeKey.ORDER_CONFIRMATION_REMINDER) {
            addNotification(`Order ${order.id} needs confirmation reminder. Opening message generation...`, "info");
            await OrderService.updateOrderStatus(order.id, MessageStatus.CONFIRMATION_SENT, order.appStatus, undefined, undefined, "Confirmation reminder queued", undefined, undefined, "System: Auto Reminder");
            const updatedOrder = await OrderService.getOrderById(order.id); 
            if (updatedOrder) handlePrepareMessageForModal(updatedOrder, MessageTypeKey.ORDER_CONFIRMATION_REMINDER); 
          }
        }
    };
    const confirmationInterval = setInterval(checkConfirmations, 60 * 60 * 1000); 
    if (orders.length > 0) checkConfirmations(); 
    return () => clearInterval(confirmationInterval);
  }, [orders, appSettings.confirmationDelayHours, addNotification, selectedOrderForMessage, targetMessageTypeKeyForModal]); 


  const requestSort = (key: SortableOrderKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedOrders = useMemo(() => {
    let tempOrders = [...orders];
    
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      tempOrders = tempOrders.filter(order => 
        order.id.toLowerCase().includes(lowerSearchTerm) ||
        order.customerName.toLowerCase().includes(lowerSearchTerm) ||
        order.phoneNumber.includes(searchTerm) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(lowerSearchTerm)) ||
        order.items.some(item => item.name.toLowerCase().includes(lowerSearchTerm)) ||
        order.city.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (filterCriteria.appStatus) {
        tempOrders = tempOrders.filter(o => o.appStatus === filterCriteria.appStatus);
    }
    if (filterCriteria.paymentMethod) {
        tempOrders = tempOrders.filter(o => o.paymentMethod === filterCriteria.paymentMethod);
    }

    if (sortConfig !== null && sortConfig.key !== null) {
      tempOrders.sort((a, b) => {
        const valA = a[sortConfig.key!];
        const valB = b[sortConfig.key!];

        let comparison = 0;
        if (valA === undefined || valA === null) comparison = -1;
        else if (valB === undefined || valB === null) comparison = 1;
        else if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else if (sortConfig.key === 'orderTimestamp' || sortConfig.key === 'messageSentTimestamp') {
          comparison = new Date(valA as string).getTime() - new Date(valB as string).getTime();
        }
         else {
          comparison = String(valA).toLowerCase().localeCompare(String(valB).toLowerCase());
        }
        
        return sortConfig.direction === 'ascending' ? comparison : comparison * -1;
      });
    }
    return tempOrders;
  }, [orders, searchTerm, sortConfig, filterCriteria]);

  // Filtering for new views
  const storeOrderCreatedOrders = useMemo(() => filteredAndSortedOrders.filter(o => o.appStatus === OrderAppStatus.PENDING_CONFIRMATION), [filteredAndSortedOrders]);
  const storeOrderConfirmedOrders = useMemo(() => filteredAndSortedOrders.filter(o => o.appStatus === OrderAppStatus.PROCESSING), [filteredAndSortedOrders]);
  const storeOrderDispatchedOrders = useMemo(() => filteredAndSortedOrders.filter(o => o.appStatus === OrderAppStatus.DISPATCHED), [filteredAndSortedOrders]);
  const storeOrderCancelledOrders = useMemo(() => filteredAndSortedOrders.filter(o => o.appStatus === OrderAppStatus.CANCELLED), [filteredAndSortedOrders]);

  const courierShipmentPickedUpOrders = useMemo(() => filteredAndSortedOrders.filter(o => 
    (o.appStatus === OrderAppStatus.DISPATCHED || o.appStatus === OrderAppStatus.IN_TRANSIT) &&
    o.latestTCSStatus && (o.latestTCSStatus.toLowerCase().includes('booked') || o.latestTCSStatus.toLowerCase().includes('picked up') || o.latestTCSStatus.toLowerCase().includes('arrived at origin'))
  ), [filteredAndSortedOrders]);
  const courierInTransitOrders = useMemo(() => filteredAndSortedOrders.filter(o => o.appStatus === OrderAppStatus.IN_TRANSIT), [filteredAndSortedOrders]);
  const courierOutForDeliveryOrders = useMemo(() => filteredAndSortedOrders.filter(o => o.appStatus === OrderAppStatus.OUT_FOR_DELIVERY), [filteredAndSortedOrders]);
  const courierDeliveredOrders = useMemo(() => filteredAndSortedOrders.filter(o => o.appStatus === OrderAppStatus.DELIVERED), [filteredAndSortedOrders]);
  const courierRecipientPremisesClosedOrders = useMemo(() => filteredAndSortedOrders.filter(o => 
    o.appStatus === OrderAppStatus.ADDRESS_ISSUE && o.latestTCSStatus && 
    (o.latestTCSStatus.toLowerCase().includes(STATUS_KEYWORDS.RECIPIENT_PREMISES_CLOSED) || o.latestTCSStatus.toLowerCase().includes('premises closed') || o.latestTCSStatus.toLowerCase().includes(STATUS_KEYWORDS.NO_ANSWER))
  ), [filteredAndSortedOrders]);
  const courierAddressIssueOrders = useMemo(() => filteredAndSortedOrders.filter(o => 
    o.appStatus === OrderAppStatus.ADDRESS_ISSUE && o.latestTCSStatus && 
    (o.latestTCSStatus.toLowerCase().includes(STATUS_KEYWORDS.ADDRESS_NEEDED) || o.latestTCSStatus.toLowerCase().includes(STATUS_KEYWORDS.INCOMPLETE_ADDRESS)) &&
    !(o.latestTCSStatus.toLowerCase().includes(STATUS_KEYWORDS.RECIPIENT_PREMISES_CLOSED) || o.latestTCSStatus.toLowerCase().includes('premises closed') || o.latestTCSStatus.toLowerCase().includes(STATUS_KEYWORDS.NO_ANSWER)) 
  ), [filteredAndSortedOrders]);
  
  const archivedOrdersForTable = useMemo(() => filteredAndSortedOrders.filter(o => o.appStatus === OrderAppStatus.ARCHIVED), [filteredAndSortedOrders]);


  const commonTableProps = {
    onViewOrder: handleViewOrder,
    onProcessOrder: handleProcessOrder,
    onPrepareTemplateMessage: handlePrepareMessageForModal, 
    onEditOrder: handleOpenEditOrderModal,
    onCancelOrder: handleUserCancelOrder,
    onSimulateConfirmation: handleSimulateCustomerConfirmation, 
    requestSort: requestSort, 
    sortConfig: sortConfig,
    processingOrderId: processingOrderId, 
    selectedOrderIds: selectedOrderIds, 
    setSelectedOrderIds: setSelectedOrderIds, 
    filterCriteria: filterCriteria, 
    setFilterCriteria: setFilterCriteria, 
  };

  const handleOpenChangeStatusModal = () => {
    if (selectedOrderIds.size > 0) {
      setChangeStatusModalContext({ currentView: activeView });
      setIsChangeStatusModalOpen(true);
    } else {
      addNotification("Please select orders to change status.", "warning");
    }
  };

  const handleChangeStatusConfirm = async (newStatus: OrderAppStatus) => {
    if (selectedOrderIds.size === 0) return;
    
    let messageStatusForUpdate: MessageStatus = MessageStatus.NOTIFIED; 
    let messageTypeForNotification: MessageTypeKey | null = null;

    if ([OrderAppStatus.DISPATCHED, OrderAppStatus.OUT_FOR_DELIVERY, OrderAppStatus.ADDRESS_ISSUE, OrderAppStatus.CANCELLED].includes(newStatus)) {
        messageStatusForUpdate = MessageStatus.PENDING;
        messageTypeForNotification = MessageTypeKey.MANUAL_STATUS_CHANGE_NOTIFICATION;
    }

    addNotification(`Updating status for ${selectedOrderIds.size} orders to ${newStatus}...`, "info");
    try {
      await OrderService.bulkUpdateStatus(
        Array.from(selectedOrderIds), 
        newStatus, 
        messageStatusForUpdate, 
        "User: Change Status"
      );
      addNotification(`${selectedOrderIds.size} orders updated to ${newStatus}.`, "success");

      if (messageTypeForNotification) {
        const firstSelectedId = Array.from(selectedOrderIds)[0];
        const orderToNotify = orders.find(o => o.id === firstSelectedId);
        if (orderToNotify) {
            handlePrepareMessageForModal(orderToNotify, messageTypeForNotification);
            addNotification(`Prepare a notification for status change (template: ${messageTypeForNotification}).`, "info");
        }
      }

    } catch (error) {
      addNotification(`Failed to update status. ${error instanceof Error ? error.message : ''}`, "error");
      console.error("Bulk status update failed:", error);
    } finally {
      setSelectedOrderIds(new Set());
      setIsChangeStatusModalOpen(false);
      loadData(activeView === 'ARCHIVED_ORDERS');
    }
  };


  // Bulk Action Handlers
  const handleBulkDispatch = async () => {
    if (selectedOrderIds.size === 0) return;
    addNotification(`Attempting to mark ${selectedOrderIds.size} orders as dispatched...`, "info");
    await OrderService.bulkUpdateStatus(Array.from(selectedOrderIds), OrderAppStatus.DISPATCHED, MessageStatus.PENDING, "User: Bulk Dispatch");
    addNotification(`${selectedOrderIds.size} orders marked as dispatched. Ready for notifications.`, "success");
    setSelectedOrderIds(new Set());
    loadData(activeView === 'ARCHIVED_ORDERS');
  };

  const handleBulkSendNotification = async () => {
    if (selectedOrderIds.size === 0) return;
    addNotification(`Queuing batch notifications for ${selectedOrderIds.size} orders...`, "info");
    let count = 0;
    for (const orderId of selectedOrderIds) {
        const order = orders.find(o => o.id === orderId);
        if (order && order.messageStatus === MessageStatus.PENDING) { 
             await OrderService.updateOrderStatus(orderId, MessageStatus.SENT, order.appStatus, new Date().toISOString(), undefined, "Batch notification sent (mock).", undefined, undefined, "User: Bulk Notification");
            count++;
        }
    }
    addNotification(`${count} batch notifications "sent" (mocked). Other orders might not have been in PENDING state.`, "success");
    setSelectedOrderIds(new Set());
    loadData(activeView === 'ARCHIVED_ORDERS');
  };

  const handleBulkArchive = async () => {
    if (selectedOrderIds.size === 0) return;
    if (window.confirm(`Are you sure you want to archive ${selectedOrderIds.size} selected orders?`)) {
        addNotification(`Archiving ${selectedOrderIds.size} orders...`, "info");
        await OrderService.bulkArchiveOrders(Array.from(selectedOrderIds), "User: Bulk Archive");
        addNotification(`${selectedOrderIds.size} orders archived.`, "success");
        setSelectedOrderIds(new Set());
        loadData(activeView === 'ARCHIVED_ORDERS');
    }
  };


  const currentBreadcrumbs = useMemo((): BreadcrumbItem[] => {
    const homeCrumb = { label: "Home", view: 'DASHBOARD' as ActiveView };
    switch (activeView) {
        case 'APP_SETTINGS': return [homeCrumb, { label: "App Settings" }];
        case 'WHATSAPP_API_SETTINGS': return [homeCrumb, { label: "WhatsApp API Config" }];
        case 'CUSTOM_MESSAGES_SETTINGS': return [homeCrumb, { label: "Message Templates" }];
        case 'ABOUT_APP': return [homeCrumb, { label: "About This App" }];
        case 'CUSTOMER_LIST': return [homeCrumb, {label: "Customers"}];
        case 'AUDIT_TRAIL': return [homeCrumb, {label: "Audit Trail"}];
        default: return []; 
    }
  }, [activeView]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };
  
  const bulkActionToolbar = selectedOrderIds.size > 0 ? (
    <BulkActionToolbar 
        selectedCount={selectedOrderIds.size} 
        onDispatch={handleBulkDispatch} 
        onSendNotification={handleBulkSendNotification} 
        onArchive={handleBulkArchive}
        onChangeStatus={handleOpenChangeStatusModal}
    />
  ) : null;

  const renderView = () => {
    if (isLoading && orders.length === 0 && !['APP_SETTINGS', 'WHATSAPP_API_SETTINGS', 'CUSTOM_MESSAGES_SETTINGS', 'ABOUT_APP', 'CUSTOMER_LIST', 'AUDIT_TRAIL'].includes(activeView)) {
      return <div className="flex justify-center items-center h-screen"><LoadingSpinner text="Loading application data..." size="lg"/></div>;
    }
    
    const viewsWithBulkToolbar = [
        'STORE_ORDER_CREATED', 'STORE_ORDER_CONFIRMED', 'STORE_ORDER_DISPATCHED_FROM_STORE', 
        'STORE_ORDER_CANCELLED', 'COURIER_SHIPMENT_PICKED_UP', 'COURIER_IN_TRANSIT', 
        'COURIER_OUT_FOR_DELIVERY', 'COURIER_DELIVERED_BY_COURIER', 
        'COURIER_RECIPIENT_PREMISES_CLOSED', 'COURIER_ADDRESS_ISSUE_BY_COURIER',
        'CATEGORIZED_ORDER_VIEW', 'ARCHIVED_ORDERS'
    ];

    let ordersForCurrentView: Order[] = [];
    let viewTitle = "";

    switch (activeView) {
      case 'DASHBOARD': return <DashboardView metrics={dashboardMetrics} onNavigate={setActiveView} />;
      
      case 'STORE_ORDER_CREATED': 
        ordersForCurrentView = storeOrderCreatedOrders; viewTitle = "Order Created (from Store)"; break;
      case 'STORE_ORDER_CONFIRMED': 
        ordersForCurrentView = storeOrderConfirmedOrders; viewTitle = "Order Confirmed (by Store)"; break;
      case 'STORE_ORDER_DISPATCHED_FROM_STORE': 
        ordersForCurrentView = storeOrderDispatchedOrders; viewTitle = "Order Dispatched (from Store)"; break;
      case 'STORE_ORDER_CANCELLED': 
        ordersForCurrentView = storeOrderCancelledOrders; viewTitle = "Order Cancelled (by Store)"; break;

      case 'COURIER_SHIPMENT_PICKED_UP': 
        ordersForCurrentView = courierShipmentPickedUpOrders; viewTitle = "Shipment Picked Up (Courier)"; break;
      case 'COURIER_IN_TRANSIT': 
        ordersForCurrentView = courierInTransitOrders; viewTitle = "In Transit (Courier)"; break;
      case 'COURIER_OUT_FOR_DELIVERY': 
        ordersForCurrentView = courierOutForDeliveryOrders; viewTitle = "Out for Delivery (Courier)"; break;
      case 'COURIER_DELIVERED_BY_COURIER': 
        ordersForCurrentView = courierDeliveredOrders; viewTitle = "Delivered (by Courier)"; break;
      case 'COURIER_RECIPIENT_PREMISES_CLOSED': 
        ordersForCurrentView = courierRecipientPremisesClosedOrders; viewTitle = "Recipient Premises Closed (Courier)"; break;
      case 'COURIER_ADDRESS_ISSUE_BY_COURIER': 
        ordersForCurrentView = courierAddressIssueOrders; viewTitle = "Address Information Needed (Courier)"; break;
        
      case 'CATEGORIZED_ORDER_VIEW':
         ordersForCurrentView = filteredAndSortedOrders.filter(o => o.appStatus !== OrderAppStatus.ARCHIVED); viewTitle = "All Active Orders (Categorized)"; break;
      case 'ARCHIVED_ORDERS':
        ordersForCurrentView = archivedOrdersForTable; viewTitle = "Archived Orders"; break;

      case 'COMPREHENSIVE_DATA_VIEW': 
        return <AllDataTable 
                    title="Full Order Data Table" 
                    orders={filteredAndSortedOrders} 
                    requestSort={requestSort} 
                    sortConfig={sortConfig} 
                    selectedOrderIds={selectedOrderIds}
                    setSelectedOrderIds={setSelectedOrderIds}
                    filterCriteria={filterCriteria}
                    setFilterCriteria={setFilterCriteria}
                    visibleColumns={visibleColumns}
                    setVisibleColumns={(cols) => {
                        setVisibleColumns(cols);
                        localStorage.setItem('visibleDataTableColumns', JSON.stringify(cols));
                    }}
                    allPossibleColumns={ALL_DATA_TABLE_COLUMNS}
                />;
      case 'WHATSAPP_API_SETTINGS': return <WhatsAppAPISettingsView initialConfig={whatsAppApiConfig} onSaveConfig={handleSaveWhatsAppConfig} onSendTestMessage={handleSendTestWhatsAppMessage} />;
      case 'APP_SETTINGS': return <AppSettingsView initialSettings={appSettings} onSaveSettings={handleSaveAppSettings} onResetMockData={handleResetMockData} onClearLocalSettings={handleClearLocalSettings} />;
      case 'CUSTOM_MESSAGES_SETTINGS': return <CustomMessagesSettingsView initialMessagesConfig={customMessagesConfig} onSaveConfig={handleSaveCustomMessagesConfig} />;
      case 'ABOUT_APP': return <AboutAppView />;
      case 'CUSTOMER_LIST': return <CustomerListView />;
      case 'AUDIT_TRAIL': return <AuditTrailView />;
      
      case 'NEW_ORDERS': ordersForCurrentView = storeOrderCreatedOrders; viewTitle = "Legacy New Orders"; break;
      case 'PROCESSING_ORDERS': ordersForCurrentView = storeOrderConfirmedOrders; viewTitle = "Legacy Processing Orders"; break;
      default:
        return <div>View not found or not yet implemented. Current ActiveView: {activeView}</div>;
    }
    
    if (viewTitle) { 
        return <>
            {viewsWithBulkToolbar.includes(activeView) && bulkActionToolbar}
            <OrderTable title={viewTitle} orders={ordersForCurrentView} {...commonTableProps}  />
        </>;
    }
    return <div>Unhandled view: {activeView}</div>;
  };
  
  const NavItem: React.FC<{ 
    view?: ActiveView; 
    label: string; 
    icon: React.ReactNode; 
    onClick?: () => void;
    isChild?: boolean;
  }> = ({ view, label, icon, onClick, isChild = false }) => (
    <li>
      <button
        onClick={() => {
            if (view) {
                setActiveView(view);
                setSelectedOrderIds(new Set()); 
            } else if (onClick) {
                onClick();
            }
        }}
        className={`flex items-center p-3 text-base font-medium rounded-lg transition-all duration-200 ease-in-out group w-full text-left
                    ${activeView === view && view ? 'bg-purple-600 text-white shadow-md' : 'text-gray-700 hover:bg-purple-100 hover:text-purple-700'}
                    ${isChild ? 'pl-10' : ''}`} 
      >
        <span className={`transition-colors duration-200 ${activeView === view && view ? 'text-white' : 'text-purple-600 group-hover:text-purple-700'}`}>
          {icon}
        </span>
        <span className="ml-3 flex-1 whitespace-nowrap">{label}</span>
      </button>
    </li>
  );

  const NavGroup: React.FC<{
    sectionKey: string;
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ sectionKey, label, icon, children }) => {
    const isExpanded = expandedSections.has(sectionKey);
    return (
      <>
        <li>
          <button
            onClick={() => toggleSection(sectionKey)}
            className="flex items-center p-3 text-base font-medium rounded-lg transition-all duration-200 ease-in-out group w-full text-left text-gray-700 hover:bg-purple-100 hover:text-purple-700"
            aria-expanded={isExpanded}
          >
            <span className="text-purple-600 group-hover:text-purple-700">{icon}</span>
            <span className="ml-3 flex-1 whitespace-nowrap">{label}</span>
            {isExpanded ? <ChevronDownIcon className="w-5 h-5 text-gray-500 group-hover:text-purple-600" /> : <ChevronRightIcon className="w-5 h-5 text-gray-500 group-hover:text-purple-600" />}
          </button>
        </li>
        {isExpanded && <ul className="space-y-1 py-1">{children}</ul>}
      </>
    );
  };


  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-72 bg-white shadow-xl flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-purple-700 flex items-center">
            <SparklesIcon className="w-7 h-7 mr-2"/> {APP_NAME}
          </h1>
        </div>
        <nav className="flex-grow p-4 space-y-1.5">
           <ul>
            <NavItem 
                label="Create New Order" 
                icon={<PlusIcon className="w-6 h-6"/>} 
                onClick={handleOpenCreateOrderModal}
            />
            <hr className="my-2 border-gray-200"/>
            <NavItem view="DASHBOARD" label="Dashboard" icon={<ChartBarIcon className="w-6 h-6"/>} />
            
             <NavGroup sectionKey="orderStatusStore" label="Order Status from Store" icon={<BuildingStorefrontIcon className="w-6 h-6" />}>
                <NavItem view="STORE_ORDER_CREATED" label="Order Created" icon={<PaperAirplaneIcon className="w-5 h-5"/>} isChild />
                <NavItem view="STORE_ORDER_CONFIRMED" label="Order Confirmed" icon={<CheckCircleIcon className="w-5 h-5"/>} isChild />
                <NavItem view="STORE_ORDER_DISPATCHED_FROM_STORE" label="Order Dispatched" icon={<SimpleTruckIcon className="w-5 h-5"/>} isChild />
                <NavItem view="STORE_ORDER_CANCELLED" label="Order Cancelled" icon={<XCircleIcon className="w-5 h-5"/>} isChild />
            </NavGroup>

            <NavGroup sectionKey="orderStatusCourier" label="Order Status from Courier" icon={<TruckIcon className="w-6 h-6" />}>
                <NavItem view="COURIER_SHIPMENT_PICKED_UP" label="Shipment Picked Up" icon={<ArchiveBoxArrowDownIcon className="w-5 h-5"/>} isChild />
                <NavItem view="COURIER_IN_TRANSIT" label="In Transit" icon={<SimpleTruckIcon className="w-5 h-5 transform -scale-x-100"/>} isChild />
                <NavItem view="COURIER_OUT_FOR_DELIVERY" label="Out for Delivery" icon={<CubeTransparentIcon className="w-5 h-5"/>} isChild /> 
                <NavItem view="COURIER_DELIVERED_BY_COURIER" label="Delivered" icon={<CheckCircleIcon className="w-5 h-5"/>} isChild />
                <NavItem view="COURIER_RECIPIENT_PREMISES_CLOSED" label="Premises Closed" icon={<XCircleIcon className="w-5 h-5"/>} isChild />
                <NavItem view="COURIER_ADDRESS_ISSUE_BY_COURIER" label="Address Issue" icon={<CubeTransparentIcon className="w-5 h-5"/>} isChild /> 
            </NavGroup>
            
            <hr className="my-2 border-gray-200"/>
            <NavItem view="CATEGORIZED_ORDER_VIEW" label="All Active Orders" icon={<DocumentTextIcon className="w-6 h-6"/>} />
            <NavItem view="COMPREHENSIVE_DATA_VIEW" label="Full Order Data Table" icon={<RectangleStackIcon className="w-6 h-6"/>} />
            <NavItem view="ARCHIVED_ORDERS" label="Archived Orders" icon={<ArchiveIcon className="w-6 h-6"/>} />
            <hr className="my-2 border-gray-200"/>
            <NavItem view="CUSTOMER_LIST" label="Customers" icon={<UsersIcon className="w-6 h-6"/>} />
            <NavItem view="AUDIT_TRAIL" label="Audit Trail" icon={<ClipboardDocumentCheckIcon className="w-6 h-6"/>} />
            <hr className="my-2 border-gray-200"/>

             <NavGroup sectionKey="settings" label="Application Settings" icon={<AdjustmentsHorizontalIcon className="w-6 h-6" />}>
                <NavItem view="APP_SETTINGS" label="App Settings" icon={<Cog6ToothIcon className="w-5 h-5"/>} isChild />
                <NavItem view="WHATSAPP_API_SETTINGS" label="WhatsApp API Cfg" icon={<Cog6ToothIcon className="w-5 h-5"/>} isChild />
                <NavItem view="CUSTOM_MESSAGES_SETTINGS" label="Message Templates" icon={<PencilRulerIcon className="w-5 h-5"/>} isChild /> 
            </NavGroup>
            <hr className="my-2 border-gray-200"/>
            <NavItem view="ABOUT_APP" label="About This App" icon={<InformationCircleIcon className="w-6 h-6"/>} />
          </ul>
        </nav>
        <div className="p-4 mt-auto border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Order Manager</p> 
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto"> 
        <div className="sticky top-0 bg-gray-100 p-4 md:p-6 z-10 shadow-sm"> 
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search (ID, Name, Phone, Tracking #, Item, City)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm shadow-sm"
            />
          </div>
          {currentBreadcrumbs.length > 0 && (
            <div className="mt-3">
                <Breadcrumbs items={currentBreadcrumbs} onNavigate={(view) => { setActiveView(view); setSelectedOrderIds(new Set()); }}/>
            </div>
          )}
        </div>
        <div className="flex-grow p-2 md:p-6">
            {renderView()}
        </div>
      </main>

      {selectedOrderForDetails && (
        <OrderDetailsModal 
          order={selectedOrderForDetails} 
          isOpen={!!selectedOrderForDetails} 
          onClose={() => setSelectedOrderForDetails(null)} 
        />
      )}
      {selectedOrderForMessage && targetMessageTypeKeyForModal && ( 
        <MessageGenerationModal
            order={selectedOrderForMessage}
            isOpen={!!selectedOrderForMessage}
            onClose={() => {
                setSelectedOrderForMessage(null);
                setTargetMessageTypeKeyForModal(null);
            }}
            onSendMessage={handleProcessOrder}
            targetMessageTypeKey={targetMessageTypeKeyForModal}
            customMessagesConfig={customMessagesConfig} 
            appSettings={appSettings}
        />
      )}
      {isOrderFormModalOpen && (
        <OrderFormModal
          isOpen={isOrderFormModalOpen}
          onClose={handleCloseOrderFormModal}
          onSave={handleSaveOrder}
          initialOrder={orderToEdit}
        />
      )}
      {isChangeStatusModalOpen && changeStatusModalContext && (
        <ChangeStatusModal
          isOpen={isChangeStatusModalOpen}
          onClose={() => setIsChangeStatusModalOpen(false)}
          onConfirm={handleChangeStatusConfirm}
          selectedOrderCount={selectedOrderIds.size}
          currentViewContext={changeStatusModalContext.currentView}
        />
      )}
      
      <div className="fixed top-5 right-5 z-[100] space-y-3 w-full max-w-md">
        {notifications.map(notif => (
          <NotificationBanner 
            key={notif.id} 
            message={notif.message} 
            type={notif.type} 
            onDismiss={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
          />
        ))}
      </div>
      {isLoading && orders.length > 0 && ( 
        <div className="fixed bottom-0 left-0 right-0 h-1 bg-purple-500 animate-pulse z-[101]"></div>
      )}
    </div>
  );
};

export default App;
