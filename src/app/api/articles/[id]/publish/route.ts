/**
 * POST /api/articles/[id]/publish
 * 
 * Publish an article (change status from draft to published)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('articles')
      .update({ status: 'published' })
      .eq('id', id)
      .eq('status', 'draft')
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Article not found or not in draft status' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      article: data,
      message: 'Article published successfully' 
    });
  } catch (error) {
    console.error('Failed to publish article:', error);
    return NextResponse.json(
      { error: 'Failed to publish article' },
      { status: 500 }
    );
  }
}

