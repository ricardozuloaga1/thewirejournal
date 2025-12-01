import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    time: new Date().toISOString(),
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasPerplexity: !!process.env.PERPLEXITY_API_KEY,
    }
  });
}


