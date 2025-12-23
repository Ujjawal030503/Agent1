import { BrandValidatorService } from './brandValidatorService';
import type { BrandKit } from '../../../shared/types/database.js';

describe('BrandValidatorService', () => {
  const validator = new BrandValidatorService();
  
  const mockBrandKit: BrandKit = {
    id: 'test-brand-kit-id',
    user_id: 'test-user-id',
    brand_name: 'Test Brand',
    tone: 'Professional and friendly',
    personality: 'Helpful expert',
    words_to_use: ['innovative', 'solution', 'expert'],
    words_to_avoid: ['cheap', 'easy', 'simple'],
    example_posts: 'Our innovative solutions help experts achieve their goals efficiently.',
    created_at: new Date(),
    updated_at: new Date(),
  };

  test('should handle missing brand kit', async () => {
    const result = await validator.validate('Test post', null);
    expect(result.score).toBe(100);
    expect(result.notes).toContain('No brand kit provided.');
    expect(result.revisedText).toBeNull();
  });

  test('should detect words to avoid', async () => {
    const postText = 'This is a cheap and easy solution for your problems.';
    const result = await validator.validate(postText, mockBrandKit);
    
    expect(result.score).toBeLessThan(100);
    expect(result.notes.some(note => note.includes('prohibited words'))).toBe(true);
    expect(result.notes.some(note => note.includes('cheap'))).toBe(true);
  });

  test('should check for words to use', async () => {
    const postText = 'Our innovative solutions help experts achieve their goals.';
    const result = await validator.validate(postText, mockBrandKit);
    
    expect(result.notes.some(note => note.includes('Good use of brand words'))).toBe(true);
  });

  test('should handle minimal brand kit', async () => {
    const minimalBrandKit: BrandKit = {
      id: 'minimal-brand-kit-id',
      user_id: 'test-user-id',
      brand_name: 'Minimal Brand',
      tone: null,
      personality: null,
      words_to_use: null,
      words_to_avoid: null,
      example_posts: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    
    const result = await validator.validate('Test post', minimalBrandKit);
    expect(result.notes.some(note => note.includes('minimal guidelines'))).toBe(true);
  });

  test('should return valid score range', async () => {
    const result = await validator.validate('Test post', mockBrandKit);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  test('should handle empty words arrays', async () => {
    const brandKitWithEmptyArrays: BrandKit = {
      ...mockBrandKit,
      words_to_use: [],
      words_to_avoid: [],
    };
    
    const result = await validator.validate('Test post', brandKitWithEmptyArrays);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});