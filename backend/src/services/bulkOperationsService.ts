import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BulkOperationsService {
  async updateOrdersStatus(orderIds: string[], status: string) {
    return prisma.$transaction(async (tx) => {
      // Update orders
      await tx.order.updateMany({
        where: { id: { in: orderIds } },
        data: { status }
      });

      // Create audit logs for each order
      const auditLogs = orderIds.map(orderId => ({
        orderId,
        action: 'BULK_STATUS_UPDATE',
        description: `Status updated to ${status} via bulk operation`
      }));

      await tx.auditLog.createMany({
        data: auditLogs
      });

      // Return updated orders
      return tx.order.findMany({
        where: { id: { in: orderIds } },
        include: { customer: true }
      });
    });
  }

  async deleteOrders(orderIds: string[]) {
    return prisma.$transaction(async (tx) => {
      // First, delete related audit logs
      await tx.auditLog.deleteMany({
        where: { orderId: { in: orderIds } }
      });

      // Then delete the orders
      await tx.order.deleteMany({
        where: { id: { in: orderIds } }
      });

      return { deletedCount: orderIds.length };
    });
  }

  async assignCustomerToOrders(orderIds: string[], customerId: string) {
    return prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: customerId }
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Update orders
      await tx.order.updateMany({
        where: { id: { in: orderIds } },
        data: {
          customerId,
          customerName: customer.name,
          whatsappNumber: customer.whatsappNumber
        }
      });

      // Create audit logs
      const auditLogs = orderIds.map(orderId => ({
        orderId,
        action: 'BULK_CUSTOMER_ASSIGN',
        description: `Assigned to customer ${customer.name} (${customerId}) via bulk operation`
      }));

      await tx.auditLog.createMany({
        data: auditLogs
      });

      // Return updated orders
      return tx.order.findMany({
        where: { id: { in: orderIds } },
        include: { customer: true }
      });
    });
  }

  async bulkSendWhatsAppMessages(orderIds: string[], messageTemplate: string) {
    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      include: { customer: true }
    });

    const results = [];
    for (const order of orders) {
      if (!order.whatsappNumber) continue;

      const message = messageTemplate
        .replace('{{orderNumber}}', order.orderNumber)
        .replace('{{customerName}}', order.customerName)
        .replace('{{total}}', order.total.toString())
        .replace('{{status}}', order.status);

      try {
        // Log the message attempt
        await prisma.messageLog.create({
          data: {
            phoneNumber: order.whatsappNumber,
            message,
            status: 'QUEUED',
            metadata: { orderId: order.id }
          }
        });

        results.push({
          orderId: order.id,
          status: 'queued',
          phoneNumber: order.whatsappNumber
        });
      } catch (error) {
        results.push({
          orderId: order.id,
          status: 'failed',
          error: (error as Error).message
        });
      }
    }

    return results;
  }
}
