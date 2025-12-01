/**
 * POST /api/articles/[id]/revise
 * 
 * Request AI revision of an article with preset or custom instructions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { generateText } from '@/lib/agents';

interface RouteParams {
  params: Promise<{ id: string }>;
}

type RevisionType = 'shorten' | 'neutralize' | 'context' | 'analysis' | 'lede' | 'custom';

const REVISION_PROMPTS: Record<Exclude<RevisionType, 'custom'>, string> = {
  shorten: 'Reduce the article length by 30% while keeping all key information. Make it tighter and more concise.',
  neutralize: 'Make the tone more neutral and balanced. Remove any language that could be perceived as biased.',
  context: 'Add more background context and historical perspective to help readers understand the significance.',
  analysis: 'Add more expert analysis and interpretation of what this means going forward.',
  lede: 'Rewrite the opening paragraph to be more compelling and newsworthy. Hook the reader immediately.',
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const revisionType = body.revision_type as RevisionType;
    const customNotes = body.custom_notes as string | undefined;

    if (!revisionType) {
      return NextResponse.json(
        { error: 'revision_type is required' },
        { status: 400 }
      );
    }

    // Get current article
    const { data: article, error: fetchError } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Build revision prompt
    const revisionInstruction = revisionType === 'custom' 
      ? customNotes || 'Improve this article.'
      : REVISION_PROMPTS[revisionType];

    const systemPrompt = `You are a senior editor at The Wire Journal. Revise articles based on editorial feedback while maintaining journalistic standards.`;

    const userPrompt = `Revise this article:

CURRENT ARTICLE:
Title: ${article.title}
Excerpt: ${article.excerpt}

Body:
${article.body}

---

REVISION INSTRUCTION:
${revisionInstruction}

${customNotes && revisionType !== 'custom' ? `\nADDITIONAL NOTES:\n${customNotes}` : ''}

---

Return ONLY valid JSON with the revised article:
{
  "title": "revised title",
  "excerpt": "revised excerpt",
  "body": "revised body in markdown"
}`;

    // Generate revision
    const revisedContent = await generateText(systemPrompt, userPrompt, { temperature: 0.6 });
    
    // Parse JSON from response
    let revised: { title: string; excerpt: string; body: string };
    try {
      const jsonMatch = revisedContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      revised = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse revision response' },
        { status: 500 }
      );
    }

    // Update article
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('articles')
      .update({
        title: revised.title,
        excerpt: revised.excerpt,
        body: revised.body,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      article: updated,
      revision_type: revisionType,
    });
  } catch (error) {
    console.error('Failed to revise article:', error);
    return NextResponse.json(
      { error: 'Failed to revise article' },
      { status: 500 }
    );
  }
}

