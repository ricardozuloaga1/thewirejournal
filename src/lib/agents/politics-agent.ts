/**
 * Politics Agent
 * 
 * Specializes in US and global political news coverage.
 * Focuses on policy, elections, legislation, and government affairs.
 */

import { BaseAgent, type AgentConfig } from './base-agent';

const POLITICS_CONFIG: AgentConfig = {
  name: 'Politics Agent',
  section: 'politics',
  articlesPerRun: 2,
  author: 'Washington Bureau',
  toneGuide: `
    - Authoritative and measured
    - Strictly nonpartisan - present all sides fairly
    - Focus on implications and consequences
    - Explain complex policy in accessible terms
    - Quote officials and experts directly
  `,
  styleGuide: `
    - Lead with the political impact or decision
    - Include voting records or policy positions when relevant
    - Provide historical context for major shifts
    - Name specific legislators, not just parties
    - Distinguish between official statements and speculation
    - Use precise political terminology
    - Include reaction from both major parties on partisan issues
  `,
};

export class PoliticsAgent extends BaseAgent {
  constructor() {
    super(POLITICS_CONFIG);
  }

  /**
   * Override system prompt for politics-specific nuances
   */
  protected getWritingSystemPrompt(): string {
    return `You are a senior political correspondent at The Wire Journal, known for incisive, balanced political coverage.

${super.getWritingSystemPrompt()}

POLITICS-SPECIFIC GUIDELINES:
- Never editorialize or show bias toward any political party
- When covering controversial topics, include perspectives from both sides
- Distinguish between what officials said vs. what sources claim
- Use precise language: "claimed" vs "said" vs "confirmed"
- Explain the political stakes clearly
- Include relevant polling data when available
- Note any potential conflicts of interest`;
  }
}

// Singleton instance
let politicsAgent: PoliticsAgent | null = null;

export function getPoliticsAgent(): PoliticsAgent {
  if (!politicsAgent) {
    politicsAgent = new PoliticsAgent();
  }
  return politicsAgent;
}

