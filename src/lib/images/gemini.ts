/**
 * Gemini/Imagen Image Generation
 * 
 * Generates news-style images using Google's Imagen 3 via Gemini API
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../supabase/types';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict';

export interface GeneratedImage {
  id: string;
  base64: string;
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
    politics: 'formal government setting, Capitol building, press conference, diplomatic meeting',
    economics: 'financial district, stock market displays, Federal Reserve building, economic charts',
    world: 'international landmarks, global cityscape, diplomatic gathering, world map',
    business: 'corporate boardroom, modern office, business meeting, corporate headquarters',
    tech: 'modern technology, silicon valley, data center, futuristic office, tech devices',
    opinion: 'thoughtful editorial style, abstract concept visualization, symbolic imagery',
  };

  const style = sectionStyle[section] || 'professional news photography';

  return `Professional photojournalistic image for The Wire Journal article. 
Subject: ${title}
Context: ${excerpt}
Style: ${style}

Requirements:
- Landscape orientation (16:9 aspect ratio)
- Professional news photography aesthetic
- No text, watermarks, or logos
- Realistic, high-quality editorial style
- Neutral lighting, sharp focus
- Suitable for a major newspaper front page`;
}

/**
 * Generate 3 image options for an article
 */
export async function generateArticleImages(
  title: string,
  excerpt: string,
  section: string
): Promise<ImageGenerationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const prompt = generateImagePrompt(title, excerpt, section);
  const images: GeneratedImage[] = [];

  // Generate 3 images
  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: '16:9',
            safetyFilterLevel: 'block_few',
            personGeneration: 'allow_adult',
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`Imagen API error: ${response.status}`, error);
        continue;
      }

      const data = await response.json();
      
      if (data.predictions?.[0]?.bytesBase64Encoded) {
        images.push({
          id: `img-${Date.now()}-${i}`,
          base64: data.predictions[0].bytesBase64Encoded,
          prompt,
        });
      }
    } catch (error) {
      console.error(`Failed to generate image ${i + 1}:`, error);
    }
  }

  // If Imagen fails, try using Gemini's native image generation
  if (images.length === 0) {
    console.log('Imagen failed, trying alternative...');
    const altImages = await generateWithGeminiFlash(prompt, apiKey);
    images.push(...altImages);
  }

  return { images, prompt };
}

/**
 * Alternative: Use Gemini Flash for image generation concepts
 * Returns placeholder URLs that can be replaced with actual image service
 */
async function generateWithGeminiFlash(prompt: string, apiKey: string): Promise<GeneratedImage[]> {
  // For now, return placeholder image concepts
  // In production, you'd integrate with another image API like DALL-E or Stable Diffusion
  
  const placeholderImages: GeneratedImage[] = [];
  
  // Generate 3 variations of the prompt for different image concepts
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Based on this image prompt for a news article, suggest 3 different specific visual scenes that would work well as photographs. Be very specific about what's in each scene.

Prompt: ${prompt}

Return as JSON array with 3 objects, each having "scene" (detailed description) and "keywords" (5 key visual elements):
[{"scene": "...", "keywords": ["..."]}, ...]`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const scenes = JSON.parse(jsonMatch[0]);
        scenes.forEach((scene: { scene: string; keywords: string[] }, i: number) => {
          // Create a placeholder with the scene description
          placeholderImages.push({
            id: `placeholder-${Date.now()}-${i}`,
            base64: '', // Empty - will use placeholder UI
            prompt: scene.scene,
          });
        });
      }
    }
  } catch (error) {
    console.error('Gemini Flash fallback failed:', error);
  }

  // Return at least empty placeholders
  while (placeholderImages.length < 3) {
    placeholderImages.push({
      id: `placeholder-${Date.now()}-${placeholderImages.length}`,
      base64: '',
      prompt: prompt,
    });
  }

  return placeholderImages;
}

/**
 * Save selected image to database
 * NOTE: This function is not currently used in the app
 */
// export async function saveArticleImage(
//   articleId: string,
//   imageData: GeneratedImage,
//   supabase: ReturnType<typeof createClient<Database>>
// ): Promise<string | null> {
//   try {
//     const { data, error } = await supabase
//       .from('images')
//       .insert({
//         article_id: articleId,
//         image_type: 'ai_generated',
//         url: imageData.base64 ? `data:image/png;base64,${imageData.base64}` : '',
//         prompt: imageData.prompt,
//         alt_text: imageData.prompt.slice(0, 200),
//       } as any)
//       .select('id')
//       .single();

//     if (error) {
//       console.error('Failed to save image:', error);
//       return null;
//     }

//     // Update article with image_id
//     await supabase
//       .from('articles')
//       .update({ image_id: data.id } as Record<string, unknown>)
//       .eq('id', articleId);

//     return data.id;
//   } catch (error) {
//     console.error('Error saving image:', error);
//     return null;
//   }
// }
