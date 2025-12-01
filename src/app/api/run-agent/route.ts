/**
 * POST /api/run-agent
 * 
 * Run a specific agent for a chosen section.
 * Body: { section: 'politics' | 'economics' | 'opinion', topic?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 300; // 5 minutes max
export const dynamic = 'force-dynamic';

// Import agent functions dynamically to avoid build issues
async function runAgentForSection(section: string, customTopic?: string) {
  const { getPoliticsAgent } = await import('@/lib/agents/politics-agent');
  const { getEconomicsAgent } = await import('@/lib/agents/economics-agent');
  const { getOpinionAgent } = await import('@/lib/agents/opinion-agent');
  const { getWorldAgent } = await import('@/lib/agents/world-agent');
  const { getBusinessAgent } = await import('@/lib/agents/business-agent');
  const { getTechAgent } = await import('@/lib/agents/tech-agent');
  const { generateResearchPacket, researchSingleTopic } = await import('@/lib/research');
  
  const agentMap: Record<string, () => any> = {
    politics: getPoliticsAgent,
    economics: getEconomicsAgent,
    opinion: getOpinionAgent,
    world: getWorldAgent,
    business: getBusinessAgent,
    tech: getTechAgent,
  };

  const getAgent = agentMap[section];
  if (!getAgent) {
    throw new Error(`Unknown section: ${section}`);
  }

  const agent = getAgent();
  
  // If custom topic provided, research just that topic
  let researchPacket;
  if (customTopic) {
    const topicResearch = await researchSingleTopic(customTopic, section as 'politics' | 'economics' | 'opinion');
    researchPacket = {
      section,
      generatedAt: new Date().toISOString(),
      topics: [topicResearch],
    };
  } else {
    researchPacket = await generateResearchPacket(section as 'politics' | 'economics' | 'opinion');
  }

  const articles = await agent.generateArticles(researchPacket);
  return articles;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60) + '-' + Math.random().toString(36).slice(2, 10);
}

function estimateReadTime(body: string): string {
  const words = body.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, topic } = body;

    if (!section) {
      return NextResponse.json({ error: 'Section is required' }, { status: 400 });
    }

    const validSections = ['politics', 'economics', 'opinion', 'world', 'business', 'tech'];
    if (!validSections.includes(section)) {
      return NextResponse.json({ 
        error: `Invalid section. Must be one of: ${validSections.join(', ')}` 
      }, { status: 400 });
    }

    console.log(`Running ${section} agent${topic ? ` for topic: ${topic}` : ''}...`);

    // Run the agent
    const articles = await runAgentForSection(section, topic);

    // Save to database
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let savedCount = 0;
    for (const article of articles as Array<{ title: string; excerpt: string; body: string; author: string; sources: unknown[]; qualityScore: number }>) {
      const { error } = await supabase
        .from('articles')
        .insert({
          title: article.title,
          excerpt: article.excerpt,
          body: article.body,
          section,
          sources: article.sources,
          quality_score: article.qualityScore,
          status: 'draft',
          slug: generateSlug(article.title),
          author: article.author,
          read_time: estimateReadTime(article.body),
        });

      if (!error) savedCount++;
    }

    return NextResponse.json({
      success: true,
      section,
      topic: topic || 'auto-selected',
      articlesCreated: savedCount,
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

