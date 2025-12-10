"""
Perplexity API Service for Research
"""
import os
import httpx
import json
from typing import List, Dict, Any, Optional
from datetime import datetime


class ResearchResult:
    """Research result data class"""
    
    def __init__(self, summary: str, key_points: List[str], sources: List[Dict[str, str]], 
                 raw_response: str, images: Optional[List[Dict[str, str]]] = None):
        self.summary = summary
        self.key_points = key_points
        self.sources = sources
        self.raw_response = raw_response
        self.images = images or []
        self.original_topic = None  # Set by orchestrator with user's original topic
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'summary': self.summary,
            'keyPoints': self.key_points,
            'sources': self.sources,
            'rawResponse': self.raw_response,
            'images': self.images
        }


async def perform_research(topic: str, section: str, depth: str = 'deep') -> ResearchResult:
    """
    Perform research on a topic using Perplexity's Sonar model
    
    Args:
        topic: Research topic
        section: Section (politics, economics, world, business, tech, opinion)
        depth: Research depth ('quick' or 'deep', default: 'deep')
    
    Returns:
        ResearchResult object
    """
    api_key = os.getenv('PERPLEXITY_API_KEY')
    
    if not api_key:
        raise ValueError("PERPLEXITY_API_KEY must be set in environment variables")
    
    system_prompt = build_system_prompt(section)
    user_prompt = build_user_prompt(topic, depth, section)
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            'https://api.perplexity.ai/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'sonar-pro',
                'messages': [
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': user_prompt}
                ],
                'max_tokens': 4000,
                'temperature': 0.2,
                'return_citations': True,
                'return_related_questions': False
            }
        )
        
        if response.status_code != 200:
            raise Exception(f"Perplexity API error: {response.status_code} - {response.text}")
        
        data = response.json()
        return parse_research_response(data)


async def get_trending_topics(section: str) -> List[str]:
    """
    Get trending topics for a section
    
    Args:
        section: Section name (politics, economics, etc.)
    
    Returns:
        List of trending topic strings
    """
    api_key = os.getenv('PERPLEXITY_API_KEY')
    
    if not api_key:
        raise ValueError("PERPLEXITY_API_KEY must be set in environment variables")
    
    today = datetime.now().strftime("%A, %B %d, %Y")
    
    section_context = {
        'politics': 'US and global politics, elections, policy, legislation',
        'economics': 'economy, Federal Reserve, inflation, employment, GDP, trade',
        'opinion': 'controversial debates, editorial topics, thought leadership',
        'world': 'international news, geopolitics, global events',
        'business': 'corporate news, mergers, earnings, startups',
        'tech': 'technology companies, AI, software, hardware, innovation',
        'satire': 'absurd news stories, corporate culture, modern life frustrations, bureaucracy, tech industry, everyday situations that could be satirized in the style of The Onion'
    }
    
    # Special query for satire - look for topics to satirize, not breaking news
    if section == 'satire':
        system_content = f"You are a satirical news editor finding topics for Onion-style articles. TODAY IS {today}. Return ONLY a JSON array of 5 topic strings that would make good satire. Focus on absurd situations, corporate buzzwords, modern life frustrations, or news with unintentional irony."
        user_content = f"What are 5 topics from recent news or current trends that would make great Onion-style satirical articles? Think: corporate culture, tech industry hype, government bureaucracy, everyday frustrations. Return as JSON array of brief satirical angle descriptions like 'Study finds meetings could have been emails' or 'Tech company announces AI that writes AI'."
    else:
        system_content = f"You are a news editor identifying today's most important stories. TODAY IS {today}. Return ONLY a JSON array of 5 topic strings, no other text. All topics must be from TODAY or the last 24 hours."
        user_content = f"What are the top 5 breaking news stories from TODAY ({today}) in {section_context.get(section, section)}? Only include stories from the last 24 hours. Return as JSON array of brief topic descriptions."
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            'https://api.perplexity.ai/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'sonar',
                'messages': [
                    {
                        'role': 'system',
                        'content': system_content
                    },
                    {
                        'role': 'user',
                        'content': user_content
                    }
                ],
                'max_tokens': 500,
                'temperature': 0.3
            }
        )
        
        if response.status_code != 200:
            raise Exception(f"Perplexity API error: {response.status_code}")
        
        data = response.json()
        content = data.get('choices', [{}])[0].get('message', {}).get('content', '[]')
        
        try:
            # Try to parse JSON from response
            import re
            json_match = re.search(r'\[[\s\S]*\]', content)
            if json_match:
                return json.loads(json_match.group(0))
            return []
        except:
            # If parsing fails, split by newlines
            return [line.strip() for line in content.split('\n') if line.strip()][:5]


def build_system_prompt(section: str) -> str:
    """Build system prompt for research"""
    today = datetime.now().strftime("%A, %B %d, %Y")
    
    # Special handling for satire section
    if section == 'satire':
        return f"""You are a research analyst finding real news stories that have satirical potential for The Wire Journal's humor section "The Lighter Side."

TODAY'S DATE: {today}

Your role is to find REAL news stories that contain inherent absurdity, irony, or contradictions that could be satirized in the style of The Onion.

WHAT TO LOOK FOR:
- Real news with unintentionally funny or absurd elements
- Corporate announcements with buzzword overload
- Government bureaucracy doing something counterintuitive
- Tech industry trends taken to their logical extreme
- Studies with obvious conclusions
- Modern life situations that are relatable and mockable
- News that highlights everyday contradictions

CRITICAL REQUIREMENTS:
- TODAY IS {today} - Find CURRENT news from today or yesterday
- The facts should be real - satire is based on real situations
- Include specific details that can be exaggerated for comedic effect
- Focus on the absurd angles, not the serious implications

OUTPUT FORMAT:
Provide real news details that a satirical writer could use to craft an Onion-style article."""
    
    return f"""You are a senior research analyst for The Wire Journal, a prestigious AI-powered news organization.

TODAY'S DATE: {today}

Your role is to provide comprehensive, factual research briefs for the {section.upper()} section.

CRITICAL REQUIREMENTS:
- TODAY IS {today} - All information MUST be current as of this date
- Focus ONLY on verified news from the LAST 24 HOURS
- VERIFY all facts are current - check who is currently in office, current prices, current events
- The current U.S. President is Donald Trump (inaugurated January 2025)
- Include specific facts: numbers, dates, names, quotes
- Maintain strict journalistic objectivity
- Identify multiple perspectives on controversial topics
- Flag any uncertainty or conflicting reports
- Prioritize primary sources over aggregators
- If information seems outdated, explicitly note this

OUTPUT FORMAT:
Provide a detailed research brief that a journalist could use to write a complete article."""


def build_user_prompt(topic: str, depth: str, section: str = '') -> str:
    """Build user prompt for research"""
    today = datetime.now().strftime("%A, %B %d, %Y")
    
    # Special prompt for satire
    if section == 'satire':
        return f"""Research the following topic to find material for a satirical Onion-style article:

TODAY'S DATE: {today}
SATIRICAL ANGLE: {topic}

Find REAL facts, statistics, quotes, and situations related to this topic that can be exaggerated for comedic effect. The satire will be based on real trends but taken to absurd conclusions.

Look for:
1. REAL STATISTICS that sound absurd (e.g., "Americans spend X hours doing Y")
2. CORPORATE BUZZWORDS or jargon being used seriously
3. CONTRADICTIONS in how people behave vs what they say
4. BUREAUCRATIC ABSURDITIES 
5. QUOTES from real people that could inspire satirical fake quotes

Structure your response as:
1. SUMMARY: Brief overview of the real situation being satirized
2. KEY FACTS: Real statistics and facts that sound absurd or can be exaggerated
3. QUOTES: Real quotes that inspire satirical angles
4. SATIRICAL ANGLES: 3-4 ways this could be turned into Onion-style humor"""
    
    depth_instructions = (
        'Provide an exhaustive analysis including background context, key players, recent developments, expert opinions, and potential implications.'
        if depth == 'deep'
        else 'Provide a concise summary of the key facts and latest developments.'
    )
    
    return f"""Research the following topic for a news article:

TODAY'S DATE: {today}
TOPIC: {topic}

IMPORTANT: All information must be current as of {today}. Verify facts are up to date.
- Current U.S. President: Donald Trump (since January 2025)
- Only include developments from the last 24-48 hours
- If the topic has no recent news, say so

{depth_instructions}

Structure your response as:
1. SUMMARY: 2-3 paragraph overview of CURRENT developments
2. KEY FACTS: Bullet points of critical information (with dates)
3. QUOTES: Any notable quotes from officials or experts (with dates)
4. CONTEXT: Background information readers need
5. WHAT'S NEXT: Upcoming events or expected developments"""


def parse_research_response(data: Dict[str, Any]) -> ResearchResult:
    """Parse Perplexity API response into ResearchResult"""
    content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
    citations = data.get('citations', [])
    
    # Extract key points
    import re
    key_points_match = re.search(r'KEY FACTS:?([\s\S]*?)(?=QUOTES:|CONTEXT:|WHAT\'S NEXT:|$)', content, re.IGNORECASE)
    key_points = []
    if key_points_match:
        points_text = key_points_match.group(1)
        key_points = [
            point.strip()
            for point in re.split(r'[-•]\s*', points_text)
            if len(point.strip()) > 10
        ]
    
    # Extract summary
    summary_match = re.search(r'SUMMARY:?([\s\S]*?)(?=KEY FACTS:|$)', content, re.IGNORECASE)
    summary = summary_match.group(1).strip() if summary_match else content[:1000]
    
    # Build sources from citations
    sources = [
        {
            'url': url,
            'title': f'Source {i + 1}',
            'snippet': None
        }
        for i, url in enumerate(citations)
    ]
    
    return ResearchResult(
        summary=summary,
        key_points=key_points,
        sources=sources,
        raw_response=content
    )

