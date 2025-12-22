import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { AppError } from './errorHandler';
import { logger } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

// Export the interface for compatibility if needed, though typically express.Request is used
export interface AuthenticatedRequest extends Request {}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
      throw new AppError('Invalid token format', 401);
    }

    try {
      const decoded = verifyToken(token) as { userId: string; email: string };
      req.user = decoded;
      next();
    } catch (err) {
      throw new AppError('Invalid or expired token', 401);
    }
  } catch (error) {
    next(error);
  }
};

// Maintain compatibility with existing code
export const authenticateJWT = authenticate;
export const requireAuth = authenticate;
