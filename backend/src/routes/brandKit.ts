import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { brandKitService } from '../services/brandKitService.js';
import { 
  createBrandKitSchema, 
  updateBrandKitSchema, 
  brandKitIdSchema 
} from '../validators/brandKit.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

/**
 * POST /brand-kit
 * Create a new brand kit
 */
router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    logger.info('Creating new brand kit', { userId: req.user?.userId });

    if (!req.user?.userId) {
      throw new AppError('User not authenticated', 401);
    }

    // Validate input
    const validationResult = createBrandKitSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      throw new AppError(
        `Validation failed: ${validationResult.error.errors.map(e => e.message).join(', ')}`,
        400
      );
    }

    // Create brand kit
    const brandKit = await brandKitService.createBrandKit(
      req.user.userId,
      validationResult.data
    );

    res.status(201).json({
      success: true,
      data: brandKit
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /brand-kit
 * Get all brand kits for authenticated user
 */
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    logger.info('Fetching brand kits for user', { userId: req.user?.userId });

    if (!req.user?.userId) {
      throw new AppError('User not authenticated', 401);
    }

    const brandKits = await brandKitService.getUserBrandKits(req.user.userId);

    res.status(200).json({
      success: true,
      data: brandKits,
      count: brandKits.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /brand-kit/:id
 * Get a single brand kit by ID
 */
router.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    logger.info('Fetching brand kit', { brandKitId: id, userId: req.user?.userId });

    if (!req.user?.userId) {
      throw new AppError('User not authenticated', 401);
    }

    // Validate ID format
    const idValidation = brandKitIdSchema.safeParse(id);
    if (!idValidation.success) {
      throw new AppError('Invalid brand kit ID format', 400);
    }

    const brandKit = await brandKitService.getBrandKitById(id, req.user.userId);

    res.status(200).json({
      success: true,
      data: brandKit
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /brand-kit/:id
 * Update a brand kit
 */
router.put('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    logger.info('Updating brand kit', { brandKitId: id, userId: req.user?.userId });

    if (!req.user?.userId) {
      throw new AppError('User not authenticated', 401);
    }

    // Validate ID format
    const idValidation = brandKitIdSchema.safeParse(id);
    if (!idValidation.success) {
      throw new AppError('Invalid brand kit ID format', 400);
    }

    // Validate input
    const validationResult = updateBrandKitSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      throw new AppError(
        `Validation failed: ${validationResult.error.errors.map(e => e.message).join(', ')}`,
        400
      );
    }

    // Check if there's any data to update
    if (Object.keys(validationResult.data).length === 0) {
      throw new AppError('No data provided for update', 400);
    }

    const updatedBrandKit = await brandKitService.updateBrandKit(
      id,
      req.user.userId,
      validationResult.data
    );

    res.status(200).json({
      success: true,
      data: updatedBrandKit
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /brand-kit/:id
 * Delete a brand kit
 */
router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    logger.info('Deleting brand kit', { brandKitId: id, userId: req.user?.userId });

    if (!req.user?.userId) {
      throw new AppError('User not authenticated', 401);
    }

    // Validate ID format
    const idValidation = brandKitIdSchema.safeParse(id);
    if (!idValidation.success) {
      throw new AppError('Invalid brand kit ID format', 400);
    }

    await brandKitService.deleteBrandKit(id, req.user.userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
