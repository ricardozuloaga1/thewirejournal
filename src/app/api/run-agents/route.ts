/**
 * POST /api/run-agents
 * 
 * Triggers all AI agents to generate articles.
 * Called by cron job at 8 AM daily.
 */

import { NextRequest, NextResponse } from 'next/server';
import { runAllAgents } from '@/lib/agents';
import { supabaseAdmin } from '@/lib/supabase/client';

export const maxDuration = 300; // 5 minutes max for Vercel
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get word count from request body
    const body = await request.json().catch(() => ({}));
    const wordCount = body.wordCount || 800;
    
    // Optional: Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Allow without auth in development
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Log the run start
    const { data: runLog } = await supabaseAdmin
      .from('agent_runs')
      .insert({
        agent_name: 'orchestrator',
        status: 'running',
        articles_created: 0,
        metadata: { startedAt: new Date().toISOString(), wordCount },
      })
      .select('id')
      .single();

    console.log('Starting agent run...', runLog?.id);

    // Run all agents
    const result = await runAllAgents(wordCount);

    // Update run log
    if (runLog?.id) {
      await supabaseAdmin
        .from('agent_runs')
        .update({
          status: result.success ? 'success' : 'error',
          articles_created: result.articlesCreated,
          error_message: result.errors.length > 0 ? result.errors.join('; ') : null,
          metadata: {
            completedAt: new Date().toISOString(),
            errors: result.errors,
          },
        })
        .eq('id', runLog.id);
    }

    return NextResponse.json({
      success: result.success,
      articlesCreated: result.articlesCreated,
      errors: result.errors,
      runId: runLog?.id,
    });
  } catch (error) {
    console.error('Agent run failed:', error);
    return NextResponse.json(
      { 
        error: 'Agent run failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Also support GET for easy testing
export async function GET(request: NextRequest) {
  return POST(request);
}

