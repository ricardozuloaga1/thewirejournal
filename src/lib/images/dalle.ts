/**
 * DALL-E Image Generation
 * 
 * Generates news-style images using OpenAI's DALL-E 3
 */

import OpenAI from 'openai';

export interface GeneratedImage {
  id: string;
  base64: string;
  url: string;
  prompt: string;
}

export interface ImageGenerationResult {
  images: GeneratedImage[];
  prompt: string;
}

/**
 * Generate a prompt for news article images
 */
export function generateImagePrompt(title: string, excerpt: string, section: string): string {
  const sectionStyle: Record<string, string> = {
    politics: 'government building, Capitol, press conference, diplomatic setting',
    economics: 'financial district, stock trading floor, Federal Reserve, economic charts',
    world: 'international landmark, global cityscape, diplomatic gathering',
    business: 'corporate boardroom, modern office, business executives',
    tech: 'modern technology, data center, Silicon Valley office, tech devices',
    opinion: 'thoughtful editorial imagery, symbolic representation',
  };

  const style = sectionStyle[section] || 'professional news photography';

  return `Professional photojournalistic image for a major newspaper article about: "${title}". Style: ${style}. Requirements: Landscape 16:9, realistic editorial photography, no text or watermarks, neutral lighting, sharp focus, suitable for newspaper front page.`;
}

/**
 * Generate images using DALL-E 3
 */
export async function generateArticleImages(
  title: string,
  excerpt: string,
  section: string
): Promise<ImageGenerationResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const openai = new OpenAI({ apiKey });
  const basePrompt = generateImagePrompt(title, excerpt, section);
  const images: GeneratedImage[] = [];

  // Generate 3 different images with slight variations
  const variations = [
    basePrompt,
    basePrompt + ' Wide establishing shot.',
    basePrompt + ' Close-up detail shot.',
  ];

  for (let i = 0; i < 3; i++) {
    try {
      console.log(`Generating image ${i + 1}/3...`);
      
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: variations[i],
        n: 1,
        size: '1792x1024', // Landscape
        quality: 'standard',
        response_format: 'url',
      });

      if (response.data && response.data[0]?.url) {
        images.push({
          id: `dalle-${Date.now()}-${i}`,
          base64: '', // We'll use URL instead
          url: response.data[0].url,
          prompt: variations[i],
        });
      }
    } catch (error) {
      console.error(`Failed to generate image ${i + 1}:`, error);
      // Continue with other images even if one fails
    }
  }

  return { images, prompt: basePrompt };
}

