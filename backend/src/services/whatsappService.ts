import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class WhatsAppService {
  private apiUrl: string;
  private apiToken: string;

  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || '';
    this.apiToken = process.env.WHATSAPP_API_TOKEN || '';
  }

  async sendMessage(phoneNumber: string, message: string) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Log the full response data
      console.log('WhatsApp API Response:', response.data);

      // Basic check for the mock response structure
      const isMockResponse = (
        (response.data as any) &&
        (response.data as any).type === 'NewOrder' &&
        typeof (response.data as any).content === 'string' &&
        typeof (response.data as any).recipient === 'string'
      );

      let status = 'sent';
      if (isMockResponse) {
        status = 'mocked';
        console.warn('Detected potential mock WhatsApp API response.');
      } else {
        // TODO: Implement proper parsing of the real PushFlow API response
        // Check response.data for actual delivery status indicators (e.g., message_id, status field)
        // Update the 'status' variable based on the real response
        console.log('Assuming real response, status marked as sent. Implement real status check.');
      }

      await this.logMessage({
        phoneNumber,
        message,
        status: status,
        response: response.data, // Log full response in metadata
      });

      return response.data;
    } catch (error: any) {
      console.error('Error sending WhatsApp message:', error.message);
      // Log the full error object if available
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      }

      await this.logMessage({
        phoneNumber,
        message,
        status: 'failed',
        error: error.message,
        response: error.response ? error.response.data : null, // Log error response data
      });
      throw error;
    }
  }

  private async logMessage(logData: any) {
    try {
      await prisma.messageLog.create({
        data: {
          phoneNumber: logData.phoneNumber,
          message: logData.message,
          status: logData.status,
          metadata: logData
        }
      });
    } catch (error) {
      console.error('Error logging message:', error);
    }
  }
}

export const whatsAppService = new WhatsAppService();
