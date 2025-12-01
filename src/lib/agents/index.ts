/**
 * Agents Module - Main Export
 * 
 * Provides access to all news agents and orchestration utilities.
 */

export { BaseAgent, generateSlug, type ArticleDraft, type AgentConfig } from './base-agent';
export { PoliticsAgent, getPoliticsAgent } from './politics-agent';
export { EconomicsAgent, getEconomicsAgent } from './economics-agent';
export { OpinionAgent, getOpinionAgent } from './opinion-agent';
export { WorldAgent, getWorldAgent } from './world-agent';
export { BusinessAgent, getBusinessAgent } from './business-agent';
export { TechAgent, getTechAgent } from './tech-agent';
export { generateText, generateJSON } from './openai';

import { getPoliticsAgent } from './politics-agent';
import { getEconomicsAgent } from './economics-agent';
import { getOpinionAgent } from './opinion-agent';
import { getWorldAgent } from './world-agent';
import { getBusinessAgent } from './business-agent';
import { getTechAgent } from './tech-agent';
import { generateResearchPacket } from '../research';
import { supabaseAdmin } from '../supabase/client';
import { BaseAgent, generateSlug, type ArticleDraft } from './base-agent';
import type { Section } from '../supabase/types';

/**
 * Run all agents and save drafts to database
 */
export async function runAllAgents(wordCount: number = 800, writingStyle: string = 'standard'): Promise<{
  success: boolean;
  articlesCreated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let articlesCreated = 0;

  const agentConfigs: { agent: BaseAgent; section: Section }[] = [
    { agent: getPoliticsAgent(), section: 'politics' },
    { agent: getEconomicsAgent(), section: 'economics' },
    { agent: getOpinionAgent(), section: 'opinion' },
    { agent: getWorldAgent(), section: 'world' },
    { agent: getBusinessAgent(), section: 'business' },
    { agent: getTechAgent(), section: 'tech' },
  ];

  for (const { agent, section } of agentConfigs) {
    try {
      console.log(`Running ${section} agent with ~${wordCount} words in style: ${writingStyle}...`);
      
      // Generate research packet
      const researchPacket = await generateResearchPacket(section);
      
      // Generate articles
      const articles = await agent.generateArticles(researchPacket, wordCount, writingStyle);
      
      // Save to database
      for (const article of articles) {
        await saveArticleDraft(article, section);
        articlesCreated++;
      }
      
      console.log(`${section} agent completed: ${articles.length} articles`);
    } catch (error) {
      const errorMsg = `${section} agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }
  }

  return {
    success: errors.length === 0,
    articlesCreated,
    errors,
  };
}

/**
 * Run a single agent by section
 */
export async function runAgent(section: Section): Promise<ArticleDraft[]> {
  const agentMap = {
    politics: getPoliticsAgent,
    economics: getEconomicsAgent,
    opinion: getOpinionAgent,
    world: getWorldAgent,
    business: getBusinessAgent,
    tech: getTechAgent,
  };

  const getAgent = agentMap[section as keyof typeof agentMap];
  if (!getAgent) {
    throw new Error(`No agent configured for section: ${section}`);
  }

  const agent = getAgent();
  const researchPacket = await generateResearchPacket(section);
  return agent.generateArticles(researchPacket);
}

/**
 * Save an article draft to the database
 */
async function saveArticleDraft(article: ArticleDraft, section: Section): Promise<string> {
  const { data, error} = await supabaseAdmin
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
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to save article: ${error.message}`);
  }

  return data.id;
}

/**
 * Estimate read time based on word count
 */
function estimateReadTime(body: string): string {
  const words = body.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}
