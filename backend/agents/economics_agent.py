"""
Economics Agent - Markets & Economics Desk
Covers economy, markets, Federal Reserve, inflation, employment
"""
from agents.base_agent import BaseAgent, AgentConfig


class EconomicsAgent(BaseAgent):
    """Agent for economic news coverage"""
    
    def __init__(self):
        config = AgentConfig(
            name='economics',
            section='economics',
            articles_per_run=2,
            author='Markets & Economics Desk',
            tone_guide='Data-driven, analytical, accessible. Explain complex economics clearly.',
            style_guide="""
- Lead with economic data and market movements
- Explain cause-and-effect relationships
- Include expert economist perspectives
- Contextualize with historical trends
- Translate technical terms for general readership
- Focus on real-world impact on consumers and businesses
            """
        )
        super().__init__(config)

