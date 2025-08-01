import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CommunicationManager } from '../communication-manager';
import { CommunicationType, CommunicationDirection, CommunicationStatus, FollowUpType, FollowUpStatus } from '@prisma/client';

// Mock prisma
const mockPrisma = {
  communication: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
    updateMany: vi.fn(),
  },
  followUp: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  },
  customer: {
    findUnique: vi.fn(),
  },
  quotation: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock WhatsApp service
const mockWhatsAppService = {
  sendTemplateMessage: vi.fn(),
};

vi.mock('../whatsapp-service', () => ({
  whatsappService: mockWhatsAppService,
}));

describe('CommunicationManager', () => {
  let communicationManager: CommunicationManager;

  beforeEach(() => {
    communicationManager = new CommunicationManager();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('logCommunication', () => {
    it('should create a communication record', async () => {
      const mockCommunication = {
        id: 'comm_123',
        customerId: 'customer_123',
        type: CommunicationType.WHATSAPP,
        direction: CommunicationDirection.OUTBOUND,
        content: 'Test message',
        status: CommunicationStatus.SENT,
        adminUserId: 'admin_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.communication.create.mockResolvedValue(mockCommunication);

      const result = await communicationManager.logCommunication({
        customerId: 'customer_123',
        type: CommunicationType.WHATSAPP,
        direction: CommunicationDirection.OUTBOUND,
        content: 'Test message',
        adminUserId: 'admin_123',
      });

      expect(result).toEqual(mockCommunication);
      expect(mockPrisma.communication.create).toHaveBeenCalledWith({
        data: {
          customerId: 'customer_123',
          quotationId: undefined,
          orderId: undefined,
          type: CommunicationType.WHATSAPP,
          direction: CommunicationDirection.OUTBOUND,
          content: 'Test message',
          status: CommunicationStatus.SENT,
          externalId: undefined,
          adminUserId: 'admin_123',
        },
      });
    });

    it('should handle communication creation errors', async () => {
      mockPrisma.communication.create.mockRejectedValue(new Error('Database error'));

      await expect(
        communicationManager.logCommunication({
          customerId: 'customer_123',
          type: CommunicationType.WHATSAPP,
          direction: CommunicationDirection.OUTBOUND,
          content: 'Test message',
          adminUserId: 'admin_123',
        })
      ).rejects.toThrow('Failed to log communication');
    });
  });

  describe('getCustomerCommunicationHistory', () => {
    it('should return customer communication history', async () => {
      const mockCommunications = [
        {
          id: 'comm_1',
          customerId: 'customer_123',
          customer: { id: 'customer_123', name: 'John Doe' },
          quotation: null,
        },
      ];

      const mockFollowUps = [
        {
          id: 'followup_1',
          customerId: 'customer_123',
          customer: { id: 'customer_123', name: 'John Doe' },
          quotation: null,
        },
      ];

      mockPrisma.communication.findMany.mockResolvedValue(mockCommunications);
      mockPrisma.followUp.findMany.mockResolvedValue(mockFollowUps);
      mockPrisma.communication.count.mockResolvedValue(1);
      mockPrisma.followUp.count.mockResolvedValue(1);
      mockPrisma.followUp.findFirst.mockResolvedValue(null);

      const result = await communicationManager.getCustomerCommunicationHistory('customer_123');

      expect(result).toEqual({
        communications: mockCommunications,
        followUps: mockFollowUps,
        totalCommunications: 1,
        totalFollowUps: 1,
        lastCommunication: mockCommunications[0],
        nextFollowUp: undefined,
      });
    });
  });

  describe('scheduleFollowUp', () => {
    it('should create a follow-up record', async () => {
      const mockFollowUp = {
        id: 'followup_123',
        customerId: 'customer_123',
        type: FollowUpType.QUOTATION_FOLLOW_UP,
        scheduledAt: new Date(),
        status: FollowUpStatus.PENDING,
        adminUserId: 'admin_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.followUp.create.mockResolvedValue(mockFollowUp);

      const result = await communicationManager.scheduleFollowUp({
        customerId: 'customer_123',
        type: FollowUpType.QUOTATION_FOLLOW_UP,
        scheduledAt: new Date(),
        adminUserId: 'admin_123',
      });

      expect(result).toEqual(mockFollowUp);
      expect(mockPrisma.followUp.create).toHaveBeenCalledWith({
        data: {
          customerId: 'customer_123',
          quotationId: undefined,
          orderId: undefined,
          type: FollowUpType.QUOTATION_FOLLOW_UP,
          scheduledAt: expect.any(Date),
          notes: undefined,
          status: FollowUpStatus.PENDING,
          adminUserId: 'admin_123',
        },
      });
    });
  });

  describe('sendFollowUpMessage', () => {
    it('should send WhatsApp message and log communication', async () => {
      const mockCustomer = {
        id: 'customer_123',
        phone: '081234567890',
        name: 'John Doe',
      };

      const mockCommunication = {
        id: 'comm_123',
        customerId: 'customer_123',
        type: CommunicationType.WHATSAPP,
        direction: CommunicationDirection.OUTBOUND,
        content: 'Follow-up template: quotation_follow_up',
        status: CommunicationStatus.SENT,
        externalId: 'msg_123',
        adminUserId: 'admin_123',
      };

      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockWhatsAppService.sendTemplateMessage.mockResolvedValue('msg_123');
      mockPrisma.communication.create.mockResolvedValue(mockCommunication);

      const result = await communicationManager.sendFollowUpMessage({
        customerId: 'customer_123',
        templateName: 'quotation_follow_up',
        parameters: { customerName: 'John Doe' },
        adminUserId: 'admin_123',
      });

      expect(result.messageId).toBe('msg_123');
      expect(result.communication).toEqual(mockCommunication);
      expect(mockWhatsAppService.sendTemplateMessage).toHaveBeenCalledWith(
        '081234567890',
        'quotation_follow_up',
        { customerName: 'John Doe' },
        'customer_123',
        undefined,
        'admin_123'
      );
    });

    it('should throw error if customer not found', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      await expect(
        communicationManager.sendFollowUpMessage({
          customerId: 'customer_123',
          templateName: 'quotation_follow_up',
          adminUserId: 'admin_123',
        })
      ).rejects.toThrow('Customer not found');
    });
  });

  describe('completeFollowUp', () => {
    it('should mark follow-up as completed', async () => {
      const mockFollowUp = {
        id: 'followup_123',
        status: FollowUpStatus.COMPLETED,
        completedAt: new Date(),
      };

      mockPrisma.followUp.update.mockResolvedValue(mockFollowUp);

      const result = await communicationManager.completeFollowUp(
        'followup_123',
        'Follow-up completed successfully'
      );

      expect(result).toEqual(mockFollowUp);
      expect(mockPrisma.followUp.update).toHaveBeenCalledWith({
        where: { id: 'followup_123' },
        data: {
          status: FollowUpStatus.COMPLETED,
          completedAt: expect.any(Date),
          notes: 'Follow-up completed successfully',
        },
      });
    });
  });

  describe('getTodaysPendingFollowUps', () => {
    it('should return today\'s pending follow-ups', async () => {
      const mockFollowUps = [
        {
          id: 'followup_1',
          customerId: 'customer_123',
          customer: { id: 'customer_123', name: 'John Doe' },
          quotation: null,
          scheduledAt: new Date(),
          status: FollowUpStatus.PENDING,
        },
      ];

      mockPrisma.followUp.findMany.mockResolvedValue(mockFollowUps);

      const result = await communicationManager.getTodaysPendingFollowUps();

      expect(result).toEqual(mockFollowUps);
      expect(mockPrisma.followUp.findMany).toHaveBeenCalledWith({
        where: {
          status: FollowUpStatus.PENDING,
          scheduledAt: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        },
        include: {
          customer: true,
          quotation: true,
        },
        orderBy: { scheduledAt: 'asc' },
      });
    });
  });

  describe('getOverdueFollowUps', () => {
    it('should return overdue follow-ups', async () => {
      const mockFollowUps = [
        {
          id: 'followup_1',
          customerId: 'customer_123',
          customer: { id: 'customer_123', name: 'John Doe' },
          quotation: null,
          scheduledAt: new Date(Date.now() - 86400000), // Yesterday
          status: FollowUpStatus.PENDING,
        },
      ];

      mockPrisma.followUp.findMany.mockResolvedValue(mockFollowUps);

      const result = await communicationManager.getOverdueFollowUps();

      expect(result).toEqual(mockFollowUps);
      expect(mockPrisma.followUp.findMany).toHaveBeenCalledWith({
        where: {
          status: FollowUpStatus.PENDING,
          scheduledAt: { lt: expect.any(Date) },
        },
        include: {
          customer: true,
          quotation: true,
        },
        orderBy: { scheduledAt: 'asc' },
      });
    });
  });

  describe('getCommunicationMetrics', () => {
    it('should return communication metrics', async () => {
      mockPrisma.communication.count.mockResolvedValue(100);
      mockPrisma.communication.groupBy
        .mockResolvedValueOnce([
          { type: CommunicationType.WHATSAPP, _count: { type: 80 } },
          { type: CommunicationType.PHONE, _count: { type: 20 } },
        ])
        .mockResolvedValueOnce([
          { status: CommunicationStatus.SENT, _count: { status: 60 } },
          { status: CommunicationStatus.DELIVERED, _count: { status: 40 } },
        ]);
      
      mockPrisma.followUp.findMany.mockResolvedValue([
        { id: 'f1', status: FollowUpStatus.COMPLETED, quotation: { status: 'APPROVED' } },
        { id: 'f2', status: FollowUpStatus.PENDING, quotation: { status: 'PENDING' } },
      ]);
      
      mockPrisma.quotation.count.mockResolvedValue(5);

      const result = await communicationManager.getCommunicationMetrics();

      expect(result.totalCommunications).toBe(100);
      expect(result.communicationsByType.WHATSAPP).toBe(80);
      expect(result.communicationsByType.PHONE).toBe(20);
      expect(result.responseRate).toBe((40 / 60) * 100);
      expect(result.followUpEffectiveness.totalFollowUps).toBe(2);
      expect(result.followUpEffectiveness.completedFollowUps).toBe(1);
    });
  });

  describe('updateCommunicationStatus', () => {
    it('should update communication status by external ID', async () => {
      mockPrisma.communication.updateMany.mockResolvedValue({ count: 1 });

      await communicationManager.updateCommunicationStatus('msg_123', CommunicationStatus.DELIVERED);

      expect(mockPrisma.communication.updateMany).toHaveBeenCalledWith({
        where: { externalId: 'msg_123' },
        data: { status: CommunicationStatus.DELIVERED },
      });
    });
  });

  describe('cancelFollowUp', () => {
    it('should cancel a follow-up', async () => {
      const mockFollowUp = {
        id: 'followup_123',
        status: FollowUpStatus.CANCELLED,
        notes: 'Cancelled by admin',
      };

      mockPrisma.followUp.update.mockResolvedValue(mockFollowUp);

      const result = await communicationManager.cancelFollowUp(
        'followup_123',
        'Cancelled by admin'
      );

      expect(result).toEqual(mockFollowUp);
      expect(mockPrisma.followUp.update).toHaveBeenCalledWith({
        where: { id: 'followup_123' },
        data: {
          status: FollowUpStatus.CANCELLED,
          notes: 'Cancelled by admin',
        },
      });
    });
  });
});