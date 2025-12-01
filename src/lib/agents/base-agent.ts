/**
 * Base Agent Class
 * 
 * All news agents (Politics, Economics, Opinion) extend this class.
 * Implements the core writing pipeline: Draft → Critique → Improve → Score
 */

import { generateText, generateJSON } from './openai';
import type { ResearchPacket, TopicResearch } from '../research';
import type { Article, Section, ArticleSource } from '../supabase/types';

export interface ArticleDraft {
  title: string;
  excerpt: string;
  body: string;
  author: string;
  sources: ArticleSource[];
  qualityScore: number;
}

export interface AgentConfig {
  name: string;
  section: Section;
  articlesPerRun: number;
  author: string; // Bureau/byline name
  toneGuide: string;
  styleGuide: string;
}

export abstract class BaseAgent {
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  /**
   * Main entry point - generates articles from research
   */
  async generateArticles(researchPacket: ResearchPacket, wordCount: number = 800): Promise<ArticleDraft[]> {
    const articles: ArticleDraft[] = [];
    const topTopics = researchPacket.topics.slice(0, this.config.articlesPerRun);

    for (const topicResearch of topTopics) {
      try {
        const article = await this.generateSingleArticle(topicResearch, wordCount);
        articles.push(article);
      } catch (error) {
        console.error(`Failed to generate article for topic: ${topicResearch.topic}`, error);
      }
    }

    return articles;
  }

  /**
   * Generate a single article using the full pipeline
   */
  protected async generateSingleArticle(topicResearch: TopicResearch, wordCount: number = 800): Promise<ArticleDraft> {
    // Step 1: Generate initial draft
    const initialDraft = await this.writeDraft(topicResearch, wordCount);
    
    // Step 2: Self-critique
    const critique = await this.critiqueDraft(initialDraft, topicResearch);
    
    // Step 3: Improve based on critique
    const improvedDraft = await this.improveDraft(initialDraft, critique, wordCount);
    
    // Step 4: Score quality
    const qualityScore = await this.scoreArticle(improvedDraft);

    return {
      ...improvedDraft,
      author: this.config.author,
      qualityScore,
      sources: topicResearch.research.sources,
    };
  }

  /**
   * Step 1: Write initial draft
   */
  protected async writeDraft(topicResearch: TopicResearch, wordCount: number = 800): Promise<Omit<ArticleDraft, 'qualityScore' | 'sources'>> {
    const systemPrompt = this.getWritingSystemPrompt();
    
    const userPrompt = `Write a complete news article based on this research:

TOPIC: ${topicResearch.topic}

RESEARCH SUMMARY:
${topicResearch.research.summary}

KEY FACTS:
${topicResearch.research.keyPoints.map(p => `• ${p}`).join('\n')}

FULL RESEARCH:
${topicResearch.research.rawResponse}

---

Write a complete article with:
1. A compelling headline
2. A 1-2 sentence excerpt/subtitle
3. Full article body (approximately ${wordCount} words)

Format your response as JSON:
{
  "title": "Headline here",
  "excerpt": "Brief excerpt here",
  "body": "Full article body in markdown format"
}`;

    const result = await generateJSON<{ title: string; excerpt: string; body: string }>(
      systemPrompt,
      userPrompt,
      { temperature: 0.7 }
    );

    return {
      ...result,
      author: this.config.author,
    };
  }

  /**
   * Step 2: Critique the draft
   */
  protected async critiqueDraft(
    draft: Omit<ArticleDraft, 'qualityScore' | 'sources'>,
    topicResearch: TopicResearch
  ): Promise<string> {
    const systemPrompt = `You are a senior editor at The Wire Journal. Your job is to critique articles before publication.

Be specific, constructive, and demanding. Focus on:
- Factual accuracy (check against provided research)
- The Wire Journal tone and style
- Clarity and structure
- Headline effectiveness
- Lead paragraph strength
- Missing context or perspectives`;

    const userPrompt = `Critique this draft article:

HEADLINE: ${draft.title}
EXCERPT: ${draft.excerpt}

BODY:
${draft.body}

---

ORIGINAL RESEARCH (for fact-checking):
${topicResearch.research.rawResponse}

---

Provide specific, actionable feedback for improvement.`;

    return generateText(systemPrompt, userPrompt, { temperature: 0.4 });
  }

  /**
   * Step 3: Improve based on critique
   */
  protected async improveDraft(
    draft: Omit<ArticleDraft, 'qualityScore' | 'sources'>,
    critique: string,
    wordCount: number = 800
  ): Promise<Omit<ArticleDraft, 'qualityScore' | 'sources'>> {
    const systemPrompt = this.getWritingSystemPrompt();

    const userPrompt = `Improve this article based on editorial feedback:

CURRENT DRAFT:
Headline: ${draft.title}
Excerpt: ${draft.excerpt}
Body: ${draft.body}

---

EDITOR'S FEEDBACK:
${critique}

---

Rewrite the article addressing ALL feedback points. Maintain the same general topic but improve quality. Target approximately ${wordCount} words for the body.

Format your response as JSON:
{
  "title": "Improved headline",
  "excerpt": "Improved excerpt",
  "body": "Improved full article body in markdown"
}`;

    const result = await generateJSON<{ title: string; excerpt: string; body: string }>(
      systemPrompt,
      userPrompt,
      { temperature: 0.6 }
    );

    return {
      ...result,
      author: this.config.author,
    };
  }

  /**
   * Step 4: Score article quality
   */
  protected async scoreArticle(draft: Omit<ArticleDraft, 'qualityScore' | 'sources'>): Promise<number> {
    const systemPrompt = `You are a quality assurance editor. Score articles on a scale of 1-10.

Criteria:
- Headline effectiveness (2 points)
- Lead paragraph hook (2 points)  
- Factual density (2 points)
- The Wire Journal style adherence (2 points)
- Overall readability (2 points)

Be strict. 7+ is publishable. 9-10 is exceptional.`;

    const userPrompt = `Score this article:

HEADLINE: ${draft.title}
EXCERPT: ${draft.excerpt}
BODY: ${draft.body}

Respond with ONLY a JSON object: { "score": <number 1-10>, "reasoning": "<brief explanation>" }`;

    const result = await generateJSON<{ score: number; reasoning: string }>(
      systemPrompt,
      userPrompt,
      { temperature: 0.2 }
    );

    return Math.min(10, Math.max(1, result.score));
  }

  /**
   * Get the writing system prompt (can be overridden by subclasses)
   */
  protected getWritingSystemPrompt(): string {
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    return `You are a senior journalist at The Wire Journal writing for the ${this.config.section.toUpperCase()} section.

TODAY'S DATE: ${today}

CURRENT FACTS (VERIFY ALL INFORMATION IS UP TO DATE):
- Current U.S. President: Donald Trump (inaugurated January 20, 2025)
- Current Vice President: JD Vance
- Only write about events that are current as of ${today}

TONE: ${this.config.toneGuide}

STYLE GUIDE:
${this.config.styleGuide}

CRITICAL RULES:
- ALL facts must be current as of ${today}
- Write in active voice
- Lead with the most newsworthy element
- Use specific facts, numbers, and quotes
- Maintain strict objectivity (except for Opinion section)
- Short paragraphs (2-3 sentences max)
- No clichés or filler phrases
- Attribution for all claims
- If information seems outdated, do not include it`;
  }
}

/**
 * Generate a URL-safe slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60) + '-' + Math.random().toString(36).slice(2, 10);
}

