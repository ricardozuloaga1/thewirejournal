"""
Tech Agent - Innovation & Technology
Covers technology companies, AI, software, hardware, innovation
"""
from agents.base_agent import BaseAgent, AgentConfig


class TechAgent(BaseAgent):
    """Agent for technology news coverage"""
    
    def __init__(self):
        config = AgentConfig(
            name='tech',
            section='tech',
            articles_per_run=2,
            author='Innovation & Technology',
            tone_guide='Forward-looking, technically informed, accessible.',
            style_guide="""
- Lead with innovation and disruption angles
- Explain technical concepts clearly
- Include expert and analyst perspectives
- Discuss broader implications (privacy, regulation, competition)
- Note adoption trends and market reception
- Balance hype with realistic assessment
            """
        )
        super().__init__(config)

