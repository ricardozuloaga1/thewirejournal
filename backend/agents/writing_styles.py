"""
Writing Styles for Different Journalist Personas
"""

WRITING_STYLES = {
    'standard': {
        'name': 'Standard WSJ Style',
        'instruction': ''
    },
    'george_will': {
        'name': 'George Will - The Classical Conservative',
        'instruction': """Write in the erudite, intellectually rigorous style of George Will:
- Complex, elegant sentence structures with subordinate clauses
- Frequent historical and literary allusions
- Classical conservative principles: individual liberty, limited government, cultural tradition
- Ironic wit and sharp observations about political culture
- References to baseball, philosophy, and classical literature
- Vocabulary: sophisticated but not inaccessible"""
    },
    'kimberley_strassel': {
        'name': 'Kimberley Strassel - The Potomac Watch',
        'instruction': """Write in the sharp, investigative style of Kimberley Strassel:
- Crisp, direct sentences that build momentum
- Focus on government overreach and bureaucratic accountability
- Expose contradictions in official narratives
- Follow the paper trail and connect the dots
- Skeptical of institutional power
- Cutting but measured tone"""
    },
    # Add more styles as needed
}


def get_writing_style(style_id: str) -> str:
    """Get writing style instruction by ID"""
    style = WRITING_STYLES.get(style_id, WRITING_STYLES['standard'])
    return style['instruction']

