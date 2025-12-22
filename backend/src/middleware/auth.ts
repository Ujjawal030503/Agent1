import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new AppError('Authorization header missing', 401);
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    // For this implementation, we'll use a mock JWT validation
    // In production, you would use a library like jsonwebtoken
    // to verify the token against your secret key
    
    // Mock JWT payload extraction - replace with actual JWT verification
    const mockPayload = decodeMockJWT(token);
    
    if (!mockPayload) {
      throw new AppError('Invalid or expired token', 401);
    }

    req.user = {
      id: mockPayload.userId,
      email: mockPayload.email
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Mock JWT decoder - replace with actual JWT verification in production
function decodeMockJWT(token: string): { userId: string; email: string } | null {
  try {
    // In a real implementation, you would use:
    // jwt.verify(token, process.env.JWT_SECRET!)
    
    // For development, we'll accept any token and extract user info
    // This is a placeholder for actual JWT implementation
    
    // Mock validation - accept tokens that look like UUIDs
    if (token.length >= 36) {
      return {
        userId: token,
        email: 'user@example.com' // Would be extracted from actual JWT
      };
    }
    
    return null;
  } catch {
    return null;
  }
}

export const requireAuth = authenticateJWT;