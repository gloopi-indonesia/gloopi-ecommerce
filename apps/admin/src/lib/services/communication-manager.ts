import { prisma } from '@/lib/prisma';
import { 
  Communication, 
  FollowUp, 
  Customer, 
  Quotation,
  CommunicationType, 
  CommunicationDirection, 
  CommunicationStatus,
  FollowUpType,
  FollowUpStatus 
} from '@prisma/client';
import { whatsappService } from './whatsapp-service';

// Extended types for communication management
export interface CommunicationWithRelations extends Communication {
  customer: Customer;
  quotation?: Quotation | null;
}

export interface FollowUpWithRelations extends FollowUp {
  customer: Customer;
  quotation?: Quotation | null;
}

export interface CommunicationHistory {
  communications: CommunicationWithRelations[];
  followUps: FollowUpWithRelations[];
  totalCommunications: number;
  totalFollowUps: number;
  lastCommunication?: CommunicationWithRelations;
  nextFollowUp?: FollowUpWithRelations;
}

export interface CommunicationMetrics {
  totalCommunications: number;
  communicationsByType: Record<CommunicationType, number>;
  communicationsByStatus: Record<CommunicationStatus, number>;
  responseRate: number;
  averageResponseTime: number; // in hours
  followUpEffectiveness: {
    totalFollowUps: number;
    completedFollowUps: number;
    conversionRate: number; // percentage of follow-ups that led to quotation approval
  };
  monthlyTrends: Array<{
    month: string;
    communications: number;
    followUps: number;
    conversions: number;
  }>;
}

export interface CreateCommunicationData {
  customerId: string;
  quotationId?: string;
  orderId?: string;
  type: CommunicationType;
  direction: CommunicationDirection;
  content: string;
  status?: CommunicationStatus;
  externalId?: string;
  adminUserId: string;
}

export interface CreateFollowUpData {
  customerId: string;
  quotationId?: string;
  orderId?: string;
  type: FollowUpType;
  scheduledAt: Date;
  notes?: string;
  adminUserId: string;
}

export interface SendFollowUpMessageData {
  customerId: string;
  quotationId?: string;
  templateName: string;
  parameters?: Record<string, string>;
  scheduledAt?: Date;
  notes?: string;
  adminUserId: string;
}

export class CommunicationManager {
  /**
   * Log a communication interaction
   */
  async logCommunication(data: CreateCommunicationData): Promise<Communication> {
    try {
      const communication = await prisma.communication.create({
        data: {
          customerId: data.customerId,
          quotationId: data.quotationId,
          orderId: data.orderId,
          type: data.type,
          direction: data.direction,
          content: data.content,
          status: data.status || CommunicationStatus.SENT,
          externalId: data.externalId,
          adminUserId: data.adminUserId,
        },
      });

      return communication;
    } catch (error) {
      console.error('Failed to log communication:', error);
      throw new Error('Failed to log communication');
    }
  }

  /**
   * Get communication history for a customer
   */
  async getCustomerCommunicationHistory(
    customerId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<CommunicationHistory> {
    try {
      const [communications, followUps, totalCommunications, totalFollowUps] = await Promise.all([
        prisma.communication.findMany({
          where: { customerId },
          include: {
            customer: true,
            quotation: true,
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.followUp.findMany({
          where: { customerId },
          include: {
            customer: true,
            quotation: true,
          },
          orderBy: { scheduledAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.communication.count({ where: { customerId } }),
        prisma.followUp.count({ where: { customerId } }),
      ]);

      const lastCommunication = communications[0] || undefined;
      const nextFollowUp = await prisma.followUp.findFirst({
        where: {
          customerId,
          status: FollowUpStatus.PENDING,
          scheduledAt: { gte: new Date() },
        },
        include: {
          customer: true,
          quotation: true,
        },
        orderBy: { scheduledAt: 'asc' },
      });

      return {
        communications,
        followUps,
        totalCommunications,
        totalFollowUps,
        lastCommunication,
        nextFollowUp: nextFollowUp || undefined,
      };
    } catch (error) {
      console.error('Failed to get communication history:', error);
      throw new Error('Failed to get communication history');
    }
  }

  /**
   * Schedule a follow-up reminder
   */
  async scheduleFollowUp(data: CreateFollowUpData): Promise<FollowUp> {
    try {
      const followUp = await prisma.followUp.create({
        data: {
          customerId: data.customerId,
          quotationId: data.quotationId,
          orderId: data.orderId,
          type: data.type,
          scheduledAt: data.scheduledAt,
          notes: data.notes,
          status: FollowUpStatus.PENDING,
          adminUserId: data.adminUserId,
        },
      });

      return followUp;
    } catch (error) {
      console.error('Failed to schedule follow-up:', error);
      throw new Error('Failed to schedule follow-up');
    }
  }

  /**
   * Send a follow-up message via WhatsApp and log it
   */
  async sendFollowUpMessage(data: SendFollowUpMessageData): Promise<{
    messageId: string;
    communication: Communication;
    followUp?: FollowUp;
  }> {
    try {
      // Get customer details
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Send WhatsApp message
      const messageId = await whatsappService.sendTemplateMessage(
        customer.phone,
        data.templateName,
        data.parameters || {},
        data.customerId,
        data.quotationId,
        data.adminUserId
      );

      // Log the communication
      const communication = await this.logCommunication({
        customerId: data.customerId,
        quotationId: data.quotationId,
        type: CommunicationType.WHATSAPP,
        direction: CommunicationDirection.OUTBOUND,
        content: `Follow-up template: ${data.templateName} | Parameters: ${JSON.stringify(data.parameters)}`,
        status: CommunicationStatus.SENT,
        externalId: messageId,
        adminUserId: data.adminUserId,
      });

      // Schedule follow-up if requested
      let followUp: FollowUp | undefined;
      if (data.scheduledAt) {
        followUp = await this.scheduleFollowUp({
          customerId: data.customerId,
          quotationId: data.quotationId,
          type: FollowUpType.QUOTATION_FOLLOW_UP,
          scheduledAt: data.scheduledAt,
          notes: data.notes,
          adminUserId: data.adminUserId,
        });
      }

      return {
        messageId,
        communication,
        followUp,
      };
    } catch (error) {
      console.error('Failed to send follow-up message:', error);
      throw error;
    }
  }

  /**
   * Mark a follow-up as completed
   */
  async completeFollowUp(
    followUpId: string,
    notes?: string,
    _adminUserId?: string
  ): Promise<FollowUp> {
    try {
      const followUp = await prisma.followUp.update({
        where: { id: followUpId },
        data: {
          status: FollowUpStatus.COMPLETED,
          completedAt: new Date(),
          notes: notes || undefined,
        },
      });

      return followUp;
    } catch (error) {
      console.error('Failed to complete follow-up:', error);
      throw new Error('Failed to complete follow-up');
    }
  }

  /**
   * Get pending follow-ups for today
   */
  async getTodaysPendingFollowUps(adminUserId?: string): Promise<FollowUpWithRelations[]> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      const followUps = await prisma.followUp.findMany({
        where: {
          status: FollowUpStatus.PENDING,
          scheduledAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
          ...(adminUserId && { adminUserId }),
        },
        include: {
          customer: true,
          quotation: true,
        },
        orderBy: { scheduledAt: 'asc' },
      });

      return followUps;
    } catch (error) {
      console.error('Failed to get today\'s follow-ups:', error);
      throw new Error('Failed to get today\'s follow-ups');
    }
  }

  /**
   * Get overdue follow-ups
   */
  async getOverdueFollowUps(adminUserId?: string): Promise<FollowUpWithRelations[]> {
    try {
      const now = new Date();

      const followUps = await prisma.followUp.findMany({
        where: {
          status: FollowUpStatus.PENDING,
          scheduledAt: { lt: now },
          ...(adminUserId && { adminUserId }),
        },
        include: {
          customer: true,
          quotation: true,
        },
        orderBy: { scheduledAt: 'asc' },
      });

      return followUps;
    } catch (error) {
      console.error('Failed to get overdue follow-ups:', error);
      throw new Error('Failed to get overdue follow-ups');
    }
  }

  /**
   * Get communication effectiveness metrics
   */
  async getCommunicationMetrics(
    startDate?: Date,
    endDate?: Date,
    adminUserId?: string
  ): Promise<CommunicationMetrics> {
    try {
      const dateFilter = {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      };

      const whereClause = {
        createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        ...(adminUserId && { adminUserId }),
      };

      // Get basic communication stats
      const [
        totalCommunications,
        communicationsByType,
        communicationsByStatus,
        followUps,
        _quotationConversions,
      ] = await Promise.all([
        prisma.communication.count({ where: whereClause }),
        
        prisma.communication.groupBy({
          by: ['type'],
          where: whereClause,
          _count: { type: true },
        }),
        
        prisma.communication.groupBy({
          by: ['status'],
          where: whereClause,
          _count: { status: true },
        }),
        
        prisma.followUp.findMany({
          where: {
            createdAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
            ...(adminUserId && { adminUserId }),
          },
          include: { quotation: true },
        }),
        
        prisma.quotation.count({
          where: {
            status: 'APPROVED',
            updatedAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
          },
        }),
      ]);

      // Calculate response rate (simplified - based on delivered vs sent)
      const sentMessages = communicationsByStatus.find(s => s.status === CommunicationStatus.SENT)?._count.status || 0;
      const deliveredMessages = communicationsByStatus.find(s => s.status === CommunicationStatus.DELIVERED)?._count.status || 0;
      const responseRate = sentMessages > 0 ? (deliveredMessages / sentMessages) * 100 : 0;

      // Calculate follow-up effectiveness
      const totalFollowUps = followUps.length;
      const completedFollowUps = followUps.filter(f => f.status === FollowUpStatus.COMPLETED).length;
      const followUpConversions = followUps.filter(f => 
        f.quotation && f.quotation.status === 'APPROVED'
      ).length;

      // Build type and status maps
      const typeMap: Record<CommunicationType, number> = {
        WHATSAPP: 0,
        PHONE: 0,
        EMAIL: 0,
        SMS: 0,
      };
      
      const statusMap: Record<CommunicationStatus, number> = {
        SENT: 0,
        DELIVERED: 0,
        READ: 0,
        FAILED: 0,
      };

      communicationsByType.forEach(item => {
        typeMap[item.type] = item._count.type;
      });

      communicationsByStatus.forEach(item => {
        statusMap[item.status] = item._count.status;
      });

      // Calculate monthly trends (last 6 months)
      const monthlyTrends = await this.getMonthlyTrends(adminUserId);

      return {
        totalCommunications,
        communicationsByType: typeMap,
        communicationsByStatus: statusMap,
        responseRate,
        averageResponseTime: 0, // TODO: Implement based on actual response tracking
        followUpEffectiveness: {
          totalFollowUps,
          completedFollowUps,
          conversionRate: totalFollowUps > 0 ? (followUpConversions / totalFollowUps) * 100 : 0,
        },
        monthlyTrends,
      };
    } catch (error) {
      console.error('Failed to get communication metrics:', error);
      throw new Error('Failed to get communication metrics');
    }
  }

  /**
   * Get monthly communication trends
   */
  private async getMonthlyTrends(adminUserId?: string): Promise<Array<{
    month: string;
    communications: number;
    followUps: number;
    conversions: number;
  }>> {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const whereClause = {
        createdAt: { gte: sixMonthsAgo },
        ...(adminUserId && { adminUserId }),
      };

      const [communications, followUps, conversions] = await Promise.all([
        prisma.communication.findMany({
          where: whereClause,
          select: { createdAt: true },
        }),
        
        prisma.followUp.findMany({
          where: whereClause,
          select: { createdAt: true },
        }),
        
        prisma.quotation.findMany({
          where: {
            status: 'APPROVED',
            updatedAt: { gte: sixMonthsAgo },
          },
          select: { updatedAt: true },
        }),
      ]);

      // Group by month
      const monthlyData: Record<string, { communications: number; followUps: number; conversions: number }> = {};

      const processData = (items: { createdAt?: Date; updatedAt?: Date }[], type: 'communications' | 'followUps' | 'conversions') => {
        items.forEach(item => {
          const date = item.createdAt || item.updatedAt;
          if (date) {
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyData[monthKey]) {
              monthlyData[monthKey] = { communications: 0, followUps: 0, conversions: 0 };
            }
            monthlyData[monthKey][type]++;
          }
        });
      };

      processData(communications, 'communications');
      processData(followUps, 'followUps');
      processData(conversions, 'conversions');

      // Convert to array and sort by month
      return Object.entries(monthlyData)
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month));
    } catch (error) {
      console.error('Failed to get monthly trends:', error);
      return [];
    }
  }

  /**
   * Update communication status (for webhook updates)
   */
  async updateCommunicationStatus(
    externalId: string,
    status: CommunicationStatus
  ): Promise<void> {
    try {
      await prisma.communication.updateMany({
        where: { externalId },
        data: { status },
      });
    } catch (error) {
      console.error('Failed to update communication status:', error);
      throw new Error('Failed to update communication status');
    }
  }

  /**
   * Get communications for a specific quotation
   */
  async getQuotationCommunications(quotationId: string): Promise<CommunicationWithRelations[]> {
    try {
      const communications = await prisma.communication.findMany({
        where: { quotationId },
        include: {
          customer: true,
          quotation: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return communications;
    } catch (error) {
      console.error('Failed to get quotation communications:', error);
      throw new Error('Failed to get quotation communications');
    }
  }

  /**
   * Cancel a pending follow-up
   */
  async cancelFollowUp(followUpId: string, notes?: string): Promise<FollowUp> {
    try {
      const followUp = await prisma.followUp.update({
        where: { id: followUpId },
        data: {
          status: FollowUpStatus.CANCELLED,
          notes: notes || undefined,
        },
      });

      return followUp;
    } catch (error) {
      console.error('Failed to cancel follow-up:', error);
      throw new Error('Failed to cancel follow-up');
    }
  }
}

// Export singleton instance
export const communicationManager = new CommunicationManager();