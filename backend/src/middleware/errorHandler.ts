import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(`Error occurred: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  const isOperational = err instanceof AppError ? err.isOperational : false;
  const statusCode = err.statusCode || err.status || 500;

  // Development mode: send detailed error
  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      success: false,
      message: err.message,
      error: err.name,
      stack: err.stack,
      isOperational
    });
  } else {
    // Production mode: sanitize error
    const message = isOperational
      ? err.message
      : 'Internal Server Error';

    res.status(statusCode).json({
      success: false,
      message,
      ...(isOperational && { error: err.name })
    });
  }
};

export const notFoundHandler = (
  req: Request,
  res: Response
): void => {
  logger.warn(`404 - Not Found: ${req.method} ${req.url}`);

  res.status(404).json({
    success: false,
    message: 'Resource not found',
    path: req.path
  });
};