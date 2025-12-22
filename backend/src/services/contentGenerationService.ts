import { contentRequestRepo, generatedPostRepo, brandKitRepo } from '../utils/db-queries.js';
import { llmService } from './llmService.js';
import { brandValidatorService } from './brandValidatorService.js';
import { GeneratedPost, Platform, UUID } from '../../../shared/types/database.js';

interface GenerateOptions {
    userId: UUID;
    niche: string;
    platform: Platform;
    brandKitId?: UUID;
}

export class ContentGenerationService {
    async generate(options: GenerateOptions): Promise<GeneratedPost[]> {
        // 1. Create Content Request
        const contentRequest = await contentRequestRepo.create({
            user_id: options.userId,
            niche: options.niche,
            platform: options.platform,
            brand_kit_id: options.brandKitId,
            status: 'processing'
        });

        // 2. Get Brand Kit
        let brandKit = null;
        if (options.brandKitId) {
            brandKit = await brandKitRepo.findOne(options.brandKitId);
        }

        // 3. Generate Posts
        const postsText = await this.generateRawPosts(options.niche, options.platform, brandKit);

        const generatedPosts: GeneratedPost[] = [];

        // 4. Process each post
        for (const text of postsText) {
            // 5. Validate
            const validation = await brandValidatorService.validate(text, brandKit);

            // 6. Save
            const post = await generatedPostRepo.create({
                content_request_id: contentRequest.id,
                platform: options.platform,
                post_text: text, 
                confidence_score: validation.score
            });
            
            // Attach validation notes to the object
            (post as any).validation_notes = validation.notes;
            (post as any).revised_text = validation.revisedText;

            generatedPosts.push(post);
        }

        // Update request status
        await contentRequestRepo.update(contentRequest.id, { status: 'completed' });

        return generatedPosts;
    }

    private async generateRawPosts(niche: string, platform: Platform, brandKit: any): Promise<string[]> {
         const prompt = `
            Generate 3 social media posts for ${platform} about "${niche}".
            ${brandKit ? `
            Brand Tone: ${brandKit.tone}
            Brand Personality: ${brandKit.personality}
            Words to Use: ${brandKit.words_to_use?.join(', ')}
            Words to Avoid: ${brandKit.words_to_avoid?.join(', ')}
            ` : ''}
            
            Output a JSON array of strings.
         `;

         try {
             const response = await llmService.complete(prompt);
             const match = response.match(/\[[\s\S]*\]/);
             if (match) {
                 return JSON.parse(match[0]);
             }
             return [
                 `Just discovered something amazing about ${niche}! 🚀`,
                 `The ${niche} industry is evolving fast.`,
                 `Pro tip for anyone working in ${niche}: Always stay curious.`
             ];
         } catch (e) {
             console.error("Generation failed", e);
             return [
                 `Just discovered something amazing about ${niche}! 🚀`,
                 `The ${niche} industry is evolving fast.`,
                 `Pro tip for anyone working in ${niche}: Always stay curious.`
             ];
         }
    }
}

export const contentGenerationService = new ContentGenerationService();
