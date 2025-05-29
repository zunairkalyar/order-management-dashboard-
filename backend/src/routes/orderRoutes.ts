import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';

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

// Get all orders
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
      },
    });
    res.json(orders);
  })
);

// Get single order
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        auditTrail: true,
      },
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  })
);

// Create new order
router.post(
  '/',
  [
    body('customerName').notEmpty(),
    body('items').isArray(),
    body('total').isFloat(),
    body('status').notEmpty(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        ...req.body,
      },
    });
    res.status(201).json(order);
  })
);

// Update order
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(order);
  })
);

// Delete order
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.order.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  })
);

// Helper function to generate order number
function generateOrderNumber(): string {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export default router;
