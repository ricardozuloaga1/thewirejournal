"""
Base Agent Class for AI News Generation
All specialized agents (Politics, Economics, etc.) inherit from this class
"""
from typing import Dict, List, Any, Optional
from datetime import datetime
import re
import random
import string

from services.openai_service import generate_text, generate_json
from services.perplexity_service import ResearchResult


class ArticleDraft:
    """Article draft data class"""
    
    def __init__(self, title: str, excerpt: str, body: str, author: str,
                 sources: List[Dict[str, str]], quality_score: int):
        self.title = title
        self.excerpt = excerpt
        self.body = body
        self.author = author
        self.sources = sources
        self.quality_score = quality_score
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'title': self.title,
            'excerpt': self.excerpt,
            'body': self.body,
            'author': self.author,
            'sources': self.sources,
            'quality_score': self.quality_score
        }


class AgentConfig:
    """Agent configuration"""
    
    def __init__(self, name: str, section: str, articles_per_run: int,
                 author: str, tone_guide: str, style_guide: str):
        self.name = name
        self.section = section
        self.articles_per_run = articles_per_run
        self.author = author
        self.tone_guide = tone_guide
        self.style_guide = style_guide


class BaseAgent:
    """Base agent class for all specialized agents"""
    
    def __init__(self, config: AgentConfig):
        self.config = config
    
    async def generate_articles(
        self, 
        research_results: List[ResearchResult],
        word_count: int = 800,
        writing_style: str = 'standard'
    ) -> List[ArticleDraft]:
        """
        Main entry point - generates articles from research
        
        Args:
            research_results: List of research results
            word_count: Target word count for articles
            writing_style: Writing style identifier
        
        Returns:
            List of ArticleDraft objects
        """
        articles = []
        
        for research in research_results[:self.config.articles_per_run]:
            try:
                article = await self.generate_single_article(research, word_count, writing_style)
                articles.append(article)
            except Exception as e:
                print(f"Failed to generate article: {e}")
        
        return articles
    
    async def generate_single_article(
        self,
        research: ResearchResult,
        word_count: int = 800,
        writing_style: str = 'standard'
    ) -> ArticleDraft:
        """
        Generate a single article using the full pipeline
        
        Pipeline:
        1. Draft - Initial article
        2. Critique - Self-critique
        3. Improve - Improved draft based on critique
        4. Score - Quality assessment
        """
        # Step 1: Generate initial draft
        initial_draft = await self.write_draft(research, word_count, writing_style)
        
        # Step 2: Self-critique
        critique = await self.critique_draft(initial_draft, research)
        
        # Step 3: Improve based on critique
        improved_draft = await self.improve_draft(initial_draft, critique, word_count, writing_style)
        
        # Step 4: Score quality
        quality_score = await self.score_article(improved_draft)
        
        return ArticleDraft(
            title=improved_draft['title'],
            excerpt=improved_draft['excerpt'],
            body=improved_draft['body'],
            author=self.config.author,
            sources=research.sources,
            quality_score=quality_score
        )
    
    async def write_draft(
        self,
        research: ResearchResult,
        word_count: int = 800,
        writing_style: str = 'standard'
    ) -> Dict[str, str]:
        """Step 1: Write initial draft"""
        system_prompt = self.get_writing_system_prompt()
        
        # Inject writing style if not standard
        if writing_style != 'standard':
            from agents.writing_styles import get_writing_style
            style_instruction = get_writing_style(writing_style)
            if style_instruction:
                system_prompt += f"\n\n{style_instruction}"
        
        # Use original topic provided by user, or extract from research summary
        original_topic = getattr(research, 'original_topic', None)
        if original_topic:
            topic = original_topic
        elif research.summary:
            topic = research.summary.split('.')[0]
        else:
            topic = "Breaking News"
        print(f"[AGENT] Writing article about: {topic}")
        
        user_prompt = f"""Write a complete news article based on this research:

TOPIC: {topic}

RESEARCH SUMMARY:
{research.summary}

KEY FACTS:
{chr(10).join(f"• {point}" for point in research.key_points)}

FULL RESEARCH:
{research.raw_response}

---

Write a complete article with:
1. A compelling headline
2. A 1-2 sentence excerpt/subtitle
3. Full article body - MUST be approximately {word_count} words (minimum {int(word_count * 0.9)} words)

CRITICAL FORMATTING RULES:
- The body text must contain at least {int(word_count * 0.9)} words
- DO NOT USE MARKDOWN HEADERS (##, ###, etc.) IN THE BODY
- Write in flowing paragraphs with natural transitions between topics
- Use paragraph breaks to separate ideas, NOT section headers
- Professional newspaper style - no headers, just clean prose

Format your response as JSON:
{{
  "title": "Headline here",
  "excerpt": "Brief excerpt here",
  "body": "Full article body in clean paragraphs WITHOUT any markdown headers"
}}"""
        
        result = generate_json(
            system_prompt,
            user_prompt,
            temperature=0.7,
            max_tokens=max(4000, int(word_count * 2))
        )
        
        return {
            'title': result.get('title', ''),
            'excerpt': result.get('excerpt', ''),
            'body': result.get('body', ''),
            'author': self.config.author
        }
    
    async def critique_draft(
        self,
        draft: Dict[str, str],
        research: ResearchResult
    ) -> str:
        """Step 2: Critique the draft"""
        system_prompt = """You are a senior editor at The Wire Journal. Your job is to critique articles before publication.

Be specific, constructive, and demanding. Focus on:
- Factual accuracy (check against provided research)
- The Wire Journal tone and style
- Clarity and structure
- Headline effectiveness
- Lead paragraph strength
- Missing context or perspectives"""
        
        user_prompt = f"""Critique this draft article:

HEADLINE: {draft['title']}
EXCERPT: {draft['excerpt']}

BODY:
{draft['body']}

---

ORIGINAL RESEARCH (for fact-checking):
{research.raw_response}

---

Provide specific, actionable feedback for improvement."""
        
        return generate_text(system_prompt, user_prompt, temperature=0.4)
    
    async def improve_draft(
        self,
        draft: Dict[str, str],
        critique: str,
        word_count: int = 800,
        writing_style: str = 'standard'
    ) -> Dict[str, str]:
        """Step 3: Improve based on critique"""
        system_prompt = self.get_writing_system_prompt()
        
        # Inject writing style
        if writing_style != 'standard':
            from agents.writing_styles import get_writing_style
            style_instruction = get_writing_style(writing_style)
            if style_instruction:
                system_prompt += f"\n\n{style_instruction}"
        
        user_prompt = f"""Improve this article based on editorial feedback:

CURRENT DRAFT:
Headline: {draft['title']}
Excerpt: {draft['excerpt']}
Body: {draft['body']}

---

EDITOR'S FEEDBACK:
{critique}

---

Rewrite the article addressing ALL feedback points. Maintain the same general topic but improve quality. 

CRITICAL REQUIREMENTS:
- The body text MUST be approximately {word_count} words (minimum {int(word_count * 0.9)} words)
- DO NOT USE MARKDOWN HEADERS (##, ###, etc.) IN THE BODY
- Write in flowing paragraphs with natural transitions
- Professional newspaper style - no section headers, just clean prose

Format your response as JSON:
{{
  "title": "Improved headline",
  "excerpt": "Improved excerpt",
  "body": "Improved article body in clean paragraphs WITHOUT markdown headers"
}}"""
        
        result = generate_json(
            system_prompt,
            user_prompt,
            temperature=0.6,
            max_tokens=max(4000, int(word_count * 2))
        )
        
        return {
            'title': result.get('title', ''),
            'excerpt': result.get('excerpt', ''),
            'body': result.get('body', ''),
            'author': self.config.author
        }
    
    async def score_article(self, draft: Dict[str, str]) -> int:
        """Step 4: Score article quality"""
        system_prompt = """You are a quality assurance editor. Score articles on a scale of 1-10.

Criteria:
- Headline effectiveness (2 points)
- Lead paragraph hook (2 points)  
- Factual density (2 points)
- The Wire Journal style adherence (2 points)
- Overall readability (2 points)

Be strict. 7+ is publishable. 9-10 is exceptional."""
        
        user_prompt = f"""Score this article:

HEADLINE: {draft['title']}
EXCERPT: {draft['excerpt']}
BODY: {draft['body']}

Respond with ONLY a JSON object: {{ "score": <number 1-10>, "reasoning": "<brief explanation>" }}"""
        
        result = generate_json(system_prompt, user_prompt, temperature=0.2)
        
        score = result.get('score', 5)
        return max(1, min(10, int(score)))
    
    def get_writing_system_prompt(self) -> str:
        """Get the writing system prompt (can be overridden by subclasses)"""
        today = datetime.now().strftime("%A, %B %d, %Y")
        
        return f"""You are a senior journalist at The Wire Journal writing for the {self.config.section.upper()} section.

TODAY'S DATE: {today}

CURRENT FACTS (VERIFY ALL INFORMATION IS UP TO DATE):
- Current U.S. President: Donald Trump (inaugurated January 20, 2025)
- Current Vice President: JD Vance
- Only write about events that are current as of {today}

TONE: {self.config.tone_guide}

STYLE GUIDE:
{self.config.style_guide}

CRITICAL RULES:
- ALL facts must be current as of {today}
- Write in active voice
- Lead with the most newsworthy element
- Use specific facts, numbers, and quotes
- Maintain strict objectivity (except for Opinion section)
- Short paragraphs (2-3 sentences max)
- NEVER USE MARKDOWN HEADERS (##, ###) IN ARTICLE BODIES - write in flowing paragraphs only
- No clichés or filler phrases
- Attribution for all claims
- If information seems outdated, do not include it"""


def generate_slug(title: str) -> str:
    """Generate a URL-safe slug from a title"""
    # Remove special characters
    slug = re.sub(r'[^a-z0-9\s-]', '', title.lower())
    # Replace spaces with hyphens
    slug = re.sub(r'\s+', '-', slug)
    # Truncate and add random suffix
    slug = slug[:60]
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"{slug}-{random_suffix}"

