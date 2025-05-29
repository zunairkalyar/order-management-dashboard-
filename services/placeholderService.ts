
import { Order, AppSettingsConfig } from '../types';
import { TCS_TRACKING_URL_PREFIX } from '../constants';

// Helper from formattingService.ts (or could be moved here/shared)
function getOrderItemsTextList(order: Order): string {
  if (!order.items || order.items.length === 0) {
    return "- _Order items ki tafseel mojood nahi._";
  }
  return order.items.map(item => `- ${item.name} (Qty: ${item.quantity})`).join("\n");
}

export function replacePlaceholders(template: string, order: Order, appSettings: AppSettingsConfig): string {
  let message = template;

  const discountPercentageValue = appSettings.advancePaymentDiscountPercentage || 0;
  const advancePrice = Math.round(order.price * (1 - (discountPercentageValue / 100)));

  const placeholders: Record<string, string | number | undefined> = {
    '{{customerName}}': order.customerName,
    '{{orderId}}': order.id,
    '{{phoneNumber}}': order.phoneNumber,
    '{{address}}': order.address,
    '{{city}}': order.city,
    '{{totalAmount}}': `${order.currencySymbol} ${order.price.toFixed(0)}`,
    '{{currencySymbol}}': order.currencySymbol,
    '{{paymentMethod}}': order.paymentMethod,
    '{{deliveryMethod}}': order.deliveryMethod,
    '{{orderTimestamp}}': new Date(order.orderTimestamp).toLocaleDateString('en-GB'),
    '{{itemsList}}': getOrderItemsTextList(order),
    '{{trackingNumber}}': order.trackingNumber,
    '{{trackingLink}}': order.trackingNumber ? `${TCS_TRACKING_URL_PREFIX}${order.trackingNumber}` : 'N/A',
    '{{latestTCSStatus}}': order.latestTCSStatus,
    
    // Values from appSettings
    '{{advancePaymentPrice}}': `${order.currencySymbol} ${advancePrice.toFixed(0)}`,
    '{{easypaisaNumber}}': appSettings.easypaisaNumber,
    '{{easypaisaName}}': appSettings.easypaisaName,
    '{{discountPercentage}}': discountPercentageValue, // The raw percentage number
  };

  for (const key in placeholders) {
    if (placeholders[key] !== undefined) {
      // Ensure global replacement and escape special characters in placeholder keys
      const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      message = message.replace(new RegExp(escapedKey, 'g'), String(placeholders[key]));
    }
  }

  return message;
}
