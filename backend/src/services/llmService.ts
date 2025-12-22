
export interface LLMResponse {
  content: string;
}

export class LLMService {
  async complete(prompt: string): Promise<string> {
    // TODO: Implement actual LLM call (e.g., OpenAI)
    // For now, return a mock response based on the prompt context
    console.log('LLM Prompt:', prompt);
    
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 500));

    if (prompt.includes('Brand Validator Agent')) {
        // Simulate different validation scenarios
        if (prompt.includes('prohibited') || prompt.includes('avoid')) {
            return JSON.stringify({
                score: 65,
                notes: ["Tone is inconsistent with brand personality.", "Contains words that should be avoided."],
                revised_post: "Here's a revised version that better aligns with your brand tone and avoids prohibited words."
            });
        } else if (prompt.includes('innovative') && prompt.includes('growth')) {
            return JSON.stringify({
                score: 90,
                notes: ["Excellent alignment with brand guidelines.", "Tone and personality are consistent."],
                revised_post: null
            });
        } else if (prompt.includes('example') || prompt.includes('style')) {
            return JSON.stringify({
                score: 85,
                notes: ["Good alignment with brand guidelines.", "Tone is mostly consistent."],
                revised_post: null
            });
        } else {
            return JSON.stringify({
                score: 85,
                notes: ["Tone is mostly consistent but could be more enthusiastic.", "No words to avoid found."],
                revised_post: null
            });
        }
    }

    if (prompt.includes('Generate 3 social media posts')) {
         return JSON.stringify([
             "Just discovered something amazing regarding this niche! 🚀 #growth",
             "The industry is evolving fast. Here are 3 trends you can't ignore.",
             "Pro tip: Don't just follow best practices—understand WHY they work."
         ]);
    }

    return "Mock LLM Response";
  }
}

export const llmService = new LLMService();
