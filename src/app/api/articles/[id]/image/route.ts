/**
 * POST /api/articles/[id]/image
 * 
 * Save selected image for an article
 * Body: { imageData: { id, url?, base64?, prompt?, source?, sourceDomain? } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { imageData } = body;

    if (!imageData) {
      return NextResponse.json({ error: 'imageData is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Determine the image URL to store
    const imageUrl = imageData.url || 
                     (imageData.base64 ? `data:image/png;base64,${imageData.base64}` : '');

    // Determine image type based on source
    const imageType = imageData.source === 'extracted' ? 'extracted' : 'ai_generated';
    
    // Build alt text
    const altText = imageData.source === 'extracted' 
      ? `Image from ${imageData.sourceDomain || 'news source'}`
      : imageData.prompt?.slice(0, 200) || 'Article image';

    // Save image to database
    const { data: imageRecord, error: imageError } = await supabase
      .from('images')
      .insert({
        article_id: id,
        image_type: imageType,
        url: imageUrl,
        origin_url: imageData.source === 'extracted' ? imageData.sourceUrl : null,
        prompt: imageData.prompt || '',
        alt_text: altText,
      })
      .select('id')
      .single();

    if (imageError) {
      console.error('Failed to save image:', imageError);
      return NextResponse.json({ error: imageError.message }, { status: 500 });
    }

    // Update article with image_id
    const { error: updateError } = await supabase
      .from('articles')
      .update({ image_id: imageRecord.id })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to update article:', updateError);
    }

    return NextResponse.json({
      success: true,
      imageId: imageRecord.id,
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error('Failed to save image:', error);
    return NextResponse.json(
      { error: 'Failed to save image' },
      { status: 500 }
    );
  }
}
