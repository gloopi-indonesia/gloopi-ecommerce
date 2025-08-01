import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WhatsAppService, PhoneNumberValidator } from '../whatsapp-service';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    communication: {
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    customer: {
      findFirst: vi.fn(),
    },
  },
}));

describe('PhoneNumberValidator', () => {
  describe('validateIndonesianNumber', () => {
    it('should validate Indonesian mobile numbers correctly', () => {
      // Valid Indonesian numbers
      expect(PhoneNumberValidator.validateIndonesianNumber('081234567890')).toBe(true);
      expect(PhoneNumberValidator.validateIndonesianNumber('+6281234567890')).toBe(true);
      expect(PhoneNumberValidator.validateIndonesianNumber('6281234567890')).toBe(true);
      expect(PhoneNumberValidator.validateIndonesianNumber('08123-456-7890')).toBe(true);

      // Invalid numbers
      expect(PhoneNumberValidator.validateIndonesianNumber('0712345678')).toBe(false); // Not mobile
      expect(PhoneNumberValidator.validateIndonesianNumber('+1234567890')).toBe(false); // Not Indonesian
      expect(PhoneNumberValidator.validateIndonesianNumber('123456')).toBe(false); // Too short
    });
  });

  describe('formatToInternational', () => {
    it('should format phone numbers to international format', () => {
      expect(PhoneNumberValidator.formatToInternational('081234567890')).toBe('+6281234567890');
      expect(PhoneNumberValidator.formatToInternational('6281234567890')).toBe('+6281234567890');
      expect(PhoneNumberValidator.formatToInternational('+6281234567890')).toBe('+6281234567890');
    });
  });

  describe('formatForDisplay', () => {
    it('should format phone numbers for display', () => {
      expect(PhoneNumberValidator.formatForDisplay('081234567890')).toBe('0812-3456-7890');
      expect(PhoneNumberValidator.formatForDisplay('+6281234567890')).toBe('0812-3456-7890');
    });
  });

  describe('cleanPhoneNumber', () => {
    it('should remove formatting characters', () => {
      expect(PhoneNumberValidator.cleanPhoneNumber('0812-345-678')).toBe('0812345678');
      expect(PhoneNumberValidator.cleanPhoneNumber('(0812) 345 678')).toBe('0812345678');
      expect(PhoneNumberValidator.cleanPhoneNumber('0812 345 678')).toBe('0812345678');
    });
  });
});

describe('WhatsAppService', () => {
  let whatsappService: WhatsAppService;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Set up environment variables
    process.env.WHATSAPP_PHONE_NUMBER_ID = 'test_phone_id';
    process.env.WHATSAPP_ACCESS_TOKEN = 'test_token';
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = 'test_verify_token';

    // Mock axios.create
    mockAxiosInstance = {
      post: vi.fn(),
    };
    mockedAxios.create = vi.fn().mockReturnValue(mockAxiosInstance);
    mockedAxios.post = vi.fn();

    whatsappService = new WhatsAppService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('sendTemplateMessage', () => {
    it('should send template message successfully', async () => {
      const mockResponse = {
        data: {
          messaging_product: 'whatsapp',
          contacts: [{ input: '6281234567890', wa_id: '6281234567890' }],
          messages: [{ id: 'msg_123' }],
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const messageId = await whatsappService.sendTemplateMessage(
        '081234567890',
        'quotation_approved',
        { customerName: 'John Doe', quotationNumber: 'Q001' },
        'customer_123',
        'quotation_123',
        'admin_123'
      );

      expect(messageId).toBe('msg_123');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/messages', {
        messaging_product: 'whatsapp',
        to: '6281234567890',
        type: 'template',
        template: {
          name: 'quotation_approved',
          language: { code: 'id' },
          components: [{
            type: 'body',
            parameters: [
              { type: 'text', text: 'John Doe' },
              { type: 'text', text: 'Q001' }
            ]
          }]
        }
      });
    });

    it('should throw error for invalid phone number', async () => {
      await expect(
        whatsappService.sendTemplateMessage(
          '123456',
          'test_template',
          {},
          'customer_123',
          undefined,
          'admin_123'
        )
      ).rejects.toThrow('Invalid Indonesian phone number: 123456');
    });

    it('should handle API errors gracefully', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('API Error'));

      await expect(
        whatsappService.sendTemplateMessage(
          '081234567890',
          'test_template',
          {},
          'customer_123',
          undefined,
          'admin_123'
        )
      ).rejects.toThrow('API Error');
    });
  });

  describe('sendTextMessage', () => {
    it('should send text message successfully', async () => {
      const mockResponse = {
        data: {
          messaging_product: 'whatsapp',
          contacts: [{ input: '6281234567890', wa_id: '6281234567890' }],
          messages: [{ id: 'msg_456' }],
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const messageId = await whatsappService.sendTextMessage(
        '081234567890',
        'Hello, this is a test message',
        'customer_123',
        'quotation_123',
        'admin_123'
      );

      expect(messageId).toBe('msg_456');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/messages', {
        messaging_product: 'whatsapp',
        to: '6281234567890',
        type: 'text',
        text: {
          body: 'Hello, this is a test message'
        }
      });
    });
  });

  describe('verifyWebhook', () => {
    it('should verify webhook with correct token', () => {
      const result = whatsappService.verifyWebhook(
        'subscribe',
        'test_verify_token',
        'challenge_123'
      );

      expect(result).toBe('challenge_123');
    });

    it('should reject webhook with incorrect token', () => {
      const result = whatsappService.verifyWebhook(
        'subscribe',
        'wrong_token',
        'challenge_123'
      );

      expect(result).toBeNull();
    });

    it('should reject webhook with incorrect mode', () => {
      const result = whatsappService.verifyWebhook(
        'unsubscribe',
        'test_verify_token',
        'challenge_123'
      );

      expect(result).toBeNull();
    });
  });

  describe('getMessageTemplates', () => {
    it('should return predefined message templates', () => {
      const templates = whatsappService.getMessageTemplates();

      expect(templates).toHaveProperty('quotation_approved');
      expect(templates).toHaveProperty('quotation_follow_up');
      expect(templates).toHaveProperty('order_shipped');
      expect(templates).toHaveProperty('payment_reminder');

      expect(templates.quotation_approved.language).toBe('id');
      expect(templates.quotation_approved.category).toBe('UTILITY');
    });
  });

  describe('handleIncomingWebhook', () => {
    it('should process webhook with messages', async () => {
      const webhookPayload = {
        object: 'whatsapp_business_account',
        entry: [{
          id: 'entry_123',
          changes: [{
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '6281234567890',
                phone_number_id: 'phone_123'
              },
              messages: [{
                from: '6281234567890',
                id: 'msg_incoming_123',
                timestamp: '1234567890',
                text: {
                  body: 'Hello from customer'
                },
                type: 'text'
              }],
              contacts: [{
                profile: {
                  name: 'Customer Name'
                },
                wa_id: '6281234567890'
              }]
            },
            field: 'messages'
          }]
        }]
      };

      await expect(
        whatsappService.handleIncomingWebhook(webhookPayload)
      ).resolves.not.toThrow();
    });

    it('should process webhook with status updates', async () => {
      const webhookPayload = {
        object: 'whatsapp_business_account',
        entry: [{
          id: 'entry_123',
          changes: [{
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '6281234567890',
                phone_number_id: 'phone_123'
              },
              statuses: [{
                id: 'msg_123',
                status: 'delivered',
                timestamp: '1234567890',
                recipient_id: '6281234567890'
              }]
            },
            field: 'messages'
          }]
        }]
      };

      await expect(
        whatsappService.handleIncomingWebhook(webhookPayload)
      ).resolves.not.toThrow();
    });
  });
});