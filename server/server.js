import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { testConnection } from './config/db.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. Core Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || origin === CLIENT_URL || origin === 'http://localhost:5173' || origin === 'http://127.0.0.1:5173') {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev mode
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Optional subtle request logging
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// 2. Base & Health Check Endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Personal Finance Platform API is operational.',
    version: '1.0.0',
    documentation: {
      auth: '/api/auth',
      transactions: '/api/transactions',
      dashboard: '/api/dashboard/summary',
      health: '/api/health',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    driver: process.env.DB_DRIVER || 'mysql',
    database: process.env.DB_NAME || 'personalfinancedb',
  });
});

// 3. API Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 4. Centralized Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// 5. Test MySQL connection on boot, then start server
try {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(` Financial Command Center API Backend is running!`);
    console.log(` Port: ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Database: MySQL (Database: ${process.env.DB_NAME || 'personalfinancedb'})`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });
} catch (bootErr) {
  console.error('Fatal boot error:', bootErr.message);
  process.exit(1);
}

export default app;
