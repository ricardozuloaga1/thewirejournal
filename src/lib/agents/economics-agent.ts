/**
 * Economics Agent
 * 
 * Specializes in economic news, Federal Reserve, markets,
 * employment, inflation, and fiscal policy.
 */

import { BaseAgent, type AgentConfig } from './base-agent';

const ECONOMICS_CONFIG: AgentConfig = {
  name: 'Economics Agent',
  section: 'economics',
  articlesPerRun: 2,
  author: 'Markets & Economics Desk',
  toneGuide: `
    - Data-driven and analytical
    - Confident but acknowledge uncertainty in forecasts
    - Make complex economics accessible to informed readers
    - Focus on what the data means, not just what it shows
    - Connect to real-world impacts on businesses and consumers
  `,
  styleGuide: `
    - Lead with the most significant economic indicator or decision
    - Always include specific numbers: percentages, dollar amounts, indices
    - Compare to historical context or analyst expectations
    - Quote economists and Fed officials directly
    - Explain methodology when discussing data releases
    - Include market reaction when relevant
    - Use proper economic terminology but define jargon
    - Connect macro trends to micro impacts
  `,
};

export class EconomicsAgent extends BaseAgent {
  constructor() {
    super(ECONOMICS_CONFIG);
  }

  /**
   * Override system prompt for economics-specific coverage
   */
  protected getWritingSystemPrompt(): string {
    return `You are the chief economics correspondent at The Wire Journal, known for making complex economic data accessible and meaningful.

${super.getWritingSystemPrompt()}

ECONOMICS-SPECIFIC GUIDELINES:
- Always include the specific data: "rose 0.3%" not "rose slightly"
- Compare to expectations: "above the 0.2% forecast by economists"
- Provide context: "the highest level since March 2022"
- Quote Fed officials precisely, noting any qualifications in their statements
- Explain what indicators mean for the average reader
- Include multiple economist perspectives on interpretation
- Note market movements in response to data
- Distinguish between correlation and causation
- Be careful with forward-looking statements - attribute forecasts to their sources`;
  }
}

// Singleton instance
let economicsAgent: EconomicsAgent | null = null;

export function getEconomicsAgent(): EconomicsAgent {
  if (!economicsAgent) {
    economicsAgent = new EconomicsAgent();
  }
  return economicsAgent;
}

