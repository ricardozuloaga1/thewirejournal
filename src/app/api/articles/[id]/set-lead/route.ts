/**
 * POST /api/articles/[id]/set-lead
 * 
 * Set an article as the lead/featured story on the homepage
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // First, get or create the settings record
    const { data: existingSettings } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'lead_article_id')
      .single();

    if (existingSettings) {
      // Update existing setting
      const { error } = await supabase
        .from('site_settings')
        .update({ value: id, updated_at: new Date().toISOString() })
        .eq('key', 'lead_article_id');

      if (error) throw error;
    } else {
      // Insert new setting
      const { error } = await supabase
        .from('site_settings')
        .insert({ key: 'lead_article_id', value: id });

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Lead story updated',
      articleId: id,
    });
  } catch (error) {
    console.error('Failed to set lead story:', error);
    return NextResponse.json(
      { error: 'Failed to set lead story' },
      { status: 500 }
    );
  }
}


