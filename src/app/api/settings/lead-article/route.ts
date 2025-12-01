/**
 * GET /api/settings/lead-article
 * 
 * Get the current lead article ID
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'lead_article_id')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({
      leadArticleId: data?.value || null,
    });
  } catch (error) {
    console.error('Failed to get lead article:', error);
    return NextResponse.json({ leadArticleId: null });
  }
}


