import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/database.js';
import { config } from './config/env.js';
import { errorHandler } from './middleware/auth.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import shopRoutes from './routes/shopRoutes.js';

const app: Application = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({ origin: config.cors.origin }));
app.use(express.json({ limit: '50mb' })); // Support base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to MongoDB
await connectDB();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shop', shopRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`
╔─────────────────────────────────────╗
  🚀 Server running on port ${PORT}
  📦 Node Env: ${config.nodeEnv}
╚─────────────────────────────────────╝
  `);
});
