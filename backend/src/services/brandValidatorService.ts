import { BrandKit } from '../../../shared/types/database.js';
import { llmService } from './llmService.js';

export interface ValidationResult {
  score: number;
  notes: string[];
  revisedText?: string | null;
}

export class BrandValidatorService {
  async validate(postText: string, brandKit: BrandKit | null): Promise<ValidationResult> {
    const notes: string[] = [];
    let score = 100;

    if (!brandKit) {
      return { score: 100, notes: ['No brand kit provided.'], revisedText: null };
    }

    // 1. Check words to avoid (Deterministic)
    if (brandKit.words_to_avoid && brandKit.words_to_avoid.length > 0) {
      const lowerPost = postText.toLowerCase();
      const foundWords = brandKit.words_to_avoid.filter(word => 
        lowerPost.includes(word.toLowerCase())
      );

      if (foundWords.length > 0) {
        score -= 20 * foundWords.length;
        notes.push(`Found prohibited words: ${foundWords.join(', ')}`);
      }
    }

    // 2. Check tone and personality (LLM)
    if (brandKit.tone || brandKit.personality || brandKit.example_posts) {
      const validationPrompt = this.buildValidationPrompt(postText, brandKit);
      try {
        const llmResponse = await llmService.complete(validationPrompt);
        const analysis = this.parseLLMResponse(llmResponse);
        
        if (analysis) {
            // Average the deterministic score with LLM score or just take the minimum?
            // Let's take the LLM score but penalize further if we found prohibited words earlier.
            // Actually, let's trust the LLM's holistic score but ensure our hard constraints lower it.
            
            let llmScore = analysis.score;
            if (typeof llmScore !== 'number') llmScore = 80; // Default if missing

            // If we found words to avoid, ensure the score is low regardless of LLM
            if (notes.length > 0 && llmScore > 70) {
                llmScore = 60; 
            }

            score = llmScore;
            
            if (analysis.notes && Array.isArray(analysis.notes)) {
                notes.push(...analysis.notes);
            }
            
            if (analysis.revised_post) {
                return {
                    score,
                    notes,
                    revisedText: analysis.revised_post
                };
            }
        }
      } catch (error) {
        console.error("LLM validation failed", error);
        notes.push("Tone validation failed due to service error.");
      }
    }
    
    // Ensure score is 0-100
    score = Math.max(0, Math.min(100, score));

    return {
      score,
      notes,
      revisedText: null
    };
  }

  private buildValidationPrompt(post: string, brandKit: BrandKit): string {
    return `
      You are a Brand Validator Agent.
      
      Brand Guidelines:
      Tone: ${brandKit.tone || 'Not specified'}
      Personality: ${brandKit.personality || 'Not specified'}
      Words to Avoid: ${brandKit.words_to_avoid?.join(', ') || 'None'}
      Example Style: ${brandKit.example_posts || 'None'}

      Post to Validate:
      "${post}"

      Task:
      1. Check if the post aligns with the brand personality and tone.
      2. Check for words to avoid (if any).
      3. Assign a consistency score (0-100).
      4. Provide brief feedback notes.
      5. Suggest a revision if the score is below 80.

      Output JSON format:
      {
        "score": number,
        "notes": string[],
        "revised_post": string | null
      }
    `;
  }

  private parseLLMResponse(response: string): any {
    try {
        // Try to find JSON in the response (handling markdown code blocks)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(response);
    } catch (e) {
        console.warn("Failed to parse LLM response", e);
        return null;
    }
  }
}

export const brandValidatorService = new BrandValidatorService();
