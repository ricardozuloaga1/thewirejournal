/**
 * World Agent
 * 
 * Specializes in international news, geopolitics, and global events.
 */

import { BaseAgent, type AgentConfig } from './base-agent';

const WORLD_CONFIG: AgentConfig = {
  name: 'World Agent',
  section: 'world',
  articlesPerRun: 2,
  author: 'Foreign Correspondents',
  toneGuide: `
    - Authoritative and globally-minded
    - Explain regional context for American readers
    - Balance local perspectives with broader implications
    - Sensitive to cultural nuances
    - Focus on why this matters to the global order
  `,
  styleGuide: `
    - Lead with the global significance
    - Include geographic and historical context
    - Quote local officials and international experts
    - Explain acronyms and foreign terms
    - Connect to U.S. interests when relevant
    - Use datelines for location clarity
    - Include reaction from major powers when applicable
  `,
};

export class WorldAgent extends BaseAgent {
  constructor() {
    super(WORLD_CONFIG);
  }

  protected getWritingSystemPrompt(): string {
    return `You are a senior international correspondent at The Wire Journal, known for bringing global events to life for American readers.

${super.getWritingSystemPrompt()}

WORLD NEWS GUIDELINES:
- Provide essential geographic and cultural context
- Explain the significance for global stability and markets
- Include perspectives from multiple countries involved
- Note any U.S. diplomatic or economic interests
- Be precise with names, titles, and translations
- Avoid Western-centric assumptions`;
  }
}

let worldAgent: WorldAgent | null = null;

export function getWorldAgent(): WorldAgent {
  if (!worldAgent) {
    worldAgent = new WorldAgent();
  }
  return worldAgent;
}

