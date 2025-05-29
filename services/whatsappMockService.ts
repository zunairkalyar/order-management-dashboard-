
import { GeneratedMessage } from '../types';
import { BASE_API_URL } from '../../apiConfig'; // Import for endpoint examples

// Simulate normalizePhoneNumberForPakistan from Utilities.gs
function normalizePhoneNumberForPakistan(phoneNumber: string): string | null {
  if (phoneNumber === null || typeof phoneNumber === 'undefined') {
    return null;
  }
  let phoneStr = String(phoneNumber).replace(/\D/g, ""); // Remove non-digits

  if (phoneStr.startsWith("0")) {
    phoneStr = phoneStr.substring(1);
  }

  if (phoneStr.length === 10 && !phoneStr.startsWith("92")) {
    return "92" + phoneStr;
  } else if (phoneStr.startsWith("92") && phoneStr.length === 12) {
    return phoneStr;
  } else if (phoneStr.startsWith("920") && phoneStr.length === 13) { // e.g. 920300...
    return "92" + phoneStr.substring(3);
  }
  return null; 
}

/**
 * @purpose Sends a WhatsApp message via a backend service.
 * @backend_api_endpoint POST ${BASE_API_URL}/whatsapp/send-message
 * @request_body { phoneNumber: string, messageText: string, (optionally API provider specific config if not managed server-side) }
 * @response_body { success: boolean, messageId?: string, error?: string }
 * @note Currently a mock implementation. The backend would handle the actual interaction with the WhatsApp API provider.
 */
export const sendWhatsappMessage = (phoneNumber: string, messageText: string): Promise<{ success: boolean; message: GeneratedMessage | null }> => {
  return new Promise((resolve) => {
    const normalizedPhone = normalizePhoneNumberForPakistan(phoneNumber);
    if (!normalizedPhone) {
      console.warn(`WhatsApp Mock: Invalid phone number ${phoneNumber}. Message not sent.`);
      resolve({ success: false, message: null });
      return;
    }

    console.log(`WhatsApp Mock: Sending message to ${normalizedPhone}`);
    console.log(`Message Type: Generic (actual type not passed to this mock)`);
    console.log(`Content:\n${messageText}`);
    
    // Simulate API call delay
    setTimeout(() => {
      // Simulate success/failure (e.g., 90% success rate)
      const isSuccess = Math.random() < 0.95;
      if (isSuccess) {
        console.log(`WhatsApp Mock: Message to ${normalizedPhone} sent successfully (simulated).`);
        resolve({ success: true, message: { type: 'NewOrder', content: messageText, recipient: normalizedPhone } }); // Type is placeholder
      } else {
        console.warn(`WhatsApp Mock: Failed to send message to ${normalizedPhone} (simulated failure).`);
        resolve({ success: false, message: null });
      }
    }, 500);
  });
};
