/**
 * GET /api/articles
 * 
 * List articles with filtering options.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Missing Supabase configuration',
        articles: [] 
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const section = searchParams.get('section');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    let query = supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    if (section) {
      query = query.eq('section', section);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ 
        error: error.message,
        articles: [] 
      }, { status: 500 });
    }

    return NextResponse.json({ articles: data || [] });
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles', articles: [] },
      { status: 500 }
    );
  }
}
