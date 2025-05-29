import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { orderRoutes } from '../backend/src/routes/orderRoutes';
import { customerRoutes } from '../backend/src/routes/customerRoutes';
import { auditRoutes } from '../backend/src/routes/auditRoutes';
import { statsRoutes } from '../backend/src/routes/statsRoutes';
import { bulkRoutes } from '../backend/src/routes/bulkRoutes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/bulk', bulkRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// For Vercel serverless deployment
export default app;
