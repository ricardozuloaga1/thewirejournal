"""
Image Generation Service
3-Tier Pipeline:
1. Extract OG images from news sources (free, fast, authentic)
2. DALL-E generation (fallback since we have OpenAI key)
"""
import os
import httpx
import re
import uuid
from typing import List, Dict, Optional, Any
from urllib.parse import urlparse


class GeneratedImage:
    """Generated image data class"""
    
    def __init__(self, id: str, url: str, source: str, 
                 prompt: Optional[str] = None, 
                 source_domain: Optional[str] = None,
                 source_url: Optional[str] = None):
        self.id = id
        self.url = url
        self.source = source  # 'extracted', 'gemini', or 'dalle'
        self.prompt = prompt
        self.source_domain = source_domain
        self.source_url = source_url
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'url': self.url,
            'source': self.source,
            'prompt': self.prompt,
            'sourceDomain': self.source_domain,
            'sourceUrl': self.source_url,
        }


def get_domain(url: str) -> str:
    """Extract domain from URL for attribution"""
    try:
        parsed = urlparse(url)
        return parsed.hostname.replace('www.', '') if parsed.hostname else 'unknown'
    except:
        return 'unknown'


async def extract_og_image(url: str) -> Optional[str]:
    """Extract OG image from a single URL"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                url,
                headers={
                    'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
                    'Accept': 'text/html',
                },
                follow_redirects=True
            )
            
            if response.status_code != 200:
                return None
            
            html = response.text
            
            # Try og:image first (most common)
            match = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
            if match:
                return match.group(1)
            
            # Try content before property
            match = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']', html, re.IGNORECASE)
            if match:
                return match.group(1)
            
            # Try twitter:image
            match = re.search(r'<meta[^>]+name=["\']twitter:image["\'][^>]+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
            if match:
                return match.group(1)
            
            # Try twitter:image:src
            match = re.search(r'<meta[^>]+name=["\']twitter:image:src["\'][^>]+content=["\']([^"\']+)["\']', html, re.IGNORECASE)
            if match:
                return match.group(1)
            
            return None
    except Exception as e:
        print(f"Failed to extract image from {url}: {e}")
        return None


async def validate_image_url(url: str) -> bool:
    """Validate that an image URL is accessible"""
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.head(url, follow_redirects=True)
            
            if response.status_code != 200:
                return False
            
            content_type = response.headers.get('content-type', '')
            return content_type.startswith('image/')
    except:
        return False


async def extract_images_from_sources(sources: List[Dict], max_images: int = 3) -> List[GeneratedImage]:
    """
    Tier 1: Extract OG images from source URLs
    Returns up to max_images unique, validated images
    """
    images = []
    seen_urls = set()
    
    print(f"[IMAGES] Tier 1: Extracting from {len(sources)} sources...")
    
    for source in sources[:10]:  # Limit to first 10 sources
        if len(images) >= max_images:
            break
            
        url = source.get('url')
        if not url:
            continue
        
        image_url = await extract_og_image(url)
        
        if image_url and image_url not in seen_urls:
            is_valid = await validate_image_url(image_url)
            if is_valid:
                seen_urls.add(image_url)
                images.append(GeneratedImage(
                    id=f"extracted-{uuid.uuid4().hex[:8]}",
                    url=image_url,
                    source='extracted',
                    source_domain=get_domain(url),
                    source_url=url
                ))
                print(f"[IMAGES] Extracted image from {get_domain(url)}")
    
    print(f"[IMAGES] Extracted {len(images)} valid images from sources")
    return images


def generate_image_prompt(title: str, section: str) -> str:
    """Generate a prompt for AI image generation"""
    section_style = {
        'politics': 'government building, Capitol, press conference, diplomatic setting',
        'economics': 'financial district, stock trading floor, Federal Reserve building',
        'world': 'international landmark, global cityscape, diplomatic gathering',
        'business': 'corporate boardroom, modern office, business executives meeting',
        'tech': 'modern technology, data center, Silicon Valley, tech devices',
        'opinion': 'thoughtful editorial imagery, symbolic representation',
    }
    
    style = section_style.get(section, 'professional news photography')
    
    return f'Professional photojournalistic image for a major newspaper. Topic: "{title}". Visual style: {style}. Requirements: Realistic editorial photo, landscape orientation, no text or logos, neutral professional lighting.'


async def generate_with_dalle(prompt: str, count: int) -> List[GeneratedImage]:
    """
    Tier 3: Generate images with DALL-E 3
    """
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("[IMAGES] OpenAI API key not configured, skipping DALL-E...")
        return []
    
    print(f"[IMAGES] Tier 3: Generating {count} images with DALL-E...")
    images = []
    
    variations = [
        prompt,
        prompt + ' Wide establishing shot.',
        prompt + ' Detailed close-up perspective.',
    ]
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        for i in range(min(count, 3)):
            try:
                variation = variations[i] if i < len(variations) else prompt
                
                response = await client.post(
                    'https://api.openai.com/v1/images/generations',
                    headers={
                        'Authorization': f'Bearer {api_key}',
                        'Content-Type': 'application/json'
                    },
                    json={
                        'model': 'dall-e-3',
                        'prompt': variation,
                        'n': 1,
                        'size': '1792x1024',
                        'quality': 'standard',
                    }
                )
                
                if response.status_code != 200:
                    print(f"[IMAGES] DALL-E error: {response.status_code} - {response.text[:200]}")
                    continue
                
                data = response.json()
                
                if data.get('data') and data['data'][0].get('url'):
                    images.append(GeneratedImage(
                        id=f"dalle-{uuid.uuid4().hex[:8]}",
                        url=data['data'][0]['url'],
                        source='dalle',
                        prompt=variation
                    ))
                    print(f"[IMAGES] Generated DALL-E image {i + 1}")
                    
            except Exception as e:
                print(f"[IMAGES] DALL-E image {i + 1} failed: {e}")
    
    return images


async def generate_images_for_article(
    title: str,
    excerpt: str,
    section: str,
    sources: Optional[List[Dict]] = None
) -> Dict[str, Any]:
    """
    Main image generation pipeline
    
    3-Tier approach:
    1. Extract from news sources (free, authentic)
    2. Skip Gemini (requires separate API key)
    3. DALL-E fallback (uses OpenAI key we have)
    """
    all_images = []
    target_count = 3
    
    print(f"\n{'='*50}")
    print(f"[IMAGES] Pipeline for: {title[:50]}...")
    print(f"[IMAGES] Sources available: {len(sources) if sources else 0}")
    print(f"{'='*50}\n")
    
    # Tier 1: Extract from sources
    if sources and len(sources) > 0:
        extracted = await extract_images_from_sources(sources, target_count)
        all_images.extend(extracted)
        print(f"[IMAGES] After extraction: {len(all_images)} images")
    
    # Tier 2: Skip Gemini (would need GEMINI_API_KEY)
    
    # Tier 3: DALL-E fallback
    if len(all_images) < target_count:
        needed = target_count - len(all_images)
        prompt = generate_image_prompt(title, section)
        dalle_images = await generate_with_dalle(prompt, needed)
        all_images.extend(dalle_images)
        print(f"[IMAGES] After DALL-E: {len(all_images)} images")
    
    # Determine breakdown
    breakdown = {
        'extracted': len([i for i in all_images if i.source == 'extracted']),
        'gemini': len([i for i in all_images if i.source == 'gemini']),
        'dalle': len([i for i in all_images if i.source == 'dalle']),
    }
    
    print(f"\n[IMAGES] Final result: {len(all_images)} images")
    print(f"[IMAGES] Sources: {[i.source for i in all_images]}\n")
    
    return {
        'success': len(all_images) > 0,
        'images': [img.to_dict() for img in all_images],
        'breakdown': breakdown,
    }
