import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Verify the logger import exists
logger.debug('CORS middleware loading');

// CORS configuration
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

// CORS middleware wrapper
export const corsMiddleware = (cors(corsOptions));

// Error handler function placeholder
export const errorHandler = ((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${err.message}`, err.stack || err);
  
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    error: {
      message: (process.env.NODE_ENV === 'development' ? message : 'Internal Server Error'),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
export const notFoundHandler = ((req: Request, res: Response) => {
  logger.warn(`404: ${req.method} ${req.url}`);
  
  res.status(404).json({
    error: {
      message: 'Endpoint not found',
      path: req.path
    }
  });
});