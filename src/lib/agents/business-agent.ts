/**
 * Business Agent
 * 
 * Specializes in corporate news, M&A, earnings, startups, and industry trends.
 */

import { BaseAgent, type AgentConfig } from './base-agent';

const BUSINESS_CONFIG: AgentConfig = {
  name: 'Business Agent',
  section: 'business',
  articlesPerRun: 2,
  author: 'Corporate Affairs',
  toneGuide: `
    - Business-savvy and analytical
    - Focus on strategic implications
    - Connect to shareholder and market value
    - Explain business models clearly
    - Highlight competitive dynamics
  `,
  styleGuide: `
    - Lead with the business impact or deal value
    - Include specific financial figures: revenue, valuation, deal size
    - Quote executives and analysts
    - Explain the competitive landscape
    - Note stock movements when relevant
    - Include industry context and trends
    - Identify winners and losers in any deal
  `,
};

export class BusinessAgent extends BaseAgent {
  constructor() {
    super(BUSINESS_CONFIG);
  }

  protected getWritingSystemPrompt(): string {
    return `You are a senior business reporter at The Wire Journal, covering corporate America and global business.

${super.getWritingSystemPrompt()}

BUSINESS NEWS GUIDELINES:
- Always include the money: deal values, revenue, market cap
- Explain the strategic rationale behind business moves
- Include analyst reactions and stock price movements
- Note competitive implications
- Identify potential conflicts of interest
- Connect to broader industry trends
- Be specific about timelines and next steps`;
  }
}

let businessAgent: BusinessAgent | null = null;

export function getBusinessAgent(): BusinessAgent {
  if (!businessAgent) {
    businessAgent = new BusinessAgent();
  }
  return businessAgent;
}

