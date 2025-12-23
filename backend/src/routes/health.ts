import type { Request, Response } from 'express';
import { Router } from 'express';
import { db } from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

// Health check endpoint
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const startTime = Date.now();
    
    // Check database connectivity
    const connection = await db.getConnection();
    try {
      await connection.query('SELECT 1');
    } finally {
      connection.release();
    }
    
    const duration = Date.now() - startTime;
    const memoryUsage = process.memoryUsage();
    
    logger.info(`Health check passed in ${duration}ms`);
    
    res.status(200).json({
      success: true,
      data: {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100 + ' MB',
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100 + ' MB',
        },
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '0.1.0',
      },
      latency: `${duration}ms`,
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    
    res.status(503).json({
      success: false,
      message: 'Service Unavailable',
      error: process.env.NODE_ENV === 'development' ? error : 'Database connection failed',
    });
  }
});

// Readiness check endpoint (for Kubernetes)
router.get('/ready', async (req: Request, res: Response): Promise<void> => {
  try {
    const connection = await db.getConnection();
    connection.release();
    
    res.status(200).json({ ready: true });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({ ready: false });
  }
});

// Liveness check endpoint (for Kubernetes)
router.get('/live', (req: Request, res: Response): void => {
  res.status(200).json({ alive: true });
});

export default router;