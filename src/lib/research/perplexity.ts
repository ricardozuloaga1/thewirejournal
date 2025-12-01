/**
 * Perplexity API Integration for Research Layer
 * 
 * Uses Perplexity's Sonar model for search-grounded research.
 * Returns summaries with citations - perfect for the news research pipeline.
 * Also extracts OG images from source URLs for free, authentic imagery.
 */

import { extractImagesFromSources } from '../images/extract';

export interface ResearchResult {
  summary: string;
  keyPoints: string[];
  sources: {
    url: string;
    title: string;
    snippet?: string;
  }[];
  images?: {
    url: string;
    sourceUrl: string;
    sourceDomain: string;
  }[];
  rawResponse?: string;
}

export interface ResearchQuery {
  topic: string;
  section: 'politics' | 'economics' | 'opinion' | 'world' | 'business' | 'tech';
  depth?: 'quick' | 'deep';
}

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

/**
 * Perform research on a topic using Perplexity's Sonar model
 */
export async function performResearch(query: ResearchQuery): Promise<ResearchResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY is not configured');
  }

  const systemPrompt = buildSystemPrompt(query.section);
  const userPrompt = buildUserPrompt(query.topic, query.depth || 'deep');

  const response = await fetch(PERPLEXITY_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar-pro', // Best model for research
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 4000,
      temperature: 0.2, // Low temperature for factual accuracy
      return_citations: true,
      return_related_questions: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Perplexity API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const result = parseResearchResponse(data);
  
  // Extract images from source URLs (async, but don't block on failure)
  if (result.sources.length > 0) {
    try {
      const extractedImages = await extractImagesFromSources(result.sources, 3);
      result.images = extractedImages.map(img => ({
        url: img.url,
        sourceUrl: img.sourceUrl,
        sourceDomain: img.sourceDomain,
      }));
    } catch (error) {
      console.log('Image extraction failed (non-blocking):', error);
      result.images = [];
    }
  }
  
  return result;
}

/**
 * Batch research for multiple topics
 */
export async function batchResearch(queries: ResearchQuery[]): Promise<ResearchResult[]> {
  const results = await Promise.all(
    queries.map(query => performResearch(query))
  );
  return results;
}

/**
 * Get trending topics for a section
 */
export async function getTrendingTopics(section: ResearchQuery['section']): Promise<string[]> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY is not configured');
  }

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const sectionContext = {
    politics: 'US and global politics, elections, policy, legislation',
    economics: 'economy, Federal Reserve, inflation, employment, GDP, trade',
    opinion: 'controversial debates, editorial topics, thought leadership',
    world: 'international news, geopolitics, global events',
    business: 'corporate news, mergers, earnings, startups',
    tech: 'technology companies, AI, software, hardware, innovation',
  };

  const response = await fetch(PERPLEXITY_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: `You are a news editor identifying today's most important stories. TODAY IS ${today}. Return ONLY a JSON array of 5 topic strings, no other text. All topics must be from TODAY or the last 24 hours.`,
        },
        {
          role: 'user',
          content: `What are the top 5 breaking news stories from TODAY (${today}) in ${sectionContext[section]}? Only include stories from the last 24 hours. Return as JSON array of brief topic descriptions.`,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '[]';
  
  try {
    // Try to parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch {
    // If parsing fails, split by newlines and clean up
    return content.split('\n').filter((line: string) => line.trim()).slice(0, 5);
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

function buildSystemPrompt(section: string): string {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  return `You are a senior research analyst for The Wire Journal, a prestigious AI-powered news organization.

TODAY'S DATE: ${today}

Your role is to provide comprehensive, factual research briefs for the ${section.toUpperCase()} section.

CRITICAL REQUIREMENTS:
- TODAY IS ${today} - All information MUST be current as of this date
- Focus ONLY on verified news from the LAST 24 HOURS
- VERIFY all facts are current - check who is currently in office, current prices, current events
- The current U.S. President is Donald Trump (inaugurated January 2025)
- Include specific facts: numbers, dates, names, quotes
- Maintain strict journalistic objectivity
- Identify multiple perspectives on controversial topics
- Flag any uncertainty or conflicting reports
- Prioritize primary sources over aggregators
- If information seems outdated, explicitly note this

OUTPUT FORMAT:
Provide a detailed research brief that a journalist could use to write a complete article.`;
}

function buildUserPrompt(topic: string, depth: 'quick' | 'deep'): string {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const depthInstructions = depth === 'deep' 
    ? 'Provide an exhaustive analysis including background context, key players, recent developments, expert opinions, and potential implications.'
    : 'Provide a concise summary of the key facts and latest developments.';

  return `Research the following topic for a news article:

TODAY'S DATE: ${today}
TOPIC: ${topic}

IMPORTANT: All information must be current as of ${today}. Verify facts are up to date.
- Current U.S. President: Donald Trump (since January 2025)
- Only include developments from the last 24-48 hours
- If the topic has no recent news, say so

${depthInstructions}

Structure your response as:
1. SUMMARY: 2-3 paragraph overview of CURRENT developments
2. KEY FACTS: Bullet points of critical information (with dates)
3. QUOTES: Any notable quotes from officials or experts (with dates)
4. CONTEXT: Background information readers need
5. WHAT'S NEXT: Upcoming events or expected developments`;
}

function parseResearchResponse(data: Record<string, unknown>): ResearchResult {
  const content = (data.choices as Array<{ message: { content: string } }>)?.[0]?.message?.content || '';
  const citations = (data.citations as string[]) || [];

  // Extract key points from the content
  const keyPointsMatch = content.match(/KEY FACTS:?([\s\S]*?)(?=QUOTES:|CONTEXT:|WHAT'S NEXT:|$)/i);
  const keyPoints = keyPointsMatch
    ? keyPointsMatch[1]
        .split(/[-•]\s*/)
        .map((point: string) => point.trim())
        .filter((point: string) => point.length > 10)
    : [];

  // Extract summary
  const summaryMatch = content.match(/SUMMARY:?([\s\S]*?)(?=KEY FACTS:|$)/i);
  const summary = summaryMatch ? summaryMatch[1].trim() : content.slice(0, 1000);

  // Build sources from citations
  const sources = citations.map((url: string, index: number) => ({
    url,
    title: `Source ${index + 1}`,
    snippet: undefined,
  }));

  return {
    summary,
    keyPoints,
    sources,
    rawResponse: content,
  };
}

