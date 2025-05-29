
import { Order, MessageStatus, OrderAppStatus, TCSStatusUpdate, MessageTypeKey, CustomMessagesConfig, AppSettingsConfig } from './types';
import { 
  formatNewOrderMessageRomanUrduTemplate,
  formatOrderCancelMessageRomanUrduTemplate,
  formatOrderDispatchMessageRomanUrduTemplate,
  formatOrderConfirmationMessageRomanUrduTemplate,
  formatOutForDeliveryMessageRomanUrduTemplate,
  formatAddressInfoNeededMessageRomanUrduTemplate,
  formatThankYouMessageRomanUrduTemplate,
  formatGenericTCSUpdateMessageRomanUrduTemplate,
  formatOrderProcessingConfirmedMessageRomanUrduTemplate, // New
  formatCourierShipmentPickedUpMessageTemplate, // New
  formatCourierInTransitMessageTemplate, // New
  formatCourierPremisesClosedMessageTemplate, // New
  formatManualStatusChangeNotificationTemplate // New
} from './services/formattingService'; 

export const APP_NAME = "Order Management Dashboard";

export const TCS_TRACKING_URL_PREFIX = "https://www.tcsexpress.com/track/";

export const STATUS_KEYWORDS = {
  OUT_FOR_DELIVERY: 'Out for Delivery',
  ADDRESS_NEEDED: 'Address Information Needed',
  INCOMPLETE_ADDRESS: 'Incomplete Address', 
  DELIVERED: 'Delivered Successfully',
  BOOKED: 'booked',
  ARRIVED: 'arrived at',
  DEPARTED: 'departed from',
  SHIPMENT_DELAY: 'shipment delay',
  RETURN_TO_ORIGIN: 'return to origin',
  ATTEMPTED_DELIVERY: 'delivery attempt',
  RECIPIENT_PREMISES_CLOSED: 'recipient premises closed', // New
  NO_ANSWER: 'no answer', // New
};

const commonPlaceholders = ['{{customerName}}', '{{orderId}}', '{{itemsList}}', '{{totalAmount}}', '{{address}}', '{{city}}', '{{phoneNumber}}'];
const trackingPlaceholders = [...commonPlaceholders, '{{trackingNumber}}', '{{trackingLink}}'];
const tcsStatusPlaceholders = [...trackingPlaceholders, '{{latestTCSStatus}}'];
const newOrderPlaceholders = [...commonPlaceholders, '{{advancePaymentPrice}}', '{{easypaisaNumber}}', '{{easypaisaName}}', '{{discountPercentage}}'];
const manualStatusPlaceholders = ['{{customerName}}', '{{orderId}}', '{{appStatus}}'];


export const DEFAULT_CUSTOM_MESSAGES: CustomMessagesConfig = {
  [MessageTypeKey.NEW_ORDER_INITIAL]: {
    name: "Initial New Order Notification",
    template: formatNewOrderMessageRomanUrduTemplate(), 
    description: "Sent when a new order is created. Includes payment options and discount for advance payment.",
    availablePlaceholders: newOrderPlaceholders,
  },
  [MessageTypeKey.ORDER_CONFIRMATION_REMINDER]: {
    name: "Order Confirmation Reminder",
    template: formatOrderConfirmationMessageRomanUrduTemplate(),
    description: "Sent if the customer hasn't confirmed their order after a set period.",
    availablePlaceholders: commonPlaceholders,
  },
  [MessageTypeKey.ORDER_PROCESSING_CONFIRMED]: {
    name: "Order Processing Confirmed",
    template: formatOrderProcessingConfirmedMessageRomanUrduTemplate(),
    description: "Sent after customer confirms order, before dispatch.",
    availablePlaceholders: commonPlaceholders,
  },
  [MessageTypeKey.ORDER_DISPATCH]: {
    name: "Order Dispatch Notification",
    template: formatOrderDispatchMessageRomanUrduTemplate(),
    description: "Sent when an order is dispatched. Includes tracking information.",
    availablePlaceholders: trackingPlaceholders,
  },
  [MessageTypeKey.ORDER_CANCELLED]: {
    name: "Order Cancellation Notification",
    template: formatOrderCancelMessageRomanUrduTemplate(),
    description: "Sent when an order is cancelled.",
    availablePlaceholders: commonPlaceholders,
  },
  [MessageTypeKey.COURIER_SHIPMENT_PICKED_UP]: {
    name: "Courier: Shipment Picked Up",
    template: formatCourierShipmentPickedUpMessageTemplate(),
    description: "Sent when courier has picked up the shipment.",
    availablePlaceholders: tcsStatusPlaceholders,
  },
  [MessageTypeKey.COURIER_IN_TRANSIT_UPDATE]: {
    name: "Courier: In Transit Update",
    template: formatCourierInTransitMessageTemplate(),
    description: "Sent for generic 'In Transit' updates from the courier.",
    availablePlaceholders: tcsStatusPlaceholders,
  },
  [MessageTypeKey.TCS_OUT_FOR_DELIVERY]: {
    name: "TCS: Out for Delivery",
    template: formatOutForDeliveryMessageRomanUrduTemplate(),
    description: "Sent when TCS status indicates the parcel is out for delivery.",
    availablePlaceholders: trackingPlaceholders,
  },
  [MessageTypeKey.TCS_ADDRESS_NEEDED]: {
    name: "TCS: Address Information Needed",
    template: formatAddressInfoNeededMessageRomanUrduTemplate(),
    description: "Sent when TCS status indicates more address information is needed.",
    availablePlaceholders: trackingPlaceholders,
  },
  [MessageTypeKey.COURIER_RECIPIENT_PREMISES_CLOSED]: {
    name: "Courier: Recipient Premises Closed",
    template: formatCourierPremisesClosedMessageTemplate(),
    description: "Sent if delivery attempt failed because recipient's premises were closed.",
    availablePlaceholders: tcsStatusPlaceholders,
  },
  [MessageTypeKey.TCS_DELIVERED_THANK_YOU]: {
    name: "TCS: Order Delivered - Thank You",
    template: formatThankYouMessageRomanUrduTemplate(),
    description: "Sent after successful delivery to thank the customer and ask for feedback.",
    availablePlaceholders: trackingPlaceholders,
  },
  [MessageTypeKey.TCS_GENERIC_UPDATE]: {
    name: "TCS: Generic Status Update",
    template: formatGenericTCSUpdateMessageRomanUrduTemplate(),
    description: "Sent for other TCS status updates that don't have a specific message type.",
    availablePlaceholders: tcsStatusPlaceholders,
  },
  [MessageTypeKey.MANUAL_STATUS_CHANGE_NOTIFICATION]: {
    name: "Manual Order Status Change",
    template: formatManualStatusChangeNotificationTemplate(),
    description: "Generic notification sent when an order's status is manually changed by a user.",
    availablePlaceholders: manualStatusPlaceholders,
  },
};


export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD001',
    customerName: 'Ahmed Raza',
    phoneNumber: '923001234567',
    currencySymbol: 'PKR',
    price: 2500,
    address: 'House 123, Street 4, Gulberg',
    city: 'Lahore',
    paymentMethod: 'COD',
    orderTimestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
    items: [{ name: 'Wireless Mouse', quantity: 1 }, { name: 'Keyboard', quantity: 1 }],
    messageStatus: MessageStatus.PENDING,
    deliveryMethod: 'TCS',
    appStatus: OrderAppStatus.PENDING_CONFIRMATION,
    messageHistory: [],
  },
  {
    id: 'ORD002',
    customerName: 'Fatima Ali',
    phoneNumber: '923217654321',
    currencySymbol: 'PKR',
    price: 1200,
    address: 'Apt 5B, Block 7, Clifton',
    city: 'Karachi',
    paymentMethod: 'Easypaisa (Advance)',
    orderTimestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), 
    items: [{ name: 'USB Hub', quantity: 1 }],
    messageStatus: MessageStatus.SENT,
    messageSentTimestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    deliveryMethod: 'TCS',
    appStatus: OrderAppStatus.PROCESSING,
    messageHistory: [],
  },
  {
    id: 'ORD003',
    customerName: 'Bilal Khan',
    phoneNumber: '923331122334',
    currencySymbol: 'PKR',
    price: 3500,
    address: 'Plot 87, Sector F-10',
    city: 'Islamabad',
    paymentMethod: 'COD',
    orderTimestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), 
    items: [{ name: 'Monitor Screen 24"', quantity: 1 }],
    messageStatus: MessageStatus.SENT, 
    messageSentTimestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    trackingNumber: 'TCS123456789',
    deliveryMethod: 'TCS',
    latestTCSStatus: 'Arrived at Lahore Sorting Facility',
    tcsStatusHistory: [
      { timestamp: '26-07-2024 10:00', statusText: 'Booked', fullLog: '26-07-2024 10:00 - Booked' },
      { timestamp: '27-07-2024 14:30', statusText: 'Arrived at Lahore Sorting Facility', fullLog: '27-07-2024 14:30 - Arrived at Lahore Sorting Facility' }
    ],
    appStatus: OrderAppStatus.IN_TRANSIT,
    messageHistory: [],
  },
  {
    id: 'ORD004',
    customerName: 'Sana Javed',
    phoneNumber: '923459876543',
    currencySymbol: 'PKR',
    price: 800,
    address: 'Bungalow C-45, PECHS',
    city: 'Karachi',
    paymentMethod: 'COD',
    orderTimestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    items: [{ name: 'Mobile Charger', quantity: 2 }],
    messageStatus: MessageStatus.SENT, 
    messageSentTimestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    trackingNumber: 'TCS987654321',
    latestTCSStatus: STATUS_KEYWORDS.OUT_FOR_DELIVERY,
    tcsStatusHistory: [
        { timestamp: '24-07-2024 10:00', statusText: 'Booked', fullLog: '24-07-2024 10:00 - Booked' },
        { timestamp: '25-07-2024 18:00', statusText: 'Arrived at Karachi Hub', fullLog: '25-07-2024 18:00 - Arrived at Karachi Hub' },
        { timestamp: '28-07-2024 09:00', statusText: STATUS_KEYWORDS.OUT_FOR_DELIVERY, fullLog: `28-07-2024 09:00 - ${STATUS_KEYWORDS.OUT_FOR_DELIVERY}` }
    ],
    appStatus: OrderAppStatus.OUT_FOR_DELIVERY,
    outForDeliveryMsgSent: false, 
    messageHistory: [],
  },
    {
    id: 'ORD005',
    customerName: 'Zainab Ahmed',
    phoneNumber: '923123456789',
    currencySymbol: 'PKR',
    price: 1500,
    address: 'House 789, Phase 5, DHA',
    city: 'Lahore',
    paymentMethod: 'Easypaisa (Advance)', // Changed to Easypaisa
    orderTimestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    items: [{ name: 'Bluetooth Speaker', quantity: 1 }],
    messageStatus: MessageStatus.NOTIFIED, 
    messageSentTimestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    trackingNumber: 'TCS555555555',
    latestTCSStatus: STATUS_KEYWORDS.DELIVERED,
     tcsStatusHistory: [
        { timestamp: '22-07-2024 11:00', statusText: 'Booked', fullLog: '22-07-2024 11:00 - Booked' },
        { timestamp: '23-07-2024 09:30', statusText: STATUS_KEYWORDS.OUT_FOR_DELIVERY, fullLog: `23-07-2024 09:30 - ${STATUS_KEYWORDS.OUT_FOR_DELIVERY}` },
        { timestamp: '23-07-2024 14:00', statusText: STATUS_KEYWORDS.DELIVERED, fullLog: `23-07-2024 14:00 - ${STATUS_KEYWORDS.DELIVERED}` }
    ],
    appStatus: OrderAppStatus.DELIVERED,
    messageHistory: [],
  },
  {
    id: 'ORD006',
    customerName: 'Usman Qureshi',
    phoneNumber: '923012345670',
    currencySymbol: 'PKR',
    price: 950,
    address: 'Office 303, Business Tower',
    city: 'Faisalabad',
    paymentMethod: 'COD',
    orderTimestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    items: [{ name: 'Desk Lamp', quantity: 1 }],
    messageStatus: MessageStatus.SENT, 
    messageSentTimestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    trackingNumber: 'TCSADDRNEED',
    latestTCSStatus: STATUS_KEYWORDS.ADDRESS_NEEDED,
    tcsStatusHistory: [
        { timestamp: '25-07-2024 12:00', statusText: 'Booked', fullLog: '25-07-2024 12:00 - Booked' },
        { timestamp: '26-07-2024 16:00', statusText: STATUS_KEYWORDS.ADDRESS_NEEDED, fullLog: `26-07-2024 16:00 - ${STATUS_KEYWORDS.ADDRESS_NEEDED}` }
    ],
    appStatus: OrderAppStatus.ADDRESS_ISSUE,
    addressNeededMsgSent: false, 
    messageHistory: [],
  },
   {
    id: 'ORD007',
    customerName: 'Aisha Imran',
    phoneNumber: '923228889900',
    currencySymbol: 'PKR',
    price: 2200,
    address: 'Apartment G-5, Park Avenue',
    city: 'Rawalpindi',
    paymentMethod: 'COD',
    orderTimestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    items: [{ name: 'External Hard Drive 1TB', quantity: 1 }],
    messageStatus: MessageStatus.SENT, 
    messageSentTimestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    appStatus: OrderAppStatus.CANCELLED, 
    messageHistory: [],
  },
  {
    id: 'ORD008',
    customerName: 'Kamran Akmal',
    phoneNumber: '923008887766',
    currencySymbol: 'PKR',
    price: 1850,
    address: 'K-Block, Model Town Ext',
    city: 'Lahore',
    paymentMethod: 'COD',
    orderTimestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    items: [{ name: 'Gaming Headset', quantity: 1 }],
    messageStatus: MessageStatus.NOTIFIED,
    messageSentTimestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    trackingNumber: 'TCSOLDDELIVER',
    latestTCSStatus: STATUS_KEYWORDS.DELIVERED,
    appStatus: OrderAppStatus.ARCHIVED, // Example of an archived order
    messageHistory: [
        { timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), type: "System: Order Created", contentSnippet:"Order created", actor: "System" },
        { timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), type: "Store: Dispatch Notification", contentSnippet:"Dispatched", actor: "User: Manual Dispatch" },
        { timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(), type: "TCS: Status - Delivered", contentSnippet:"Delivered", actor: "System" },
        { timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), type: "User: Bulk Archive", contentSnippet:"Order archived by user.", actor: "User: Bulk Action" },
    ],
  }
];

export const MOCK_TCS_STATUS_UPDATES: Record<string, TCSStatusUpdate[]> = {
  'TCS123456789': [ 
    { timestamp: '28-07-2024 09:15', statusText: 'Out for Delivery from Lahore Station', fullLog: '28-07-2024 09:15 - Out for Delivery from Lahore Station'},
    { timestamp: '28-07-2024 15:30', statusText: 'Delivered Successfully', fullLog: '28-07-2024 15:30 - Delivered Successfully'},
  ],
  'TCS987654321': [ 
    { timestamp: '28-07-2024 14:00', statusText: 'Delivered to Customer', fullLog: '28-07-2024 14:00 - Delivered to Customer'},
  ],
  'TCSADDRNEED': [ 
    { timestamp: '27-07-2024 10:00', statusText: STATUS_KEYWORDS.RECIPIENT_PREMISES_CLOSED, fullLog: `27-07-2024 10:00 - ${STATUS_KEYWORDS.RECIPIENT_PREMISES_CLOSED}`}, // Updated for testing
    { timestamp: '27-07-2024 10:05', statusText: 'Delivery Attempted - Address Incomplete', fullLog: '27-07-2024 10:05 - Delivery Attempted - Address Incomplete'},
  ],
  'TCSOLDDELIVER': [
    { timestamp: '15-07-2024 10:00', statusText: 'Booked', fullLog: '15-07-2024 10:00 - Booked' },
    { timestamp: '16-07-2024 14:30', statusText: 'Delivered Successfully', fullLog: '16-07-2024 14:30 - Delivered Successfully' }
  ]
};

export const DEFAULT_CONFIRMATION_DELAY_HOURS = 2; 
export const DEFAULT_POLLING_INTERVAL_SECONDS = 30; 
export const DEFAULT_EASYPAISA_NUMBER = "0312-3456789"; // New Default
export const DEFAULT_EASYPAISA_NAME = "ApnaStore Online";    // New Default
export const DEFAULT_ADVANCE_DISCOUNT_PERCENTAGE = 10; 

export const DEFAULT_APP_SETTINGS: AppSettingsConfig = {
  confirmationDelayHours: DEFAULT_CONFIRMATION_DELAY_HOURS,
  pollingIntervalSeconds: DEFAULT_POLLING_INTERVAL_SECONDS,
  easypaisaNumber: DEFAULT_EASYPAISA_NUMBER,
  easypaisaName: DEFAULT_EASYPAISA_NAME,
  advancePaymentDiscountPercentage: DEFAULT_ADVANCE_DISCOUNT_PERCENTAGE,
};

// For AllDataTable column visibility
export const ALL_DATA_TABLE_COLUMNS: { key: keyof Order | 'itemsSummary', label: string, defaultVisible: boolean }[] = [
  { key: 'id', label: 'Order ID', defaultVisible: true },
  { key: 'customerName', label: 'Customer', defaultVisible: true },
  { key: 'phoneNumber', label: 'Phone', defaultVisible: true },
  { key: 'orderTimestamp', label: 'Order Date', defaultVisible: true },
  { key: 'price', label: 'Price', defaultVisible: true },
  { key: 'address', label: 'Address', defaultVisible: false },
  { key: 'city', label: 'City', defaultVisible: true },
  { key: 'paymentMethod', label: 'Payment Method', defaultVisible: true },
  { key: 'itemsSummary', label: 'Items', defaultVisible: true }, // Special key for combined items
  { key: 'appStatus', label: 'App Status', defaultVisible: true },
  { key: 'messageStatus', label: 'Msg Status', defaultVisible: false },
  { key: 'trackingNumber', label: 'Tracking #', defaultVisible: true },
  { key: 'deliveryMethod', label: 'Delivery Method', defaultVisible: false },
  { key: 'latestTCSStatus', label: 'Latest TCS Status', defaultVisible: false },
  { key: 'messageSentTimestamp', label: 'Last Update', defaultVisible: true },
  // Add more columns as needed from the Order interface
];

export const DEFAULT_VISIBLE_COLUMNS: (keyof Order | 'itemsSummary')[] = ALL_DATA_TABLE_COLUMNS
  .filter(col => col.defaultVisible)
  .map(col => col.key);