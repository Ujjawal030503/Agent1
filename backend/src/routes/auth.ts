import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/database';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { AppError } from '../middleware/errorHandler';
import { authLimiter } from '../middleware/rateLimiter';

import { authenticate } from '../middleware/auth';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Register
router.post('/register', authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationResult = registerSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
      throw new AppError(errorMessage, 400);
    }
    
    const { email, password } = validationResult.data;

    // Check if user exists
    const existingUser = await db.queryOne('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser) {
      throw new AppError('Email already exists', 409); // 409 Conflict
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await db.queryOne<{ id: string, email: string }>(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword],
    );

    if (!newUser) {
      throw new AppError('Failed to create user', 500);
    }

    // Generate token
    const token = generateToken({ userId: newUser.id, email: newUser.email });

    res.status(201).json({
      success: true,
      data: {
        userId: newUser.id,
        email: newUser.email,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
      throw new AppError(errorMessage, 400);
    }

    const { email, password } = validationResult.data;

    // Find user
    const user = await db.queryOne<{ id: string, email: string, password_hash: string }>(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email],
    );

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Logout (placeholder)
router.post('/logout', (req: Request, res: Response) => {
  // Client-side logout (delete token).
  // Server-side blacklist can be implemented later.
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// Get current user (protected)
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('User not found in request context', 500);
    }

    const user = await db.queryOne<{ id: string, email: string, created_at: Date }>(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [userId],
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
