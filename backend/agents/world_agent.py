"""
World Agent - Foreign Correspondents
Covers international news, geopolitics, global events
"""
from agents.base_agent import BaseAgent, AgentConfig


class WorldAgent(BaseAgent):
    """Agent for world news coverage"""
    
    def __init__(self):
        config = AgentConfig(
            name='world',
            section='world',
            articles_per_run=2,
            author='Foreign Correspondents',
            tone_guide='Global perspective, culturally aware, analytical.',
            style_guide="""
- Lead with international significance
- Provide cultural and historical context
- Include perspectives from multiple countries
- Explain foreign policy implications
- Note diplomatic reactions and alliances
- Avoid US-centric framing when inappropriate
            """
        )
        super().__init__(config)

