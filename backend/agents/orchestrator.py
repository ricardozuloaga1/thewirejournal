"""
Agent Orchestrator
Manages running multiple agents and storing results
"""
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime

from agents.politics_agent import PoliticsAgent
from agents.economics_agent import EconomicsAgent
from agents.world_agent import WorldAgent
from agents.business_agent import BusinessAgent
from agents.tech_agent import TechAgent
from agents.opinion_agent import OpinionAgent
from agents.satire_agent import SatireAgent
from agents.base_agent import generate_slug
from services.perplexity_service import get_trending_topics, perform_research
from database.supabase_client import supabase


# Agent registry
AGENTS = {
    'politics': PoliticsAgent,
    'economics': EconomicsAgent,
    'world': WorldAgent,
    'business': BusinessAgent,
    'tech': TechAgent,
    'opinion': OpinionAgent,
    'satire': SatireAgent
}


async def run_single_agent(
    agent_name: str,
    word_count: int = 800,
    writing_style: str = 'standard',
    custom_topic: Optional[str] = None
) -> Dict[str, Any]:
    """
    Run a single agent
    
    Args:
        agent_name: Agent identifier (politics, economics, etc.)
        word_count: Target word count for articles
        writing_style: Writing style identifier
        custom_topic: Optional custom topic (overrides trending topics)
    
    Returns:
        Result dictionary with success status and articles created
    """
    try:
        agent_class = AGENTS.get(agent_name)
        if not agent_class:
            return {'success': False, 'articles_created': 0, 'errors': [f'Unknown agent: {agent_name}']}
        
        agent = agent_class()
        
        # Get topics or use custom topic
        if custom_topic:
            topics = [custom_topic]
        else:
            topics = await get_trending_topics(agent_name)
        
        if not topics:
            return {'success': False, 'articles_created': 0, 'errors': ['No topics found']}
        
        # Perform research for each topic
        research_results = []
        for topic in topics[:agent.config.articles_per_run]:
            try:
                print(f"[ORCHESTRATOR] Researching topic: {topic}")
                research = await perform_research(topic, agent_name)
                # Attach original topic to research for article generation
                research.original_topic = topic
                research_results.append(research)
            except Exception as e:
                print(f"Research failed for topic '{topic}': {e}")
        
        if not research_results:
            return {'success': False, 'articles_created': 0, 'errors': ['Research failed for all topics']}
        
        # Generate articles
        articles = await agent.generate_articles(research_results, word_count, writing_style)
        
        # Save articles to database
        saved_count = 0
        for article in articles:
            try:
                article_data = {
                    'title': article.title,
                    'excerpt': article.excerpt,
                    'body': article.body,
                    'section': agent.config.section,
                    'author': article.author,
                    'slug': generate_slug(article.title),
                    'status': 'draft',
                    'quality_score': article.quality_score,
                    'sources': article.sources,
                    'read_time': f'{max(1, len(article.body.split()) // 200)} min read'
                }
                
                supabase.table('articles').insert(article_data).execute()
                saved_count += 1
            except Exception as e:
                print(f"Failed to save article '{article.title}': {e}")
        
        return {
            'success': True,
            'articles_created': saved_count,
            'errors': []
        }
        
    except Exception as e:
        return {
            'success': False,
            'articles_created': 0,
            'errors': [str(e)]
        }


async def run_all_agents(
    word_count: int = 800,
    writing_style: str = 'standard'
) -> Dict[str, Any]:
    """
    Run all agents in parallel
    
    Args:
        word_count: Target word count for articles
        writing_style: Writing style identifier
    
    Returns:
        Result dictionary with success status and total articles created
    """
    try:
        # Run all agents in parallel
        tasks = [
            run_single_agent(agent_name, word_count, writing_style)
            for agent_name in AGENTS.keys()
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Aggregate results
        total_articles = 0
        errors = []
        
        for result in results:
            if isinstance(result, Exception):
                errors.append(str(result))
            elif isinstance(result, dict):
                total_articles += result.get('articles_created', 0)
                errors.extend(result.get('errors', []))
        
        return {
            'success': total_articles > 0,
            'articles_created': total_articles,
            'errors': errors
        }
        
    except Exception as e:
        return {
            'success': False,
            'articles_created': 0,
            'errors': [str(e)]
        }

