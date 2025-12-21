import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';
import healthRoutes from './routes/health';
import { logger } from './utils/logger';

// CORS configuration inline
const corsOptions = {
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'http://localhost:3000', // Frontend development
      'http://localhost:5000', // API self-reference
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
    ];

    const environment = process.env.NODE_ENV;
    
    if (!origin || environment === 'development') {
      // Allow requests from unknown origins in development
      callback(null, true);
    } else if (allowedOrigins.includes(origin)) {
      // Allow known origins in production
      callback(null, true);
    } else {
      // Reject unknown origins
      logger.warn(`CORS rejected origin: ${origin}`);
      callback(new Error(`Origin not allowed by CORS: ${origin}`), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
};

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      }
    },
    skip: (req) => req.path === '/health' || req.path === '/health/live' || req.path === '/health/ready'
  }));
}

// Routes
app.use('/health', healthRoutes);

// API version prefix for future routes
app.use('/api/v1', (req, res, next) => {
  // Future routes will go here
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Social Content Generator API',
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(globalErrorHandler);

export default app;