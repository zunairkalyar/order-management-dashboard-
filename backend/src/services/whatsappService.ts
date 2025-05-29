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

      await this.logMessage({
        phoneNumber,
        message,
        status: 'sent',
        response: response.data
      });

      return response.data;
    } catch (error: any) {
      await this.logMessage({
        phoneNumber,
        message,
        status: 'failed',
        error: error.message
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
