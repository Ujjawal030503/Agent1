import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { contentGenerationService } from '../services/contentGenerationService.js';
import { PlatformTypes } from '../../../shared/types/database.js';

const router = express.Router();

const generateSchema = z.object({
  niche: z.string().min(1),
  platform: z.enum(PlatformTypes),
  brandKitId: z.string().uuid().optional(),
});

router.post('/generate', requireAuth, async (req, res, next) => {
  try {
    const { niche, platform, brandKitId } = generateSchema.parse(req.body);

    const posts = await contentGenerationService.generate({
      userId: req.user!.id,
      niche,
      platform,
      brandKitId,
    });

    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
