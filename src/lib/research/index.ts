/**
 * Research Layer - Main Export
 * 
 * Aggregates research from multiple sources and formats
 * into a "research packet" for AI agents.
 */

import { performResearch, getTrendingTopics, type ResearchResult, type ResearchQuery } from './perplexity';

export interface ResearchPacket {
  section: ResearchQuery['section'];
  generatedAt: string;
  topics: TopicResearch[];
}

export interface TopicResearch {
  topic: string;
  research: ResearchResult;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Generate a complete research packet for an agent
 */
export async function generateResearchPacket(
  section: ResearchQuery['section'],
  customTopics?: string[]
): Promise<ResearchPacket> {
  // Get trending topics if not provided
  const topics = customTopics || await getTrendingTopics(section);
  
  // Research each topic
  const researchPromises = topics.map(async (topic, index) => {
    const research = await performResearch({
      topic,
      section,
      depth: index < 2 ? 'deep' : 'quick', // Deep research for top 2 topics
    });

    return {
      topic,
      research,
      priority: (index < 2 ? 'high' : index < 4 ? 'medium' : 'low') as TopicResearch['priority'],
    };
  });

  const topicResearch = await Promise.all(researchPromises);

  return {
    section,
    generatedAt: new Date().toISOString(),
    topics: topicResearch,
  };
}

/**
 * Generate a focused research packet for a single topic
 */
export async function researchSingleTopic(
  topic: string,
  section: ResearchQuery['section']
): Promise<TopicResearch> {
  const research = await performResearch({
    topic,
    section,
    depth: 'deep',
  });

  return {
    topic,
    research,
    priority: 'high',
  };
}

// Re-export types and functions
export { performResearch, getTrendingTopics };
export type { ResearchResult, ResearchQuery };


