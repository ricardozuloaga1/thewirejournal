/**
 * Opinion Agent
 * 
 * Generates long-form opinion pieces and editorials.
 * Unlike news agents, this one takes a clear stance while
 * still presenting evidence-based arguments.
 */

import { BaseAgent, type AgentConfig, type ArticleDraft } from './base-agent';
import { generateText, generateJSON } from './openai';
import type { TopicResearch } from '../research';

const OPINION_CONFIG: AgentConfig = {
  name: 'Opinion Agent',
  section: 'opinion',
  articlesPerRun: 1, // Longer pieces, so fewer per run
  author: 'Editorial Board',
  toneGuide: `
    - Authoritative, persuasive, and intellectually rigorous
    - Balanced, center-right perspective with emphasis on data-driven analysis
    - Deep analytical reasoning over emotional appeal
    - Professional, sophisticated voice (never casual or superficial)
    - Respectful but firm handling of counterarguments
    - Written as if by a seasoned columnist or editorial board
  `,
  styleGuide: `
    - LONG-FORM REQUIRED: 1,200–2,000+ words
    - Clear thesis statement in the first 2-3 paragraphs
    - Paragraphs must be fully developed (multiple sentences, building arguments)
    - Structure: Thesis -> Context/History -> Core Argument -> Data/Evidence -> Counterargument/Rebuttal -> Policy/Philosophical Implications -> Conclusion
    - Explicit use of historical comparisons and case studies
    - Avoid short summaries; prioritize depth and nuance
  `,
};

export class OpinionAgent extends BaseAgent {
  constructor() {
    super(OPINION_CONFIG);
  }

  /**
   * Override to generate longer-form opinion pieces
   */
  protected async writeDraft(topicResearch: TopicResearch, wordCount: number = 800): Promise<Omit<ArticleDraft, 'qualityScore' | 'sources'>> {
    // First, determine the angle/thesis
    const angle = await this.determineAngle(topicResearch);
    
    // Opinion pieces should be longer - multiply by 1.5x minimum
    const opinionWordCount = Math.max(wordCount * 1.5, 1200);
    
    const systemPrompt = this.getWritingSystemPrompt();
    
    const userPrompt = `Write a long-form opinion/editorial piece (${opinionWordCount}–${opinionWordCount + 500} words) based on this research:

TOPIC: ${topicResearch.topic}

EDITORIAL ANGLE: ${angle}

RESEARCH SUMMARY:
${topicResearch.research.summary}

KEY FACTS TO INCORPORATE:
${topicResearch.research.keyPoints.map(p => `• ${p}`).join('\n')}

FULL RESEARCH:
${topicResearch.research.rawResponse}

---

Write a high-substance, intellectually rigorous opinion piece that strictly adheres to these requirements:

1. **CRITICAL LENGTH REQUIREMENT**: 
   - The article body MUST be ${opinionWordCount}–${opinionWordCount + 500} words
   - THIS IS MANDATORY - Do NOT write less than ${opinionWordCount} words
   - Count your words carefully and ensure you meet this requirement
   - If you're under ${opinionWordCount} words, ADD MORE SUBSTANCE:
     * More historical context and examples
     * Deeper analysis of implications
     * Additional data points and evidence
     * More thorough counterargument analysis
   - Do not pad with fluff - expand with genuine intellectual depth

2. **STRUCTURE** (NO SECTION HEADERS IN MARKDOWN):
   - Write in flowing paragraphs WITHOUT using headers like "## Context" or "## Core Argument"
   - Strong opening paragraph establishing the issue and your stance
   - Seamless transitions between sections using natural prose
   - Develop 3-4 major points within the body, integrated naturally
   - Address counterarguments inline, not in separate sections
   - Conclude with a powerful ending that reframes the debate
   - Use only the article title at the top - no other markdown headers

3. **SUBSTANCE**:
   - Use specific data points, dates, and names
   - Draw historical comparisons (e.g., "This mirrors the stagflation of the 1970s...")
   - Apply philosophical or economic framing (e.g., supply-side economics, constitutional originalism)
   - Provide multiple examples and case studies to reach the word count

4. **TONE**:
   - The Wire Journal style: balanced, center-right perspective
   - Sophisticated, professional, and serious
   - Avoid slang, hyperbole, or superficial commentary

REMEMBER: The body text must be AT LEAST ${opinionWordCount} words. This is non-negotiable.

Format your response as JSON:
{
  "title": "Opinion headline (sophisticated, perhaps provocative)",
  "excerpt": "A 2-3 sentence summary of the core thesis",
  "body": "Full opinion piece in markdown format"
}`;

    const result = await generateJSON<{ title: string; excerpt: string; body: string }>(
      systemPrompt,
      userPrompt,
      { 
        temperature: 0.8,
        maxTokens: Math.max(8000, Math.ceil(opinionWordCount * 2)) // Give plenty of room for long articles
      }
    );

    return {
      ...result,
      author: this.config.author,
    };
  }

  /**
   * Determine the editorial angle before writing
   */
  private async determineAngle(topicResearch: TopicResearch): Promise<string> {
    const systemPrompt = `You are the editorial board of The Wire Journal. Based on research, determine a compelling, intellectually rigorous editorial angle.

The Wire Journal editorial board stands for:
- Free markets and fiscal responsibility
- Individual liberty and limited government
- Strong national defense and internationalist foreign policy
- Skepticism of over-regulation and bureaucracy
- Rule of law and constitutional fidelity

But always intellectually honest and willing to criticize any party when they deviate from these principles.`;

    const userPrompt = `Based on this topic and research, what is the most substantive, center-right editorial angle we should take?

TOPIC: ${topicResearch.topic}

RESEARCH:
${topicResearch.research.summary}

Respond with a single, sharp thesis sentence.`;

    return generateText(systemPrompt, userPrompt, { temperature: 0.7, maxTokens: 200 });
  }

  /**
   * Override critique for opinion-specific feedback
   */
  protected async critiqueDraft(
    draft: Omit<ArticleDraft, 'qualityScore' | 'sources'>,
    topicResearch: TopicResearch
  ): Promise<string> {
    const systemPrompt = `You are the editorial page editor at The Wire Journal. Critique this draft strictly against our high standards for length, depth, and rigor.

CRITERIA:
1. **Length & Substance**: Is it at least 1,200 words? Is the length justified by deep analysis, or is it fluff?
2. **Intellectual Rigor**: Does it trace second and third-order consequences? Does it use history and data effectively?
3. **Counterarguments**: Does it steel-man the opposing view before rebutting it?
4. **Voice**: Is it sophisticated, authoritative, and center-right?
5. **Clarity**: Is the thesis unmistakable?`;

    const userPrompt = `Critique this opinion piece:

HEADLINE: ${draft.title}
THESIS: ${draft.excerpt}

BODY:
${draft.body}

---

RESEARCH (for fact-checking):
${topicResearch.research.rawResponse}

---

Provide specific, actionable feedback. 

IMPORTANT: Check the word count. If the body is under 1,200 words, DEMAND substantial expansion with specific areas to develop (more historical context, deeper analysis, additional examples, thorough counterargument discussion).`;

    return generateText(systemPrompt, userPrompt, { temperature: 0.4 });
  }

  /**
   * Override system prompt for opinion writing
   */
  protected getWritingSystemPrompt(): string {
    return `You are a senior columnist for The Wire Journal's Opinion section. Your work is read by world leaders, CEOs, and intellectuals.

${super.getWritingSystemPrompt()}

OPINION-SPECIFIC GUIDELINES:
- **Think Big**: Connect specific events to broader principles (liberty, markets, western civilization).
- **Be Specific**: Generalities are fatal. Use names, dates, numbers, and laws.
- **History Matters**: Contextualize current events with historical analogies.
- **Respect the Reader**: Assume a highly intelligent, informed audience. Do not over-explain basic concepts.
- **Center-Right Worldview**: View the world through the lens of free markets, individual responsibility, and skepticism of state power.
- **Rigor Over Rage**: Be persuasive through logic and evidence, not just emotion.`;
  }
}

// Singleton instance
let opinionAgent: OpinionAgent | null = null;

export function getOpinionAgent(): OpinionAgent {
  if (!opinionAgent) {
    opinionAgent = new OpinionAgent();
  }
  return opinionAgent;
}
