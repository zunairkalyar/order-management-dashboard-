import { Router, Request, Response } from 'express';
import { StatsService } from '../services/statsService';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const statsService = new StatsService();

// Get order statistics
router.get('/orders', asyncHandler(async (req: Request, res: Response) => {
  const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
  const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
  
  const stats = await statsService.getOrderStats(startDate, endDate);
  res.json(stats);
}));

// Get customer statistics
router.get('/customers', asyncHandler(async (req: Request, res: Response) => {
  const stats = await statsService.getCustomerStats();
  res.json(stats);
}));

export default router;
