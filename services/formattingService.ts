
import { Order } from '../types';

// Helper, not in original but useful for constructing {{itemsList}}
function getOrderItemsText(order: Order): string {
  if (!order.items || order.items.length === 0) {
    return "- _Order items ki tafseel mojood nahi._\n";
  }
  return order.items.map(item => `- ${item.name} (Qty: ${item.quantity})`).join("\n") + "\n";
}

// Returns a template string. Placeholders will be filled by placeholderService.
export function formatNewOrderMessageRomanUrduTemplate(): string {
  return `🎉 *Aapka Order Confirm Hogaya Hai!* 🎉\n\n` +
    `Assalam-o-Alaikum {{customerName}},\n` +
    `Aap ka order ID {{orderId}} humain mosool ho gaya hai. Hum jald hi isay process karain gey.\n\n` +
    `📍 *Delivery Address:*\n{{address}}, {{city}}\n\n` +
    `📦 *Order Tafseelat:*\n{{itemsList}}\n` + // itemsList placeholder will handle formatting
    `\n💰 *Payment Options:*\n` +
    `1️⃣ *Cash on Delivery (COD):* {{totalAmount}}\n` +
    `2️⃣ *Advance Payment ({{discountPercentage}}% Discount):* {{advancePaymentPrice}}\n\n` +
    `✨ *Advance Payment ke liye:* ✨\n` +
    `Agar aap {{discountPercentage}}% discount hasil karna chahte hain, to {{advancePaymentPrice}} neeche diye gaye Easypaisa account par bhaijain:\n\n` +
    `   🔵 *Easypaisa Account:*\n` +
    `   Account Number: {{easypaisaNumber}}\n` +
    `   Account Name: {{easypaisaName}}\n\n` +
    `Payment ke baad, transaction ka screenshot isi number par WhatsApp karain. ` +
    `Aap ka order discount ke sath confirm hojayega.\n\n` +
    `Kisi bhi sawal ya mazeed maloomat ke liye, aap hum se isi number par rabta kar sakte hain.\n\n` +
    `Shukriya! 😊`;
}

export function formatOrderCancelMessageRomanUrduTemplate(): string {
  return `❌ *Order Cancellation Ittila* ❌\n\n` +
    `Assalam-o-Alaikum {{customerName}},\n` +
    `Afsos ke sath aap ko ittila di jati hai ke aap ka order ID {{orderId}} cancel kar diya gaya hai.\n\n` +
    `Items:\n{{itemsList}}\n` +
    `\nAgar aap ne koi advance payment ki thi, to aap ka refund 24-48 working hours mein process kar diya jaye ga.\n\n` +
    `Kisi bhi ki pareshani ke liye hum mazrat khwaah hain.\n` +
    `Mazeed maloomat ke liye hum se rabta karein.\n\n` +
    `Shukriya.`;
}

export function formatOrderDispatchMessageRomanUrduTemplate(): string {
  return `🚚 *Aapka Order Dispatch Hogaya Hai!* 📦\n\n` +
    `Assalam-o-Alaikum {{customerName}},\n` +
    `Khushkhabri! Aap ka order ID {{orderId}} dispatch kar diya gaya hai aur jald hi aap ko mosool ho jaye ga.\n\n` +
    `📍 *Delivery Address:*\n{{address}}, {{city}}\n\n` +
    `📦 *Order Tafseelat:*\n{{itemsList}}\n` +
    `\nιχ *Tracking Information:*\n` +
    `Tracking ID (CN): *{{trackingNumber}}*\n` +
    `Aap apna parcel yahan track kar sakte hain:\n` +
    `{{trackingLink}}\n` + // Placeholder for tracking link
    `\nBarah-e-karam apna phone on rakhein takay delivery associate aap se rabta kar sakay.\n` +
    `Delivery ke waqt COD amount tayyar rakhein (agar lagu ho).\n\n` +
    `Kisi bhi sawal ke liye, hum se rabta karein.\n\n` +
    `Shukriya! 😊`;
}

export function formatOrderConfirmationMessageRomanUrduTemplate(): string {
  return `📢 *Order Confirmation Reminder*\n\n` +
    `Assalam-o-Alaikum {{customerName}},\n` +
    `Yeh message aap ke order ID {{orderId}} ki confirmation ke liye hai.\n\n` +
    `Barah-e-karam, apna order confirm karne ke liye is message ka jawab *'Yes'* likh kar dain.\n\n` +
    `Agar aap order cancel karna chahte hain ya koi tabdeeli darkaar hai, to woh bhi humain batayen.\n\n` +
    `Shukriya.`;
}

export function formatOrderProcessingConfirmedMessageRomanUrduTemplate(): string {
  return `✅ *Order Confirmed & Processing Shuru!* ✅\n\n` +
    `Assalam-o-Alaikum {{customerName}},\n` +
    `Aap ka order ID {{orderId}} confirm ho chuka hai aur ab processing mein hai. Hum jald hi isay dispatch karne ki koshish karenge.\n\n` +
    `Order Tafseelat:\n{{itemsList}}\n` +
    `Total Amount: {{totalAmount}}\n\n` +
    `Dispatch ki ittila aap ko jald di jayegi.\n\n` +
    `Shukriya!`;
}

export function formatCourierShipmentPickedUpMessageTemplate(): string {
  return `픽 *Shipment Courier Ne Pick Kar Liya Hai!* 픽\n\n` +
    `Assalam-o-Alaikum {{customerName}},\n` +
    `Aap ka order ID {{orderId}} (Tracking #: {{trackingNumber}}) courier ne pick kar liya hai aur ab yeh {{latestTCSStatus}} status mein hai.\n\n` +
    `Aap apni shipment yahan track kar sakte hain: {{trackingLink}}\n\n` +
    `Shukriya.`;
}

export function formatCourierInTransitMessageTemplate(): string {
  return `✈️ *Shipment Raastay Mein Hai!* ✈️\n\n` +
    `Assalam-o-Alaikum {{customerName}},\n` +
    `Aap ka order ID {{orderId}} (Tracking #: {{trackingNumber}}) ab 'In Transit' hai. Status: {{latestTCSStatus}}.\n\n` +
    `Delivery ki expected date jald update ki jayegi. Tracking Link: {{trackingLink}}\n\n` +
    `Shukriya.`;
}

export function formatCourierPremisesClosedMessageTemplate(): string {
  return `⚠️ *Delivery Attempt - Maqam Band Tha* ⚠️\n\n` +
    `Assalam-o-Alaikum {{customerName}},\n` +
    `Aap ke order ID {{orderId}} (Tracking #: {{trackingNumber}}) ki delivery ki koshish ki gayi thi, lekin maqam band honay ki wajah se deliver nahi ho saka. Status: {{latestTCSStatus}}.\n\n` +
    `Courier company (TCS) jald hi dobara delivery ki koshish karegi. Agar aap kal available nahi hain, to barah-e-karam humein inform karein ya TCS helpline se rabta karein.\n\n` +
    `Tracking Link: {{trackingLink}}\n\n` +
    `Shukriya.`;
}


export function formatOutForDeliveryMessageRomanUrduTemplate(): string {
  return `🛵 *Parcel Delivery Ke Liye Nikal Chuka Hai!* 🛵\n\n` +
    `Assalam-o-Alaikum {{customerName}},\n` +
    `Aap ka order ID {{orderId}} (Tracking #: {{trackingNumber}}) aaj delivery ke liye nikal chuka hai.\n\n` +
    `Delivery rider jald hi aap se rabta karega. Barah-e-karam apna phone on rakhein aur COD amount (agar ho) tayyar rakhein.\n\n` +
    `Tracking Link: {{trackingLink}}\n\n` +
    `Agar koi masla ho to fori hum se rabta karein.\n\n` +
    `Shukriya.`;
}

export function formatAddressInfoNeededMessageRomanUrduTemplate(): string {
  return `⚠️ *Address Ki Maloomat Darkaar Hain!* ⚠️\n\n` +
    `Assalam-o-Alaikum {{customerName}},\n` +
    `Aap ke order ID {{orderId}} (Tracking #: {{trackingNumber}}) ki delivery ke liye courier company (TCS) ko aap ke address ki mazeed/mukammal tafseel darkaar hai.\n\n` +
    `Barah-e-karam, apna *mukammal address* (Makan No, Gali No, Sector/Block, qareebi nishani, aur shehar) is message ke jawab mein jald az jald faraham karein takay aap ka parcel bina kisi takheer ke deliver ho sakay.\n\n` +
    `Maslan: Makan #123, Gali #4, ABC Town, School ke pas, Lahore.\n\n` +
    `Aap ke taawun ka shukriya.`;
}

export function formatThankYouMessageRomanUrduTemplate(): string {
  return `🌟 *Order Delivered - Aapka Bohat Shukriya!* 🌟\n\n` +
    `Assalam-o-Alaikum {{customerName}},\n` +
    `Humein khushi hai ke aap ka order ID {{orderId}} kamyaabi se deliver ho gaya hai!\n\n` +
    `Umeed hai aap apni kharidari se mutmain honge. Agar aap ka koi feedback ya tajweez ho, to zaroor humaray saath share karein. Aap ki raye hamare liye bohat ahmiyat rakhti hai.\n\n` +
    `Future mein bhi aap ki khidmat ka mauqa mile, iski umeed karte hain.\n\n` +
    `Aik bar phir, aap ke اعتماد ka shukriya!\n\n` +
    `Stay Blessed! 😊`;
}

export function formatGenericTCSUpdateMessageRomanUrduTemplate(): string {
  return `ℹ️ *Order Status Update*\n\n` +
  `Assalam-o-Alaikum {{customerName}},\n` +
  `Aapkay order ID {{orderId}} (Tracking #: {{trackingNumber}}) ka status ab "{{latestTCSStatus}}" hai.\n\n`+
  `Tafseelat ke liye, aap tracking link istemal kar sakte hain: {{trackingLink}}\n\n`+
  `Shukriya.`;
}

export function formatManualStatusChangeNotificationTemplate(): string {
  return `📢 *Order Update*\n\n` +
    `Assalam-o-Alaikum {{customerName}},\n` +
    `Aap ke order ID {{orderId}} ka status update ho kar "{{appStatus}}" kar diya gaya hai.\n\n` +
    `Agar aap ke koi sawalat hon, to aap hum se rabta kar sakte hain.\n\n` +
    `Shukriya.`;
}