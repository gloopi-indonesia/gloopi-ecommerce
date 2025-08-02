import axios, { AxiosInstance } from 'axios';
import { prisma } from '@/lib/prisma';
import { CommunicationType, CommunicationDirection, CommunicationStatus } from '@prisma/client';

// WhatsApp Business API types
export interface WhatsAppMessage {
  messaging_product: 'whatsapp';
  to: string;
  type: 'template' | 'text';
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: Array<{
      type: string;
      parameters: Array<{
        type: string;
        text: string;
      }>;
    }>;
  };
  text?: {
    body: string;
  };
}

export interface WhatsAppResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

export interface WhatsAppWebhook {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text: {
            body: string;
          };
          type: string;
        }>;
        statuses?: Array<{
          id: string;
          status: 'sent' | 'delivered' | 'read' | 'failed';
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

export interface MessageTemplate {
  name: string;
  language: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  components: Array<{
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
    format?: 'TEXT' | 'MEDIA';
    text?: string;
    buttons?: Array<{
      type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
      text: string;
      url?: string;
      phone_number?: string;
    }>;
  }>;
}

// Indonesian phone number validation and formatting
export class PhoneNumberValidator {
  private static readonly INDONESIAN_PREFIXES = [
    '08', '62', '+62'
  ];

  private static readonly MOBILE_PREFIXES = [
    '811', '812', '813', '814', '815', '816', '817', '818', '819', // Telkomsel
    '821', '822', '823', '852', '853', // Indosat
    '831', '832', '833', '838', // Axis
    '855', '856', '857', '858', // Indosat
    '877', '878', // XL
    '881', '882', '883', '884', '885', '886', '887', '888', // Smartfren
    '895', '896', '897', '898', '899', // Three
  ];

  static validateIndonesianNumber(phoneNumber: string): boolean {
    const cleaned = this.cleanPhoneNumber(phoneNumber);
    
    // Check if it starts with Indonesian prefix
    const hasValidPrefix = this.INDONESIAN_PREFIXES.some(prefix => 
      cleaned.startsWith(prefix)
    );
    
    if (!hasValidPrefix) return false;

    // Format to standard format and check mobile prefixes
    const formatted = this.formatToInternational(cleaned);
    const withoutCountryCode = formatted.replace('+62', '');
    
    return this.MOBILE_PREFIXES.some(prefix => 
      withoutCountryCode.startsWith(prefix)
    );
  }

  static cleanPhoneNumber(phoneNumber: string): string {
    return phoneNumber.replace(/[\s\-()]/g, '');
  }

  static formatToInternational(phoneNumber: string): string {
    const cleaned = this.cleanPhoneNumber(phoneNumber);
    
    // Already in international format
    if (cleaned.startsWith('+62')) {
      return cleaned;
    }
    
    // Starts with 62
    if (cleaned.startsWith('62')) {
      return `+${cleaned}`;
    }
    
    // Starts with 08 (local format)
    if (cleaned.startsWith('08')) {
      return `+62${cleaned.substring(1)}`;
    }
    
    // Assume it's missing country code
    return `+62${cleaned}`;
  }

  static formatForDisplay(phoneNumber: string): string {
    const international = this.formatToInternational(phoneNumber);
    const withoutPlus = international.replace('+62', '');
    
    // Format as: 0812-3456-7890
    if (withoutPlus.length >= 10) {
      return `0${withoutPlus.substring(0, 3)}-${withoutPlus.substring(3, 7)}-${withoutPlus.substring(7)}`;
    }
    
    return international;
  }
}

export class WhatsAppService {
  private client: AxiosInstance;
  private phoneNumberId: string;
  private accessToken: string;
  private webhookVerifyToken: string;

  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.webhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '';

    this.client = axios.create({
      baseURL: `https://graph.facebook.com/v18.0/${this.phoneNumberId}`,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Send a template message to a customer
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    parameters: Record<string, string> = {},
    customerId?: string,
    quotationId?: string,
    adminUserId?: string
  ): Promise<string> {
    try {
      // Validate and format phone number
      if (!PhoneNumberValidator.validateIndonesianNumber(to)) {
        throw new Error(`Invalid Indonesian phone number: ${to}`);
      }

      const formattedPhone = PhoneNumberValidator.formatToInternational(to);
      const whatsappNumber = formattedPhone.replace('+', '');

      // Build template components with parameters
      const components = Object.keys(parameters).length > 0 ? [{
        type: 'body',
        parameters: Object.values(parameters).map(value => ({
          type: 'text',
          text: value
        }))
      }] : undefined;

      const message: WhatsAppMessage = {
        messaging_product: 'whatsapp',
        to: whatsappNumber,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'id' // Indonesian language code
          },
          components
        }
      };

      const response = await this.client.post<WhatsAppResponse>('/messages', message);
      const messageId = response.data.messages[0]?.id;

      // Log the communication in database
      if (customerId && adminUserId) {
        await this.logCommunication({
          customerId,
          quotationId,
          type: CommunicationType.WHATSAPP,
          direction: CommunicationDirection.OUTBOUND,
          content: `Template: ${templateName} | Parameters: ${JSON.stringify(parameters)}`,
          status: CommunicationStatus.SENT,
          externalId: messageId,
          adminUserId
        });
      }

      return messageId || '';
    } catch (error) {
      console.error('WhatsApp template message failed:', error);
      
      // Log failed communication
      if (customerId && adminUserId) {
        await this.logCommunication({
          customerId,
          quotationId,
          type: CommunicationType.WHATSAPP,
          direction: CommunicationDirection.OUTBOUND,
          content: `Failed template: ${templateName} | Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          status: CommunicationStatus.FAILED,
          adminUserId
        });
      }
      
      throw error;
    }
  }

  /**
   * Send a text message to a customer
   */
  async sendTextMessage(
    to: string,
    message: string,
    customerId?: string,
    quotationId?: string,
    adminUserId?: string
  ): Promise<string> {
    try {
      // Validate and format phone number
      if (!PhoneNumberValidator.validateIndonesianNumber(to)) {
        throw new Error(`Invalid Indonesian phone number: ${to}`);
      }

      const formattedPhone = PhoneNumberValidator.formatToInternational(to);
      const whatsappNumber = formattedPhone.replace('+', '');

      const whatsappMessage: WhatsAppMessage = {
        messaging_product: 'whatsapp',
        to: whatsappNumber,
        type: 'text',
        text: {
          body: message
        }
      };

      const response = await this.client.post<WhatsAppResponse>('/messages', whatsappMessage);
      const messageId = response.data.messages[0]?.id;

      // Log the communication in database
      if (customerId && adminUserId) {
        await this.logCommunication({
          customerId,
          quotationId,
          type: CommunicationType.WHATSAPP,
          direction: CommunicationDirection.OUTBOUND,
          content: message,
          status: CommunicationStatus.SENT,
          externalId: messageId,
          adminUserId
        });
      }

      return messageId || '';
    } catch (error) {
      console.error('WhatsApp text message failed:', error);
      
      // Log failed communication
      if (customerId && adminUserId) {
        await this.logCommunication({
          customerId,
          quotationId,
          type: CommunicationType.WHATSAPP,
          direction: CommunicationDirection.OUTBOUND,
          content: `Failed message: ${message} | Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          status: CommunicationStatus.FAILED,
          adminUserId
        });
      }
      
      throw error;
    }
  }

  /**
   * Handle incoming WhatsApp webhook
   */
  async handleIncomingWebhook(payload: WhatsAppWebhook): Promise<void> {
    try {
      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          const { value } = change;

          // Handle incoming messages
          if (value.messages) {
            for (const message of value.messages) {
              await this.handleIncomingMessage(message, value.contacts?.[0]);
            }
          }

          // Handle message status updates
          if (value.statuses) {
            for (const status of value.statuses) {
              await this.handleMessageStatus(status);
            }
          }
        }
      }
    } catch (error) {
      console.error('WhatsApp webhook handling failed:', error);
      throw error;
    }
  }

  /**
   * Verify webhook token
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.webhookVerifyToken) {
      return challenge;
    }
    return null;
  }

  /**
   * Get predefined message templates for common scenarios
   */
  getMessageTemplates(): Record<string, MessageTemplate> {
    return {
      quotation_approved: {
        name: 'quotation_approved',
        language: 'id',
        category: 'UTILITY',
        components: [
          {
            type: 'BODY',
            text: 'Halo {{1}}, penawaran Anda dengan nomor {{2}} telah disetujui. Total: {{3}}. Silakan konfirmasi untuk melanjutkan ke pesanan.'
          }
        ]
      },
      quotation_follow_up: {
        name: 'quotation_follow_up',
        language: 'id',
        category: 'MARKETING',
        components: [
          {
            type: 'BODY',
            text: 'Halo {{1}}, kami ingin mengingatkan tentang penawaran sarung tangan Anda ({{2}}). Apakah Anda memerlukan informasi tambahan?'
          }
        ]
      },
      order_shipped: {
        name: 'order_shipped',
        language: 'id',
        category: 'UTILITY',
        components: [
          {
            type: 'BODY',
            text: 'Pesanan Anda {{1}} telah dikirim dengan nomor resi {{2}}. Terima kasih telah mempercayai Gloopi!'
          }
        ]
      },
      payment_reminder: {
        name: 'payment_reminder',
        language: 'id',
        category: 'UTILITY',
        components: [
          {
            type: 'BODY',
            text: 'Halo {{1}}, invoice {{2}} dengan total {{3}} akan jatuh tempo pada {{4}}. Mohon segera lakukan pembayaran.'
          }
        ]
      }
    };
  }

  /**
   * Create a new message template (requires Facebook approval)
   */
  async createMessageTemplate(template: MessageTemplate): Promise<void> {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`,
        template,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('Template created:', response.data);
    } catch (error) {
      console.error('Template creation failed:', error);
      throw error;
    }
  }

  /**
   * Log communication in database
   */
  private async logCommunication(data: {
    customerId: string;
    quotationId?: string;
    type: CommunicationType;
    direction: CommunicationDirection;
    content: string;
    status: CommunicationStatus;
    externalId?: string;
    adminUserId: string;
  }): Promise<void> {
    try {
      await prisma.communication.create({
        data: {
          customerId: data.customerId,
          quotationId: data.quotationId,
          type: data.type,
          direction: data.direction,
          content: data.content,
          status: data.status,
          externalId: data.externalId,
          adminUserId: data.adminUserId
        }
      });
    } catch (error) {
      console.error('Failed to log communication:', error);
      // Don't throw here to avoid breaking the main flow
    }
  }

  /**
   * Handle incoming message from customer
   */
  private async handleIncomingMessage(
    message: any,
    _contact?: { profile: { name: string }; wa_id: string }
  ): Promise<void> {
    try {
      // Find customer by phone number
      const phoneNumber = PhoneNumberValidator.formatToInternational(message.from);
      const customer = await prisma.customer.findFirst({
        where: {
          phone: {
            in: [
              message.from,
              phoneNumber,
              PhoneNumberValidator.formatForDisplay(phoneNumber)
            ]
          }
        }
      });

      if (customer) {
        // Log incoming message
        await prisma.communication.create({
          data: {
            customerId: customer.id,
            type: CommunicationType.WHATSAPP,
            direction: CommunicationDirection.INBOUND,
            content: message.text?.body || 'Media message',
            status: CommunicationStatus.DELIVERED,
            externalId: message.id,
            adminUserId: 'system' // We'll need to handle this better
          }
        });
      }
    } catch (error) {
      console.error('Failed to handle incoming message:', error);
    }
  }

  /**
   * Handle message status updates
   */
  private async handleMessageStatus(status: any): Promise<void> {
    try {
      // Update communication status based on WhatsApp status
      const communicationStatus = this.mapWhatsAppStatus(status.status);
      
      await prisma.communication.updateMany({
        where: {
          externalId: status.id
        },
        data: {
          status: communicationStatus
        }
      });
    } catch (error) {
      console.error('Failed to handle message status:', error);
    }
  }

  /**
   * Map WhatsApp status to our communication status
   */
  private mapWhatsAppStatus(whatsappStatus: string): CommunicationStatus {
    switch (whatsappStatus) {
      case 'sent':
        return CommunicationStatus.SENT;
      case 'delivered':
        return CommunicationStatus.DELIVERED;
      case 'read':
        return CommunicationStatus.READ;
      case 'failed':
        return CommunicationStatus.FAILED;
      default:
        return CommunicationStatus.SENT;
    }
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();