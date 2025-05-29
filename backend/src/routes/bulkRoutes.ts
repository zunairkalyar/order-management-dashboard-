import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { BulkOperationsService } from '../services/bulkOperationsService';
import { asyncHandler } from '../utils/asyncHandler';
import { validateRequest } from '../middleware/validate';

const router = Router();
const bulkOps = new BulkOperationsService();

// Bulk update order status
router.post(
  '/orders/status',
  [
    body('orderIds').isArray().notEmpty(),
    body('status').isString().notEmpty(),
    validateRequest
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { orderIds, status } = req.body;
    const result = await bulkOps.updateOrdersStatus(orderIds, status);
    res.json(result);
  })
);

// Bulk delete orders
router.delete(
  '/orders',
  [
    body('orderIds').isArray().notEmpty(),
    validateRequest
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { orderIds } = req.body;
    const result = await bulkOps.deleteOrders(orderIds);
    res.json(result);
  })
);

// Bulk assign customer to orders
router.post(
  '/orders/assign-customer',
  [
    body('orderIds').isArray().notEmpty(),
    body('customerId').isString().notEmpty(),
    validateRequest
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { orderIds, customerId } = req.body;
    const result = await bulkOps.assignCustomerToOrders(orderIds, customerId);
    res.json(result);
  })
);

// Bulk send WhatsApp messages
router.post(
  '/orders/send-messages',
  [
    body('orderIds').isArray().notEmpty(),
    body('messageTemplate').isString().notEmpty(),
    validateRequest
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const { orderIds, messageTemplate } = req.body;
    const result = await bulkOps.bulkSendWhatsAppMessages(orderIds, messageTemplate);
    res.json(result);
  })
);

export default router;
