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

// Get all customers
router.get('/', asyncHandler(async (req, res) => {
  const customers = await prisma.customer.findMany({
    include: {
      orders: true,
    },
  });
  res.json(customers);
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
