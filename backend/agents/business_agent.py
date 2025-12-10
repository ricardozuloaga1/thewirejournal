"""
Business Agent - Corporate Affairs
Covers corporate news, mergers, earnings, startups
"""
from agents.base_agent import BaseAgent, AgentConfig


class BusinessAgent(BaseAgent):
    """Agent for business news coverage"""
    
    def __init__(self):
        config = AgentConfig(
            name='business',
            section='business',
            articles_per_run=2,
            author='Corporate Affairs',
            tone_guide='Professional, insightful, forward-looking.',
            style_guide="""
- Lead with business impact and market implications
- Include financial data and metrics
- Quote executives and industry analysts
- Explain competitive dynamics
- Contextualize within industry trends
- Note investor reactions
            """
        )
        super().__init__(config)

