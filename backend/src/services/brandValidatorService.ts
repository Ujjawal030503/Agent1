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

    // 2. Check words to use (Deterministic)
    if (brandKit.words_to_use && brandKit.words_to_use.length > 0) {
      const lowerPost = postText.toLowerCase();
      const usedWords = brandKit.words_to_use.filter(word => 
        lowerPost.includes(word.toLowerCase())
      );

      if (usedWords.length > 0) {
        notes.push(`Good use of brand words: ${usedWords.join(', ')}`);
      } else {
        score -= 10;
        notes.push(`Could use more brand words: ${brandKit.words_to_use.slice(0, 3).join(', ')}...`);
      }
    }

    // 3. Check tone and personality (LLM)
    const hasToneGuidelines = brandKit.tone || brandKit.personality || brandKit.example_posts;
    
    if (hasToneGuidelines) {
      const validationPrompt = this.buildValidationPrompt(postText, brandKit);
      try {
        const llmResponse = await llmService.complete(validationPrompt);
        const analysis = this.parseLLMResponse(llmResponse);
        
        if (analysis) {
            let llmScore = analysis.score;
            if (typeof llmScore !== 'number') llmScore = 80; // Default if missing

            // If we found words to avoid, ensure the score is low regardless of LLM
            if (notes.some(note => note.includes('prohibited words')) && llmScore > 70) {
                llmScore = 60; 
            }

            // Combine deterministic and LLM scores (weighted average)
            score = Math.round((score + llmScore) / 2);
            
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
    } else {
      // Minimal brand kit - only use deterministic checks
      notes.push("Brand kit has minimal guidelines. Using basic validation only.");
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
      You are a Brand Validator Agent. Your task is to ensure that social media posts align with brand guidelines.
      
      Brand Guidelines:
      - Brand Name: ${brandKit.brand_name || 'Not specified'}
      - Tone: ${brandKit.tone || 'Not specified'}
      - Personality: ${brandKit.personality || 'Not specified'}
      - Words to Avoid: ${brandKit.words_to_avoid?.join(', ') || 'None'}
      - Words to Use: ${brandKit.words_to_use?.join(', ') || 'None'}
      - Example Style: ${brandKit.example_posts || 'None'}

      Post to Validate:
      "${post}"

      Validation Instructions:
      1. Analyze the post for alignment with brand personality and tone.
      2. Check for any words to avoid in the post.
      3. Verify if the post uses recommended brand words.
      4. Compare the style to the example posts (if provided).
      5. Assign a consistency score (0-100) based on overall brand alignment.
      6. Provide specific feedback notes about what works well and what could be improved.
      7. If the score is below 80, suggest a revised version that better aligns with brand guidelines.

      Scoring Guidelines:
      - 90-100: Perfect alignment with brand guidelines
      - 80-89: Good alignment with minor improvements needed
      - 70-79: Moderate alignment with noticeable issues
      - 60-69: Poor alignment with significant issues
      - Below 60: Major misalignment with brand guidelines

      Output JSON format:
      {
        "score": number, // 0-100 consistency score
        "notes": string[], // Specific feedback about alignment
        "revised_post": string | null // Suggested revision if score < 80
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
        // Fallback: try to extract score and notes from text
        const scoreMatch = response.match(/score[\s:]*(\d+)/i);
        const notesMatch = response.match(/notes[\s:]*([\s\S]*)/i);
        
        if (scoreMatch) {
            const score = parseInt(scoreMatch[1]);
            const notes = notesMatch ? [notesMatch[1].trim()] : ["Manual validation: Check brand alignment"];
            return { score, notes, revised_post: null };
        }
        
        return null;
    }
  }
}

export const brandValidatorService = new BrandValidatorService();
