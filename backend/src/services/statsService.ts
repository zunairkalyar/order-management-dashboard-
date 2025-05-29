import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class StatsService {
  async getOrderStats(startDate?: Date, endDate?: Date) {
    const dateFilter = this.getDateFilter(startDate, endDate);

    const [
      totalOrders,
      totalCustomers,
      ordersByStatus,
      averageOrderValue,
      recentOrders
    ] = await Promise.all([
      // Total orders count
      prisma.order.count({
        where: dateFilter
      }),
      
      // Total unique customers
      prisma.customer.count(),
      
      // Orders by status
      prisma.order.groupBy({
        by: ['status'],
        where: dateFilter,
        _count: true
      }),
      
      // Average order value
      prisma.order.aggregate({
        where: dateFilter,
        _avg: {
          total: true
        }
      }),
      
      // Recent orders trend
      prisma.order.findMany({
        where: dateFilter,
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          customer: true
        }
      })
    ]);

    return {
      totalOrders,
      totalCustomers,
      ordersByStatus: ordersByStatus.reduce((acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      }, {} as Record<string, number>),
      averageOrderValue: averageOrderValue._avg.total || 0,
      recentOrders,
      periodStart: startDate || new Date(0),
      periodEnd: endDate || new Date()
    };
  }

  async getCustomerStats() {
    const [
      customersByMonth,
      topCustomers,
      orderFrequency
    ] = await Promise.all([
      // New customers by month
      prisma.customer.groupBy({
        by: ['createdAt'],
        _count: true
      }),
      
      // Top customers by order value
      prisma.customer.findMany({
        take: 10,
        include: {
          orders: true,
          _count: {
            select: { orders: true }
          }
        },
        orderBy: {
          orders: {
            _count: 'desc'
          }
        }
      }),
      
      // Order frequency distribution
      prisma.customer.groupBy({
        by: ['id'],
        _count: {
          orders: true
        }
      })
    ]);

    return {
      customersByMonth,
      topCustomers: topCustomers.map(customer => ({
        id: customer.id,
        name: customer.name,
        orderCount: customer._count.orders,
        totalSpent: customer.orders.reduce((sum, order) => sum + order.total, 0)
      })),
      orderFrequency: this.calculateOrderFrequencyDistribution(orderFrequency)
    };
  }

  private getDateFilter(startDate?: Date, endDate?: Date) {
    if (!startDate && !endDate) return {};
    
    return {
      createdAt: {
        gte: startDate,
        lte: endDate || new Date()
      }
    };
  }

  private calculateOrderFrequencyDistribution(orderFrequency: { id: string; _count: { orders: number; } }[]) {
    const distribution = {
      '1': 0,      // One-time customers
      '2-5': 0,    // Regular customers
      '6-10': 0,   // Frequent customers
      '10+': 0     // VIP customers
    };

    orderFrequency.forEach(({ _count }) => {
      if (_count.orders === 1) distribution['1']++;
      else if (_count.orders <= 5) distribution['2-5']++;
      else if (_count.orders <= 10) distribution['6-10']++;
      else distribution['10+']++;
    });

    return distribution;
  }
}
