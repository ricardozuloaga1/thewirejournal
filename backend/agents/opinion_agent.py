"""
Opinion Agent - Editorial Board
Covers opinion pieces, editorials, commentary
"""
from agents.base_agent import BaseAgent, AgentConfig


class OpinionAgent(BaseAgent):
    """Agent for opinion/editorial content"""
    
    def __init__(self):
        config = AgentConfig(
            name='opinion',
            section='opinion',
            articles_per_run=1,
            author='Editorial Board',
            tone_guide='Argumentative, persuasive, intellectually rigorous. Take a clear stance.',
            style_guide="""
- Lead with a strong thesis or argument
- Support with evidence and reasoning
- Acknowledge counterarguments and address them
- Use rhetorical techniques for persuasion
- Conclude with actionable recommendations or provocative questions
- Maintain intellectual honesty even when advocating
            """
        )
        super().__init__(config)

