
import { Order, MessageStatus, OrderAppStatus, TCSStatusUpdate, DashboardMetrics, OrderItem, OrderFormData, MessageHistoryEntry, OrderType } from '../types';
import { INITIAL_ORDERS, MOCK_TCS_STATUS_UPDATES, STATUS_KEYWORDS } from '../constants';
import { BASE_API_URL } from '../../apiConfig'; 

let orders: Order[] = JSON.parse(JSON.stringify(INITIAL_ORDERS.map(o => ({...o, messageHistory: o.messageHistory || [] })))); 

// Helper function to determine message type for history
const getMessageHistoryType = (
    currentOrderAppStatus: OrderAppStatus, 
    orderTypeContext?: OrderType, 
    specificEventContext?: string,
    latestTCSStatusText?: string,
    actionSource?: string // e.g., "User: Manual", "System: Template", "System: Polling"
): string => {
  
  const sourcePrefix = actionSource ? `${actionSource}: ` : 'System: ';

  if (orderTypeContext === OrderType.CREATED && specificEventContext === 'Confirmation') return `${sourcePrefix}Confirmation Reminder Sent`;
  if (orderTypeContext === OrderType.CREATED) return `${sourcePrefix}Initial Order Notification Sent`;
  if (orderTypeContext === OrderType.CANCELLED) return `${sourcePrefix}Cancellation Alert Sent`;
  if (orderTypeContext === OrderType.DISPATCHED) return `${sourcePrefix}Dispatch Notification Sent`;
  
  if (orderTypeContext === OrderType.TCS_STATUS) {
    if (specificEventContext === 'OutOfDelivery') return `TCS Update via ${sourcePrefix.trim()} - Out for Delivery`;
    if (specificEventContext === 'AddressNeeded') return `TCS Update via ${sourcePrefix.trim()} - Address Needed`;
    if (specificEventContext === 'DeliveredSuccessfully') return `TCS Update via ${sourcePrefix.trim()} - Delivered - Thank You Sent`;
    return `TCS Update via ${sourcePrefix.trim()} - ${latestTCSStatusText || 'Status Updated'}`;
  }

  // Fallback based on appStatus if no specific context
  switch (currentOrderAppStatus) {
    case OrderAppStatus.PENDING_CONFIRMATION: return `${sourcePrefix}Awaiting Customer Confirmation`;
    case OrderAppStatus.PROCESSING: return `${sourcePrefix}Order Confirmed (Processing)`;
    case OrderAppStatus.OUT_FOR_DELIVERY: return `Courier Update via ${sourcePrefix.trim()} - Out for Delivery`;
    case OrderAppStatus.ADDRESS_ISSUE: return `Courier Update via ${sourcePrefix.trim()} - Address Issue`;
    case OrderAppStatus.DELIVERED: return `Courier Update via ${sourcePrefix.trim()} - Delivered`;
    case OrderAppStatus.ARCHIVED: return `${sourcePrefix}Order Archived`;
    default: return `${sourcePrefix}Status Update - ${currentOrderAppStatus}`;
  }
};

export const getOrders = (): Promise<Order[]> => {
  return Promise.resolve(orders.filter(o => o.appStatus !== OrderAppStatus.ARCHIVED)); // Exclude archived by default
};

export const getAllOrdersIncludingArchived = (): Promise<Order[]> => { // For views that might need archived
  return Promise.resolve(orders);
};


export const getOrderById = (id: string): Promise<Order | undefined> => {
  return Promise.resolve(orders.find(order => order.id === id));
};

export const updateOrderStatus = (
  orderId: string, 
  messageStatus: MessageStatus, 
  appStatus?: OrderAppStatus, 
  messageSentTimestamp?: string, 
  tcsRelatedUpdates?: Partial<Order>,
  messageContentSnippet: string = "Message processed.",
  messageTypeContext?: OrderType, 
  specificEventContext?: 'OutOfDelivery' | 'AddressNeeded' | 'DeliveredSuccessfully' | 'Confirmation',
  actor: string = "System: Template Message" 
): Promise<Order | undefined> => {
  const orderIndex = orders.findIndex(o => o.id === orderId);
  if (orderIndex !== -1) {
    const currentOrder = orders[orderIndex];
    const effectiveAppStatus = appStatus || currentOrder.appStatus;
    const historyType = getMessageHistoryType(effectiveAppStatus, messageTypeContext, specificEventContext, tcsRelatedUpdates?.latestTCSStatus || currentOrder.latestTCSStatus, actor);
    
    const newHistoryEntry: MessageHistoryEntry = {
      timestamp: messageSentTimestamp || new Date().toISOString(),
      type: historyType,
      contentSnippet: messageContentSnippet.substring(0, 100) + (messageContentSnippet.length > 100 ? '...' : ''),
      actor: actor,
    };

    orders[orderIndex] = {
      ...currentOrder,
      messageStatus,
      messageSentTimestamp: messageSentTimestamp || new Date().toISOString(),
      ...(appStatus && { appStatus: effectiveAppStatus }),
      ...tcsRelatedUpdates,
      messageHistory: [...(currentOrder.messageHistory || []), newHistoryEntry],
    };
    return Promise.resolve(orders[orderIndex]);
  }
  return Promise.resolve(undefined);
};

export const addOrder = (
  orderData: OrderFormData,
  itemsData: OrderItem[]
): Promise<Order> => {
  const newOrder: Order = {
    id: `ORD${String(Date.now()).slice(-6)}`, 
    customerName: orderData.customerName,
    phoneNumber: orderData.phoneNumber,
    address: orderData.address,
    city: orderData.city,
    price: parseFloat(orderData.price) || 0,
    currencySymbol: orderData.currencySymbol || 'PKR',
    paymentMethod: orderData.paymentMethod,
    deliveryMethod: orderData.deliveryMethod,
    items: itemsData,
    orderTimestamp: new Date().toISOString(),
    messageStatus: MessageStatus.PENDING, 
    appStatus: OrderAppStatus.PENDING_CONFIRMATION,
    messageHistory: [{
        timestamp: new Date().toISOString(),
        type: 'System: Order Created',
        contentSnippet: 'Order created in system.',
        actor: "User: Create Form"
    }],
    messageSentTimestamp: undefined,
    trackingNumber: undefined,
    tcsStatusHistory: [],
    latestTCSStatus: undefined,
    outForDeliveryMsgSent: false,
    addressNeededMsgSent: false,
    lastNotifiedStatusText: undefined,
    lastNotifiedTimestamp: undefined,
    failedDeliveryAttempts: 0,
    actionNeeded: false,
  };
  orders = [newOrder, ...orders]; 
  return Promise.resolve(newOrder);
};

export const editOrder = (
  orderId: string,
  orderData: Partial<OrderFormData>, 
  itemsData?: OrderItem[]
): Promise<Order | undefined> => {
  const orderIndex = orders.findIndex(o => o.id === orderId);
  if (orderIndex !== -1) {
    const existingOrder = orders[orderIndex];
    const updatedOrder: Order = {
      ...existingOrder,
      ...(orderData.customerName && { customerName: orderData.customerName }),
      ...(orderData.phoneNumber && { phoneNumber: orderData.phoneNumber }),
      ...(orderData.address && { address: orderData.address }),
      ...(orderData.city && { city: orderData.city }),
      ...(orderData.price && { price: parseFloat(orderData.price) || existingOrder.price }),
      ...(orderData.currencySymbol && { currencySymbol: orderData.currencySymbol }),
      ...(orderData.paymentMethod && { paymentMethod: orderData.paymentMethod }),
      ...(orderData.deliveryMethod && { deliveryMethod: orderData.deliveryMethod }),
      ...(itemsData && { items: itemsData }),
    };

    const historyEntry: MessageHistoryEntry = {
        timestamp: new Date().toISOString(),
        type: "User: Order Edited",
        contentSnippet: "Order details modified by user.",
        actor: "User: Edit Form"
      };
    updatedOrder.messageHistory = [...(updatedOrder.messageHistory || []), historyEntry];
    orders[orderIndex] = updatedOrder;
    return Promise.resolve(updatedOrder);
  }
  return Promise.resolve(undefined);
};

export const fetchAndUpdateTCSStatus = (trackingNumber: string): Promise<Order | undefined> => {
  const orderIndex = orders.findIndex(o => o.trackingNumber === trackingNumber && o.appStatus !== OrderAppStatus.DELIVERED && o.appStatus !== OrderAppStatus.CANCELLED && o.appStatus !== OrderAppStatus.ARCHIVED);
  if (orderIndex === -1) {
    return Promise.resolve(undefined); 
  }

  const currentOrder = orders[orderIndex];
  const mockUpdates = MOCK_TCS_STATUS_UPDATES[trackingNumber] || [];
  
  let statusChangedForHistory = false;
  let newStatusTextForHistory = '';

  if (mockUpdates.length === 0 && (!currentOrder.tcsStatusHistory || currentOrder.tcsStatusHistory.length === 0) ) {
     const initialStatus: TCSStatusUpdate = {
        timestamp: new Date().toLocaleDateString('en-GB').replace(/\//g, '-') + " " + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit'}),
        statusText: "Booked",
        fullLog: `${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit'})} - Booked`
     };
     currentOrder.tcsStatusHistory = [initialStatus];
     currentOrder.latestTCSStatus = initialStatus.statusText;
     statusChangedForHistory = true;
     newStatusTextForHistory = initialStatus.statusText;
  } else if (mockUpdates.length > 0) {
    const lastKnownStatusLog = currentOrder.latestTCSStatus ? currentOrder.tcsStatusHistory?.find(s => s.statusText === currentOrder.latestTCSStatus)?.fullLog : null;
    
    let nextUpdateIndex = -1;
    if (lastKnownStatusLog) {
        const currentMockUpdateIndex = mockUpdates.findIndex(u => u.fullLog === lastKnownStatusLog);
        if (currentMockUpdateIndex !== -1 && currentMockUpdateIndex < mockUpdates.length - 1) {
            nextUpdateIndex = currentMockUpdateIndex + 1;
        }
    } else if (mockUpdates.length > 0) { 
        nextUpdateIndex = 0;
    }

    if (nextUpdateIndex !== -1) {
        const newStatusUpdate = mockUpdates[nextUpdateIndex];
        currentOrder.tcsStatusHistory = [...(currentOrder.tcsStatusHistory || []), newStatusUpdate];
        currentOrder.latestTCSStatus = newStatusUpdate.statusText;
        statusChangedForHistory = true;
        newStatusTextForHistory = newStatusUpdate.statusText;
    }
  }

  if (statusChangedForHistory && newStatusTextForHistory) {
    const historyEntry: MessageHistoryEntry = {
      timestamp: new Date().toISOString(),
      type: `TCS: Status Polled - ${newStatusTextForHistory}`,
      contentSnippet: `Courier status changed to: ${newStatusTextForHistory}`,
      actor: "System: TCS Polling"
    };
    currentOrder.messageHistory = [...(currentOrder.messageHistory || []), historyEntry];
  }

  // Update appStatus based on latestTCSStatus if not already delivered/cancelled/archived
  if (currentOrder.appStatus !== OrderAppStatus.DELIVERED && 
      currentOrder.appStatus !== OrderAppStatus.CANCELLED && 
      currentOrder.appStatus !== OrderAppStatus.ARCHIVED &&
      currentOrder.latestTCSStatus) {
        
    const lowerStatus = currentOrder.latestTCSStatus.toLowerCase();
    if (lowerStatus.includes(STATUS_KEYWORDS.DELIVERED.toLowerCase())) {
      currentOrder.appStatus = OrderAppStatus.DELIVERED;
    } else if (lowerStatus.includes(STATUS_KEYWORDS.OUT_FOR_DELIVERY.toLowerCase())) {
      currentOrder.appStatus = OrderAppStatus.OUT_FOR_DELIVERY;
    } else if (lowerStatus.includes(STATUS_KEYWORDS.ADDRESS_NEEDED.toLowerCase()) || lowerStatus.includes(STATUS_KEYWORDS.INCOMPLETE_ADDRESS.toLowerCase()) || lowerStatus.includes(STATUS_KEYWORDS.RECIPIENT_PREMISES_CLOSED.toLowerCase()) || lowerStatus.includes(STATUS_KEYWORDS.NO_ANSWER.toLowerCase())) {
      currentOrder.appStatus = OrderAppStatus.ADDRESS_ISSUE;
    } else if (currentOrder.appStatus !== OrderAppStatus.DISPATCHED && currentOrder.appStatus !== OrderAppStatus.PROCESSING) { 
       currentOrder.appStatus = OrderAppStatus.IN_TRANSIT;
    }
  }

  orders[orderIndex] = { ...currentOrder };
  return Promise.resolve(orders[orderIndex]);
};

export const getDashboardMetrics = (): Promise<DashboardMetrics> => {
  const activeOrders = orders.filter(o => o.appStatus !== OrderAppStatus.ARCHIVED); // Metrics for non-archived orders
  const relevantTransitStatuses = [
    OrderAppStatus.IN_TRANSIT,
    OrderAppStatus.DISPATCHED, 
    OrderAppStatus.OUT_FOR_DELIVERY,
    OrderAppStatus.ADDRESS_ISSUE
  ];

  const metrics: DashboardMetrics = {
    totalOrders: activeOrders.length,
    pendingConfirmation: activeOrders.filter(o => o.appStatus === OrderAppStatus.PENDING_CONFIRMATION).length,
    processing: activeOrders.filter(o => o.appStatus === OrderAppStatus.PROCESSING).length,
    dispatched: activeOrders.filter(o => o.appStatus === OrderAppStatus.DISPATCHED).length,
    outForDelivery: activeOrders.filter(o => o.appStatus === OrderAppStatus.OUT_FOR_DELIVERY).length,
    addressIssue: activeOrders.filter(o => o.appStatus === OrderAppStatus.ADDRESS_ISSUE).length,
    delivered: activeOrders.filter(o => o.appStatus === OrderAppStatus.DELIVERED).length,
    cancelled: activeOrders.filter(o => o.appStatus === OrderAppStatus.CANCELLED).length,
    archived: orders.filter(o => o.appStatus === OrderAppStatus.ARCHIVED).length, // Count all archived
    ordersCreatedLast7Days: [],
    departedFromFacility: activeOrders.filter(o => 
        relevantTransitStatuses.includes(o.appStatus) &&
        o.latestTCSStatus && 
        o.latestTCSStatus.toLowerCase().includes(STATUS_KEYWORDS.DEPARTED.toLowerCase())
    ).length,
    shipmentPickedUp: activeOrders.filter(o => 
        relevantTransitStatuses.includes(o.appStatus) &&
        o.latestTCSStatus && 
        (o.latestTCSStatus.toLowerCase().includes(STATUS_KEYWORDS.BOOKED.toLowerCase()) || o.latestTCSStatus.toLowerCase().includes('picked up') || o.latestTCSStatus.toLowerCase().includes('arrived at origin'))
    ).length,
    scheduledNextCycle: activeOrders.filter(o => 
        relevantTransitStatuses.includes(o.appStatus) &&
        o.latestTCSStatus && 
        o.latestTCSStatus.toLowerCase().includes('scheduled for the next delivery cycle')
    ).length,
  };

  const today = new Date();
  const dailyCounts: { [key: string]: number } = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateString = d.toISOString().split('T')[0]; 
    dailyCounts[dateString] = 0;
  }

  activeOrders.forEach(order => {
    const orderDate = new Date(order.orderTimestamp).toISOString().split('T')[0];
    if (dailyCounts[orderDate] !== undefined) {
      dailyCounts[orderDate]++;
    }
  });
  
  metrics.ordersCreatedLast7Days = Object.entries(dailyCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());


  return Promise.resolve(metrics);
};

export const markOrderAsCancelled = (orderId: string): Promise<Order | undefined> => {
  const orderIndex = orders.findIndex(o => o.id === orderId);
  if (orderIndex !== -1) {
    orders[orderIndex].appStatus = OrderAppStatus.CANCELLED;
    orders[orderIndex].messageStatus = MessageStatus.PENDING; 
    
    const historyEntry: MessageHistoryEntry = {
        timestamp: new Date().toISOString(),
        type: "User: Order Cancelled",
        contentSnippet: "Marked as cancelled, pending notification.",
        actor: "User: Action Button"
    };
    orders[orderIndex].messageHistory = [...(orders[orderIndex].messageHistory || []), historyEntry];
    
    return Promise.resolve(orders[orderIndex]);
  }
  return Promise.resolve(undefined);
};

export const resetAllOrders = (): Promise<void> => {
  orders = JSON.parse(JSON.stringify(INITIAL_ORDERS.map(o => ({...o, messageHistory: o.messageHistory || [] }))));
  return Promise.resolve();
};

export const simulateCustomerConfirmation = (orderId: string): Promise<Order | undefined> => {
  const orderIndex = orders.findIndex(o => o.id === orderId);
  if (orderIndex !== -1) {
    const order = orders[orderIndex];
    if (order.appStatus === OrderAppStatus.PENDING_CONFIRMATION && 
        (order.messageStatus === MessageStatus.CONFIRMATION_SENT || order.messageStatus === MessageStatus.SENT)) { 
      
      order.appStatus = OrderAppStatus.PROCESSING;
      order.messageStatus = MessageStatus.CUSTOMER_CONFIRMED;

      const historyEntry: MessageHistoryEntry = {
        timestamp: new Date().toISOString(),
        type: "User: Order Confirmed (Simulated)",
        contentSnippet: "Order confirmed by customer via simulated action.",
        actor: "User: Simulate Confirmation"
      };
      order.messageHistory = [...(order.messageHistory || []), historyEntry];
      orders[orderIndex] = order;
      return Promise.resolve(order);
    }
  }
  return Promise.resolve(undefined);
};

// --- BULK ACTIONS ---
export const bulkUpdateStatus = async (orderIds: string[], newAppStatus: OrderAppStatus, messageStatus: MessageStatus, actor: string): Promise<Order[]> => {
  const updatedOrders: Order[] = [];
  for (const id of orderIds) {
    const orderIndex = orders.findIndex(o => o.id === id);
    if (orderIndex !== -1 && orders[orderIndex].appStatus !== OrderAppStatus.ARCHIVED) {
      const originalAppStatus = orders[orderIndex].appStatus;
      orders[orderIndex].appStatus = newAppStatus;
      orders[orderIndex].messageStatus = messageStatus; 
      
      const historyEntry: MessageHistoryEntry = {
        timestamp: new Date().toISOString(),
        type: `${actor}: Bulk status change to ${newAppStatus}`,
        contentSnippet: `Order status changed from ${originalAppStatus} to ${newAppStatus}.`,
        actor: actor
      };
      orders[orderIndex].messageHistory = [...(orders[orderIndex].messageHistory || []), historyEntry];
      updatedOrders.push(orders[orderIndex]);
    }
  }
  return Promise.resolve(updatedOrders);
};

export const bulkArchiveOrders = async (orderIds: string[], actor: string): Promise<Order[]> => {
    return bulkUpdateStatus(orderIds, OrderAppStatus.ARCHIVED, MessageStatus.NOTIFIED, actor); 
};