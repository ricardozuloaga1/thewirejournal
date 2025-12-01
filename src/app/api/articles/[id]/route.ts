/**
 * Article CRUD operations
 * 
 * GET /api/articles/[id] - Get single article
 * PATCH /api/articles/[id] - Update article (status, content, etc.)
 * DELETE /api/articles/[id] - Delete article
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single article
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ article: data });
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// UPDATE article
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate allowed fields
    const allowedFields = ['title', 'excerpt', 'body', 'status', 'quality_score'];
    const updates: Record<string, unknown> = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ article: data });
  } catch (error) {
    console.error('Failed to update article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE article (or set to discarded)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const hard = searchParams.get('hard') === 'true';

    if (hard) {
      // Hard delete
      const { error } = await supabaseAdmin
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } else {
      // Soft delete (set status to discarded)
      const { error } = await supabaseAdmin
        .from('articles')
        .update({ status: 'discarded' })
        .eq('id', id);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}

