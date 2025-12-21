import dotenv from 'dotenv';
import app from './app.js';
import { db } from './config/database.js';
import { logger } from './utils/logger.js';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || 'localhost';

// Graceful shutdown handler
let server: any = null;

async function shutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Close HTTP server
    if (server) {
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forceful shutdown after timeout');
        process.exit(1);
      }, 10000).unref();
    } else {
      process.exit(0);
    }
    
    // Close database connections
    await db.close();
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    // Initialize database
    await db.initialize();
    
    // Create HTTP server
    server = app.listen(PORT, HOST, () => {
      logger.info(`🚀 Server running on http://${HOST}:${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info('✅ Application started successfully');
    });
    
    // Handle server errors
    server.on('error', (error: Error) => {
      logger.error('Server error:', error);
      process.exit(1);
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Register signal handlers
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  shutdown('uncaughtException');
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown('unhandledRejection');
});

// Start the server
startServer();