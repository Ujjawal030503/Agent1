import { brandKitRepo } from '../utils/db-queries.js';
import { AppError } from '../middleware/errorHandler.js';
import type { CreateBrandKitInput, UpdateBrandKitInput } from '../validators/brandKit.js';
import type { UUID } from '../../../shared/types/database.js';

export class BrandKitService {
  /**
   * Create a new brand kit for a user
   */
  async createBrandKit(userId: UUID, data: CreateBrandKitInput) {
    try {
      const brandKit = await brandKitRepo.create({
        user_id: userId,
        brand_name: data.brand_name,
        tone: data.tone || null,
        personality: data.personality || null,
        words_to_use: data.words_to_use || null,
        words_to_avoid: data.words_to_avoid || null,
        example_posts: data.example_posts || null,
      });

      return brandKit;
    } catch (error) {
      throw new AppError('Failed to create brand kit', 500);
    }
  }

  /**
   * Get all brand kits for a user
   */
  async getUserBrandKits(userId: UUID) {
    try {
      const brandKits = await brandKitRepo.findByUserId(userId);
      return brandKits;
    } catch (error) {
      throw new AppError('Failed to fetch brand kits', 500);
    }
  }

  /**
   * Get a single brand kit by ID and verify ownership
   */
  async getBrandKitById(brandKitId: UUID, userId: UUID) {
    try {
      const brandKit = await brandKitRepo.findOne(brandKitId);

      if (!brandKit) {
        throw new AppError('Brand kit not found', 404);
      }

      // Verify ownership
      if (brandKit.user_id !== userId) {
        throw new AppError('Unauthorized access to brand kit', 403);
      }

      return brandKit;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch brand kit', 500);
    }
  }

  /**
   * Update a brand kit and verify ownership
   */
  async updateBrandKit(brandKitId: UUID, userId: UUID, data: UpdateBrandKitInput) {
    try {
      // First verify ownership by fetching the brand kit
      const existingBrandKit = await this.getBrandKitById(brandKitId, userId);

      // Update the brand kit
      const updatedBrandKit = await brandKitRepo.update(brandKitId, {
        ...data,
        tone: data.tone === undefined ? undefined : (data.tone || null),
        personality: data.personality === undefined ? undefined : (data.personality || null),
        words_to_use: data.words_to_use === undefined ? undefined : (data.words_to_use || null),
        words_to_avoid: data.words_to_avoid === undefined ? undefined : (data.words_to_avoid || null),
        example_posts: data.example_posts === undefined ? undefined : (data.example_posts || null),
      });

      if (!updatedBrandKit) {
        throw new AppError('Brand kit not found', 404);
      }

      return updatedBrandKit;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update brand kit', 500);
    }
  }

  /**
   * Delete a brand kit and verify ownership
   */
  async deleteBrandKit(brandKitId: UUID, userId: UUID) {
    try {
      // First verify ownership by fetching the brand kit
      await this.getBrandKitById(brandKitId, userId);

      // Delete the brand kit
      await brandKitRepo.delete(brandKitId);

      return { message: 'Brand kit deleted successfully' };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete brand kit', 500);
    }
  }
}

export const brandKitService = new BrandKitService();