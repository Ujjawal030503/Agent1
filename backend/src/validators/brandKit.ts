import { z } from 'zod';

export const createBrandKitSchema = z.object({
  brand_name: z
    .string()
    .min(1, 'Brand name is required')
    .max(255, 'Brand name must be 255 characters or less'),
  tone: z
    .string()
    .max(1000, 'Tone description must be 1000 characters or less')
    .optional()
    .nullable(),
  personality: z
    .string()
    .max(1000, 'Personality description must be 1000 characters or less')
    .optional()
    .nullable(),
  words_to_use: z
    .array(z.string().max(100, 'Each word/phrase must be 100 characters or less'))
    .max(50, 'Maximum 50 words/phrases allowed')
    .optional()
    .nullable(),
  words_to_avoid: z
    .array(z.string().max(100, 'Each word/phrase must be 100 characters or less'))
    .max(50, 'Maximum 50 words/phrases allowed')
    .optional()
    .nullable(),
  example_posts: z
    .string()
    .max(5000, 'Example posts must be 5000 characters or less')
    .optional()
    .nullable(),
});

export const updateBrandKitSchema = createBrandKitSchema.partial();

export const brandKitIdSchema = z.string().uuid('Invalid brand kit ID format');

// Input types from schemas
export type CreateBrandKitInput = z.infer<typeof createBrandKitSchema>;
export type UpdateBrandKitInput = z.infer<typeof updateBrandKitSchema>;
export type BrandKitIdInput = z.infer<typeof brandKitIdSchema>;