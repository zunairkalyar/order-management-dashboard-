import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import orderRoutes from './routes/orderRoutes';
import customerRoutes from './routes/customerRoutes';
import auditRoutes from './routes/auditRoutes';
import statsRoutes from './routes/statsRoutes';
import bulkRoutes from './routes/bulkRoutes';
import { config, validateConfig } from './config';
import { errorHandler } from './middleware/auth';

// Validate environment variables
validateConfig();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors(config.cors));
app.use(express.json());

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/bulk', bulkRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
