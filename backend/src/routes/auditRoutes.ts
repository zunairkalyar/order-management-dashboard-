import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get audit trail for an order
router.get('/order/:orderId', async (req, res) => {
  try {
    const auditTrail = await prisma.auditLog.findMany({
      where: { orderId: req.params.orderId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(auditTrail);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching audit trail' });
  }
});

// Create audit log entry
router.post('/', async (req, res) => {
  try {
    const auditLog = await prisma.auditLog.create({
      data: req.body,
    });
    res.status(201).json(auditLog);
  } catch (error) {
    res.status(500).json({ error: 'Error creating audit log' });
  }
});

export default router;
