import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { validation } from '../middleware/validate';

const router = Router();
const prisma = new PrismaClient();

type AsyncRequestHandler<P = any, ResBody = any, ReqBody = any> = (
  req: Request<P, ResBody, ReqBody>,
  res: Response<ResBody>,
  next: NextFunction
) => Promise<any>;

const asyncHandler = 
  (fn: AsyncRequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Get all customers with search, filter, and pagination
router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req);
  const { field: sortField, order: sortOrder } = getSortParams(req, 'name');
  const filters = getFilterParams(req);

  // Build where clause
  const where: any = {};
  
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { whatsappNumber: { contains: filters.search } },
      { email: { contains: filters.search } }
    ];
  }

  // Get total count for pagination
  const total = await prisma.customer.count({ where });

  // Get customers with pagination and order summary
  const customers = await prisma.customer.findMany({
    where,
    include: {
      orders: {
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true
        }
      },
      _count: {
        select: { orders: true }
      }
    },
    orderBy: {
      [sortField]: sortOrder
    },
    skip,
    take: limit
  });

  // Calculate additional metrics for each customer
  const customersWithMetrics = customers.map(customer => ({
    ...customer,
    metrics: {
      totalOrders: customer._count.orders,
      totalSpent: customer.orders.reduce((sum, order) => sum + order.total, 0),
      lastOrderDate: customer.orders.length > 0 
        ? Math.max(...customer.orders.map(o => o.createdAt.getTime()))
        : null
    }
  }));

  res.json({
    data: customersWithMetrics,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}));

// Get single customer
router.get('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        orders: true,
      },
    });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching customer' });
  }
});

// Create new customer
router.post('/',
  [
    body('name').notEmpty(),
    body('whatsappNumber').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const customer = await prisma.customer.create({
        data: req.body,
      });
      res.status(201).json(customer);
    } catch (error) {
      res.status(500).json({ error: 'Error creating customer' });
    }
  }
);

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Error updating customer' });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    await prisma.customer.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting customer' });
  }
});

export default router;
