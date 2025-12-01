/**
 * POST /api/generate-images
 * 
 * 3-Tier Image Pipeline:
 * 1. Extract OG images from news sources (free, fast, authentic)
 * 2. Gemini Imagen generation (fallback)
 * 3. DALL-E generation (final fallback)
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { extractImagesFromSources, type ExtractedImage } from '@/lib/images/extract';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

interface GeneratedImage {
  id: string;
  url: string;
  prompt?: string;
  source: 'extracted' | 'gemini' | 'dalle';
  sourceDomain?: string; // For extracted images
}

function generateImagePrompt(title: string, section: string): string {
  const sectionStyle: Record<string, string> = {
    politics: 'government building, Capitol, press conference, diplomatic setting',
    economics: 'financial district, stock trading floor, Federal Reserve building',
    world: 'international landmark, global cityscape, diplomatic gathering',
    business: 'corporate boardroom, modern office, business executives meeting',
    tech: 'modern technology, data center, Silicon Valley, tech devices',
    opinion: 'thoughtful editorial imagery, symbolic representation',
  };

  const style = sectionStyle[section] || 'professional news photography';

  return `Professional photojournalistic image for a major newspaper. Topic: "${title}". Visual style: ${style}. Requirements: Realistic editorial photo, landscape orientation, no text or logos, neutral professional lighting.`;
}

/**
 * Tier 1: Extract images from news source URLs
 */
async function extractFromSources(sources: { url: string }[]): Promise<GeneratedImage[]> {
  if (!sources || sources.length === 0) {
    return [];
  }

  console.log(`Tier 1: Extracting images from ${sources.length} sources...`);
  
  try {
    const extracted = await extractImagesFromSources(sources, 3);
    return extracted.map((img: ExtractedImage) => ({
      id: img.id,
      url: img.url,
      source: 'extracted' as const,
      sourceDomain: img.sourceDomain,
    }));
  } catch (error) {
    console.error('Extraction failed:', error);
    return [];
  }
}

/**
 * Tier 2: Generate with Gemini Imagen
 */
async function generateWithGemini(prompt: string, count: number): Promise<GeneratedImage[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('Gemini API key not configured, skipping...');
    return [];
  }

  console.log(`Tier 2: Generating ${count} images with Gemini...`);
  const images: GeneratedImage[] = [];
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;

  for (let i = 0; i < count; i++) {
    try {
      const variation = i === 0 ? prompt : 
                       i === 1 ? prompt + ' Wide angle establishing shot.' :
                       prompt + ' Close-up detailed perspective.';

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: variation }],
          parameters: {
            sampleCount: 1,
            aspectRatio: '16:9',
            safetyFilterLevel: 'block_few',
            personGeneration: 'allow_adult',
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini error ${i}:`, response.status, errorText);
        continue;
      }

      const data = await response.json();
      
      if (data.predictions?.[0]?.bytesBase64Encoded) {
        const base64 = data.predictions[0].bytesBase64Encoded;
        images.push({
          id: `gemini-${Date.now()}-${i}`,
          url: `data:image/png;base64,${base64}`,
          prompt: variation,
          source: 'gemini',
        });
      }
    } catch (error) {
      console.error(`Gemini image ${i} failed:`, error);
    }
  }

  return images;
}

/**
 * Tier 3: Generate with DALL-E (final fallback)
 */
async function generateWithDalle(prompt: string, count: number): Promise<GeneratedImage[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log('OpenAI API key not configured, skipping...');
    return [];
  }

  console.log(`Tier 3: Generating ${count} images with DALL-E...`);
  const openai = new OpenAI({ apiKey });
  const images: GeneratedImage[] = [];

  for (let i = 0; i < count; i++) {
    try {
      const variation = i === 0 ? prompt : 
                       i === 1 ? prompt + ' Wide establishing shot.' :
                       prompt + ' Detailed close-up perspective.';
      
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: variation,
        n: 1,
        size: '1792x1024',
        quality: 'standard',
      });

      if (response.data && response.data[0]?.url) {
        images.push({
          id: `dalle-${Date.now()}-${i}`,
          url: response.data[0].url,
          prompt: variation,
          source: 'dalle',
        });
      }
    } catch (err) {
      console.error(`DALL-E image ${i} failed:`, err);
    }
  }

  return images;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, section, sources } = body;

    if (!title || !section) {
      return NextResponse.json(
        { error: 'title and section are required' },
        { status: 400 }
      );
    }

    console.log(`\n========================================`);
    console.log(`Image Pipeline for: ${title}`);
    console.log(`Sources available: ${sources?.length || 0}`);
    console.log(`========================================\n`);

    const allImages: GeneratedImage[] = [];
    const targetCount = 3;

    // Tier 1: Extract from sources
    if (sources && sources.length > 0) {
      const extracted = await extractFromSources(sources);
      allImages.push(...extracted);
      console.log(`After extraction: ${allImages.length} images`);
    }

    // Tier 2: Gemini (if we need more)
    if (allImages.length < targetCount) {
      const needed = targetCount - allImages.length;
      const geminiImages = await generateWithGemini(
        generateImagePrompt(title, section),
        needed
      );
      allImages.push(...geminiImages);
      console.log(`After Gemini: ${allImages.length} images`);
    }

    // Tier 3: DALL-E (if we still need more)
    if (allImages.length < targetCount) {
      const needed = targetCount - allImages.length;
      const dalleImages = await generateWithDalle(
        generateImagePrompt(title, section),
        needed
      );
      allImages.push(...dalleImages);
      console.log(`After DALL-E: ${allImages.length} images`);
    }

    // Determine primary source for response metadata
    const primarySource = allImages.length > 0 
      ? allImages[0].source 
      : 'none';

    console.log(`\nFinal result: ${allImages.length} images`);
    console.log(`Sources: ${allImages.map(i => i.source).join(', ')}\n`);

    if (allImages.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate any images from all tiers' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      images: allImages,
      source: primarySource,
      breakdown: {
        extracted: allImages.filter(i => i.source === 'extracted').length,
        gemini: allImages.filter(i => i.source === 'gemini').length,
        dalle: allImages.filter(i => i.source === 'dalle').length,
      },
    });
  } catch (error) {
    console.error('Image pipeline failed:', error);
    return NextResponse.json(
      { 
        error: 'Image pipeline failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
