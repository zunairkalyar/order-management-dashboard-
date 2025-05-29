export enum OrderType {
  CREATED = 'Order Created',
  CANCELLED = 'Order Cancelled',
  DISPATCHED = 'Order Dispatched',
  TCS_STATUS = 'TCS Order Status', // Represents orders being tracked by TCS
}

export enum MessageStatus {
  PENDING = 'Pending',
  SENT = 'Sent',
  CONFIRMATION_SENT = 'Confirmation Sent',
  NOTIFIED = 'Notified', // For TCS status updates
  ERROR_MISSING_DATA = 'Error: Missing Data',
  ERROR_SENDING_FAILED = 'Error: Sending Failed',
  ERROR_MISSING_CN = 'Error: Missing CN',
  PENDING_TCS_API_FETCH = 'Pending API Fetch',
  CUSTOMER_CONFIRMED = 'Customer Confirmed', // Added for clarity
}

export enum OrderAppStatus { // Consolidated status for dashboard
  PENDING_CONFIRMATION = 'Pending Confirmation', // New order, initial message sent
  PROCESSING = 'Processing', // Confirmed, awaiting dispatch
  DISPATCHED = 'Dispatched', // Dispatch message sent, awaiting TCS updates
  IN_TRANSIT = 'In Transit', // TCS status updated
  OUT_FOR_DELIVERY = 'Out for Delivery',
  ADDRESS_ISSUE = 'Address Issue',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
  ARCHIVED = 'Archived', // New status for bulk action
  UNKNOWN = 'Unknown'
}

export interface OrderItem {
  name: string;
  quantity: number;
}

export interface MessageHistoryEntry {
  timestamp: string;
  type: string; // e.g., "Initial Notification", "Dispatch Alert", "TCS: Out for Delivery"
  contentSnippet: string; // A brief summary or the first few words of the message
  actor?: string; // e.g., "System", "User: Manual Dispatch", "AI", "User: Bulk Archive"
}

export interface Order {
  id: string; // Corresponds to ORDER_ID
  customerName: string;
  phoneNumber: string;
  currencySymbol: string;
  price: number;
  address: string;
  city: string;
  paymentMethod: string;
  orderTimestamp: string; // Date string
  items: OrderItem[];
  messageHistory: MessageHistoryEntry[]; 
  
  messageStatus: MessageStatus; 
  messageSentTimestamp?: string; 
  
  trackingNumber?: string; 
  deliveryMethod?: string;

  tcsStatusHistory?: TCSStatusUpdate[]; 
  latestTCSStatus?: string; 
  outForDeliveryMsgSent?: boolean;
  addressNeededMsgSent?: boolean;
  lastNotifiedStatusText?: string; 
  lastNotifiedTimestamp?: string;
  failedDeliveryAttempts?: number;
  actionNeeded?: boolean;
  appStatus: OrderAppStatus; 
}

export type SortableOrderKeys = 
  | 'id' 
  | 'customerName' 
  | 'price' 
  | 'orderTimestamp' 
  | 'messageSentTimestamp' 
  | 'appStatus'
  | 'phoneNumber'
  | 'paymentMethod'
  | 'deliveryMethod'
  | 'trackingNumber'
  | 'messageStatus'
  | 'city'; // Added city for sorting


export interface TCSStatusUpdate {
  timestamp: string; // e.g., "dd-mm-yyyy HH:MM"
  statusText: string;
  fullLog: string; // e.g. "dd-mm-yyyy HH:MM - Status Text"
}

export interface DashboardMetrics {
  totalOrders: number;
  pendingConfirmation: number;
  processing: number;
  dispatched: number;
  outForDelivery: number;
  addressIssue: number;
  delivered: number;
  cancelled: number;
  archived: number; // New metric
  ordersCreatedLast7Days?: { date: string; count: number }[];
  departedFromFacility: number; 
  shipmentPickedUp: number;   
  scheduledNextCycle: number; 
}

export interface GeneratedMessage {
  type: 'NewOrder' | 'Cancellation' | 'Dispatch' | 'Confirmation' | 'OutOfDelivery' | 'AddressNeeded' | 'ThankYou' | 'GenericTCSUpdate' | 'BatchNotification';
  content: string;
  recipient: string;
}

export interface OrderItemFormData {
  name: string;
  quantity: string; 
}

export interface OrderFormData {
  customerName: string;
  phoneNumber: string;
  address: string;
  city: string;
  price: string; 
  currencySymbol: string;
  paymentMethod: string;
  deliveryMethod: string;
}

export interface WhatsAppAPIConfig {
  apiUrl: string;
  instanceId: string;
  accessToken: string;
}

export interface AppSettingsConfig {
  confirmationDelayHours: number;
  pollingIntervalSeconds: number;
  easypaisaNumber: string; 
  easypaisaName: string;   
  advancePaymentDiscountPercentage: number; 
}

export enum MessageTypeKey {
  NEW_ORDER_INITIAL = 'NEW_ORDER_INITIAL',
  ORDER_CONFIRMATION_REMINDER = 'ORDER_CONFIRMATION_REMINDER',
  ORDER_PROCESSING_CONFIRMED = 'ORDER_PROCESSING_CONFIRMED', // New: After customer confirms, before dispatch
  ORDER_DISPATCH = 'ORDER_DISPATCH',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  COURIER_SHIPMENT_PICKED_UP = 'COURIER_SHIPMENT_PICKED_UP', // New
  COURIER_IN_TRANSIT_UPDATE = 'COURIER_IN_TRANSIT_UPDATE', // New
  TCS_OUT_FOR_DELIVERY = 'TCS_OUT_FOR_DELIVERY',
  TCS_ADDRESS_NEEDED = 'TCS_ADDRESS_NEEDED',
  COURIER_RECIPIENT_PREMISES_CLOSED = 'COURIER_RECIPIENT_PREMISES_CLOSED', // New
  TCS_DELIVERED_THANK_YOU = 'TCS_DELIVERED_THANK_YOU',
  TCS_GENERIC_UPDATE = 'TCS_GENERIC_UPDATE',
  MANUAL_STATUS_CHANGE_NOTIFICATION = 'MANUAL_STATUS_CHANGE_NOTIFICATION', // New: For generic manual status updates
}

export interface CustomMessageDefinition {
  name: string; 
  template: string;
  description: string;
  availablePlaceholders: string[];
}

export type CustomMessagesConfig = Record<MessageTypeKey, CustomMessageDefinition>;

export type ActiveView = 
  | 'DASHBOARD' 
  | 'NEW_ORDERS' // Kept for Dashboard card navigation, but not primary sidebar
  | 'PROCESSING_ORDERS' // Kept for Dashboard card navigation
  | 'DISPATCHED_ORDERS' // Kept for Dashboard card navigation
  | 'CANCELLED_ORDERS' // Kept for Dashboard card navigation
  | 'ARCHIVED_ORDERS' 
  | 'TCS_TRACKING' // Kept for Dashboard card navigation
  | 'CATEGORIZED_ORDER_VIEW' 
  | 'DELIVERED_ORDERS' // Kept for Dashboard card navigation
  | 'WHATSAPP_API_SETTINGS'
  | 'APP_SETTINGS'
  | 'CUSTOM_MESSAGES_SETTINGS'
  | 'COMPREHENSIVE_DATA_VIEW' 
  | 'ABOUT_APP'
  | 'CUSTOMER_LIST'
  | 'AUDIT_TRAIL'
  // Order Status from Store
  | 'STORE_ORDER_CREATED'
  | 'STORE_ORDER_CONFIRMED'
  | 'STORE_ORDER_DISPATCHED_FROM_STORE'
  | 'STORE_ORDER_CANCELLED'
  // Order Status from Courier Service
  | 'COURIER_SHIPMENT_PICKED_UP'
  | 'COURIER_IN_TRANSIT'
  | 'COURIER_OUT_FOR_DELIVERY'
  | 'COURIER_DELIVERED_BY_COURIER'
  | 'COURIER_RECIPIENT_PREMISES_CLOSED'
  | 'COURIER_ADDRESS_ISSUE_BY_COURIER';
  
export interface BreadcrumbItem {
  label: string;
  view?: ActiveView; 
  onClick?: () => void; 
}

export interface FilterCriteria {
  appStatus?: OrderAppStatus | '';
  paymentMethod?: string | '';
  // Add other filter fields here, e.g.:
  // dateFrom?: string;
  // dateTo?: string;
  // city?: string;
}

export interface ChangeStatusModalContext {
  currentView: ActiveView;
}