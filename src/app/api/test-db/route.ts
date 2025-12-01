import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ 
      error: 'Missing env vars',
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
    }, { status: 500 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Simple query to test connection - just count articles
    const { count, error } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({ 
        error: error.message,
        code: error.code,
        hint: error.hint,
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      articleCount: count,
      message: 'Database connection successful!'
    });
  } catch (err) {
    return NextResponse.json({ 
      error: String(err),
    }, { status: 500 });
  }
}


