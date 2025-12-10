"""
Politics Agent - Washington Bureau
Covers US politics, elections, policy, and legislation
"""
from agents.base_agent import BaseAgent, AgentConfig


class PoliticsAgent(BaseAgent):
    """Agent for political news coverage"""
    
    def __init__(self):
        config = AgentConfig(
            name='politics',
            section='politics',
            articles_per_run=2,
            author='Washington Bureau',
            tone_guide='Authoritative, balanced, analytical. Report facts without partisan spin.',
            style_guide="""
- Lead with the political significance of developments
- Include perspectives from multiple parties
- Contextualize within broader political landscape
- Focus on policy implications, not just horse-race politics
- Quote elected officials and political analysts
- Note procedural and constitutional considerations
            """
        )
        super().__init__(config)

