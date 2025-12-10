"""
OpenAI Service for AI Generation
Uses direct HTTP calls for Python 3.14 compatibility
"""
import os
import httpx
import json
from typing import Dict, Any

# API configuration
OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"


def _get_api_key() -> str:
    """Get OpenAI API key from environment"""
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        raise ValueError("OPENAI_API_KEY must be set in environment variables")
    return api_key


def generate_text(
    system_prompt: str,
    user_prompt: str,
    model: str = "gpt-4o",
    temperature: float = 0.7,
    max_tokens: int = 4000
) -> str:
    """
    Generate text using GPT-4
    
    Args:
        system_prompt: System instructions
        user_prompt: User query
        model: Model to use (default: gpt-4o)
        temperature: Randomness (0-2, default: 0.7)
        max_tokens: Max response length (default: 4000)
    
    Returns:
        Generated text
    """
    api_key = _get_api_key()
    
    with httpx.Client(timeout=120.0) as client:
        response = client.post(
            OPENAI_API_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": temperature,
                "max_tokens": max_tokens
            }
        )
        
        if response.status_code != 200:
            raise Exception(f"OpenAI API error: {response.status_code} - {response.text}")
        
        data = response.json()
        return data["choices"][0]["message"]["content"] or ""


def generate_json(
    system_prompt: str,
    user_prompt: str,
    model: str = "gpt-4o",
    temperature: float = 0.3,
    max_tokens: int = 6000
) -> Dict[str, Any]:
    """
    Generate JSON response using GPT-4
    
    Args:
        system_prompt: System instructions
        user_prompt: User query
        model: Model to use (default: gpt-4o)
        temperature: Randomness (0-2, default: 0.3)
        max_tokens: Max response length (default: 6000)
    
    Returns:
        Parsed JSON dictionary
    """
    api_key = _get_api_key()
    
    # Add JSON instruction to system prompt
    enhanced_system_prompt = system_prompt + "\n\nRespond ONLY with valid JSON, no markdown or other text."
    
    with httpx.Client(timeout=120.0) as client:
        response = client.post(
            OPENAI_API_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": enhanced_system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": temperature,
                "max_tokens": max_tokens,
                "response_format": {"type": "json_object"}
            }
        )
        
        if response.status_code != 200:
            raise Exception(f"OpenAI API error: {response.status_code} - {response.text}")
        
        data = response.json()
        content = data["choices"][0]["message"]["content"] or "{}"
        return json.loads(content)


def generate_image_caption(
    article_title: str,
    article_excerpt: str,
    image_source: str = "ai_generated",
    image_prompt: str = None,
    source_domain: str = None
) -> str:
    """
    Generate a news-style image caption based on article context.
    
    Args:
        article_title: Title of the article
        article_excerpt: Brief excerpt/summary of the article
        image_source: Type of image ('extracted', 'ai_generated', 'dalle')
        image_prompt: The prompt used to generate AI images (if applicable)
        source_domain: Domain the image was extracted from (if applicable)
    
    Returns:
        A professional news-style caption in italics format
    """
    api_key = _get_api_key()
    
    system_prompt = """You are a photo editor at a major newspaper like The Wall Street Journal or New York Times.
Your job is to write concise, professional image captions that describe what the image depicts in context of the article.

Caption style guidelines:
- Be factual and descriptive, not sensational
- Keep it to 1-2 sentences, under 150 characters ideally
- Do NOT use phrases like "This image shows" or "Pictured here"
- Use present tense for ongoing situations, past tense for events
- Include relevant context that connects the image to the story
- If it's an AI-generated illustration, make the caption descriptive of the scene depicted

Examples of good captions:
- "Federal Reserve Chair Jerome Powell speaks at a press conference in Washington on Tuesday."
- "Traders work on the floor of the New York Stock Exchange as markets react to earnings reports."
- "A visualization of global supply chain disruptions affecting semiconductor manufacturing."
- "Tech workers at a Silicon Valley campus amid ongoing industry layoffs."
"""
    
    # Build the user prompt based on available information
    user_prompt = f"""Write a news-style image caption for this article:

Title: {article_title}
Summary: {article_excerpt}
"""
    
    if image_source == "extracted" and source_domain:
        user_prompt += f"\nImage source: Photo from {source_domain}"
    elif image_prompt:
        user_prompt += f"\nImage description/prompt: {image_prompt}"
    else:
        user_prompt += "\nThis is an AI-generated illustration for the article."
    
    user_prompt += "\n\nWrite a single caption (no quotes, no attribution, just the caption text):"
    
    with httpx.Client(timeout=30.0) as client:
        response = client.post(
            OPENAI_API_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "gpt-4o-mini",  # Use smaller model for speed/cost
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.5,
                "max_tokens": 100
            }
        )
        
        if response.status_code != 200:
            print(f"Caption generation failed: {response.status_code}")
            return ""
        
        data = response.json()
        caption = data["choices"][0]["message"]["content"] or ""
        # Clean up the caption (remove quotes if present)
        caption = caption.strip().strip('"').strip("'")
        return caption

