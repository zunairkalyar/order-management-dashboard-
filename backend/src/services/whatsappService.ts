import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PushFlowResponse {
  id?: string;
  status: string; // Assuming PushFlow uses a 'status' field like 'success', 'queued', 'failed'
  message?: string; // Optional message from API
  error?: string; // Optional error message from API
}

export class WhatsAppService {
  private apiUrl: string;
  private instanceId: string;
  private accessToken: string;

  constructor() {
    // Use environment variables for PushFlow credentials
    this.apiUrl = process.env.PUSHFLOW_API_URL || 'https://btn.pushflow.xyz/api/send';
    this.instanceId = process.env.PUSHFLOW_INSTANCE_ID || '';
    this.accessToken = process.env.PUSHFLOW_ACCESS_TOKEN || '';

    if (!this.instanceId || !this.accessToken) {
      console.error('PushFlow Instance ID or Access Token not configured.');
      // Depending on requirements, you might want to throw an error or handle this differently
    }
  }

  async sendMessage(phoneNumber: string, message: string): Promise<{ success: boolean; data: any }> {
    let messageLog; // Declare messageLog here to be accessible in catch block
    try {
      // Normalize phone number (assuming Pakistan format based on image)
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
      if (!normalizedPhone) {
        console.error(`Invalid phone number format: ${phoneNumber}`);
        // Log the failure
        await this.logMessage({
          phoneNumber,
          message,
          status: 'FAILED',
          error: 'Invalid phone number format',
          // createdAt will be set by the database default
        });
        return { success: false, data: { error: 'Invalid phone number format' } };
      }

      // Log attempt
      messageLog = await this.logMessage({
        phoneNumber: normalizedPhone,
        message,
        status: 'SENDING',
        // createdAt will be set by the database default
      });

      // Make API request to PushFlow
      const response = await axios.post<PushFlowResponse>(
        this.apiUrl,
        {
          number: normalizedPhone, // Use normalized number
          type: 'text',
          message: message,
          instance_id: this.instanceId,
          access_token: this.accessToken
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Process response from PushFlow
      const pushflowResponse = response.data;
      const isSuccess = pushflowResponse.status === 'success' || pushflowResponse.status === 'queued'; // Assuming 'success' or 'queued' indicates successful processing by PushFlow

      // Update message log based on PushFlow response
      await this.updateMessageLog(messageLog.id, {
        status: isSuccess ? 'SENT' : 'FAILED', // Use 'SENT' for successful API call, 'FAILED' otherwise
        metadata: {
          pushflowResponse: pushflowResponse,
          messageId: pushflowResponse.id // Log the message ID if provided by PushFlow
        },
        // createdAt is not updated
      });

      if (!isSuccess) {
        console.error('PushFlow API returned non-success status:', pushflowResponse);
      }

      return {
        success: isSuccess,
        data: pushflowResponse
      };

    } catch (error: any) {
      console.error('WhatsApp send error:', error.response?.data || error.message);

      // Log error
      // Check if messageLog was created before attempting to update
      if (messageLog) {
         await this.updateMessageLog(messageLog.id, {
          status: 'FAILED',
          error: error.response?.data?.message || error.message,
          metadata: {
             pushflowResponse: error.response?.data // Log the full error response if available
          },
           // createdAt is not updated
        });
      } else {
         // If messageLog wasn't created (e.g., invalid phone number), log a new entry
         await this.logMessage({
          phoneNumber,
          message,
          status: 'FAILED',
          error: error.response?.data?.message || error.message,
          metadata: {
             pushflowResponse: error.response?.data // Log the full error response if available
          },
           // createdAt will be set by the database default
        });
      }

      return {
        success: false,
        data: {
          error: error.response?.data?.message || error.message
        }
      };
    }
  }

  // Basic phone number normalization for Pakistan (adapt if needed for other countries)
  private normalizePhoneNumber(phoneNumber: string): string | null {
    if (!phoneNumber) return null;

    // Remove all non-digits
    let normalizedNumber = phoneNumber.replace(/\D/g, '');

    // If starts with 0, replace with 92
    if (normalizedNumber.startsWith('0')) {
      normalizedNumber = '92' + normalizedNumber.slice(1);
    }

    // Basic validation: should start with 92 and have a total length of 12 digits
    if (normalizedNumber.length !== 12 || !normalizedNumber.startsWith('92')) {
      return null; // Invalid format
    }

    return normalizedNumber;
  }

  private async logMessage(logData: any) {
    try {
      const createdLog = await prisma.messageLog.create({
        data: {
          phoneNumber: logData.phoneNumber,
          message: logData.message,
          status: logData.status,
          metadata: logData.metadata || {},
          // createdAt is set by @default(now()) in schema
        }
      });
      console.log('Message log created:', createdLog);
      return createdLog; // Return the created log object
    } catch (error) {
      console.error('Error creating message log:', error);
      throw error; // Re-throw to be caught by the main try/catch
    }
  }

  private async updateMessageLog(id: string, updateData: any) {
    try {
      const updatedLog = await prisma.messageLog.update({
        where: { id },
        data: {
          status: updateData.status,
          metadata: updateData.metadata || {},
          error: updateData.error || null // Add error field update
          // createdAt is not updated
        }
      });
      console.log('Message log updated:', updatedLog);
      return updatedLog; // Return the updated log object
    } catch (error) {
      console.error(`Error updating message log ${id}:`, error);
      throw error; // Re-throw to be caught by the main try/catch
    }
  }
}

export const whatsAppService = new WhatsAppService();
