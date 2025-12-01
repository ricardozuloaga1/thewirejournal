/**
 * POST /api/articles/[id]/edit
 * 
 * AI-powered article editing
 * Body: { action: string, customPrompt?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const maxDuration = 120;

interface RouteParams {
  params: Promise<{ id: string }>;
}

const EDIT_ACTIONS: Record<string, string> = {
  'punch-headline': 'Rewrite ONLY the headline to be more compelling, attention-grabbing, and clickworthy. Keep it under 15 words. Return the new headline only.',
  'shorten': 'Shorten this article to approximately 400 words while keeping the most important information. Maintain the same structure and tone.',
  'expand': 'Expand this article to approximately 800-1000 words by adding more context, analysis, expert perspectives, and relevant details. Maintain factual accuracy.',
  'strengthen-lead': 'Rewrite ONLY the first paragraph (lead) to be more compelling and hook the reader immediately. Start with the most newsworthy element.',
  'add-data': 'Add more specific statistics, numbers, percentages, and data points throughout the article. Make claims more concrete.',
  'add-quotes': 'Add 2-3 relevant expert quotes or official statements that would strengthen the article. Make them realistic and attributed.',
  'balance': 'Add an opposing viewpoint or counterargument section to make the article more balanced and objective.',
  'formal': 'Rewrite in a more formal, authoritative news style. Use professional business language.',
  'urgent': 'Rewrite with more urgency and immediacy, as if this is breaking news. Use active voice and present tense where appropriate.',
  'analytical': 'Add more analysis and "so what" context. Explain implications and what this means for readers.',
  'accessible': 'Simplify the language for a general audience. Avoid jargon and explain technical terms.',
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, customPrompt } = body;

    if (!action && !customPrompt) {
      return NextResponse.json({ error: 'action or customPrompt is required' }, { status: 400 });
    }

    // Get current article
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Build the edit instruction
    const editInstruction = customPrompt || EDIT_ACTIONS[action];
    if (!editInstruction) {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    // Call OpenAI to perform the edit
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const isHeadlineOnly = action === 'punch-headline';
    const isLeadOnly = action === 'strengthen-lead';

    let systemPrompt = `You are a senior editor at The Wire Journal. Your task is to edit articles while maintaining factual accuracy and journalistic integrity.`;
    
    let userPrompt: string;
    
    if (isHeadlineOnly) {
      userPrompt = `Current headline: "${article.title}"
      
Article excerpt: ${article.excerpt}

${editInstruction}

Respond with ONLY the new headline, nothing else.`;
    } else if (isLeadOnly) {
      const firstParagraph = article.body.split('\n\n')[0];
      userPrompt = `Current lead paragraph: "${firstParagraph}"

Full article for context:
${article.body}

${editInstruction}

Respond with ONLY the new lead paragraph, nothing else.`;
    } else {
      userPrompt = `CURRENT ARTICLE:

HEADLINE: ${article.title}
EXCERPT: ${article.excerpt}

BODY:
${article.body}

---

EDITING INSTRUCTION: ${editInstruction}

---

Respond with the edited article in this exact JSON format:
{
  "title": "edited headline",
  "excerpt": "edited excerpt (1-2 sentences)",
  "body": "edited full article body"
}`;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const aiResponse = response.choices[0]?.message?.content || '';

    // Parse the response based on action type
    let updates: Record<string, unknown> = {};

    if (isHeadlineOnly) {
      updates.title = aiResponse.trim().replace(/^["']|["']$/g, '');
    } else if (isLeadOnly) {
      const newLead = aiResponse.trim();
      const bodyParts = article.body.split('\n\n');
      bodyParts[0] = newLead;
      updates.body = bodyParts.join('\n\n');
    } else {
      // Parse JSON response
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.title) updates.title = parsed.title;
          if (parsed.excerpt) updates.excerpt = parsed.excerpt;
          if (parsed.body) updates.body = parsed.body;
        }
      } catch {
        // If JSON parsing fails, try to extract content
        return NextResponse.json({ 
          error: 'Failed to parse AI response',
          rawResponse: aiResponse 
        }, { status: 500 });
      }
    }

    // Update the article in database
    const { data: updatedArticle, error: updateError } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      action: action || 'custom',
      article: updatedArticle,
      changes: Object.keys(updates),
    });
  } catch (error) {
    console.error('Edit failed:', error);
    return NextResponse.json(
      { error: 'Edit failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


