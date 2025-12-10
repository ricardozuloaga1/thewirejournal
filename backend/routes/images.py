"""
Images API Routes
Handles image generation for articles using 3-tier pipeline
"""
from flask import Blueprint, request, jsonify
import asyncio

images_bp = Blueprint('images', __name__)


@images_bp.route('/generate', methods=['POST'])
def generate_images():
    """
    POST /api/images/generate
    Generate images for an article using 3-tier pipeline:
    1. Extract OG images from sources (free, authentic)
    2. Gemini Imagen (if configured)
    3. DALL-E fallback
    
    Body: { "title": str, "excerpt": str, "section": str, "sources": [...] }
    Returns: { "images": [...], "success": bool, "breakdown": {...} }
    """
    try:
        data = request.get_json()
        title = data.get('title')
        excerpt = data.get('excerpt', '')
        section = data.get('section')
        sources = data.get('sources', [])
        
        if not title:
            return jsonify({'error': 'title is required', 'success': False}), 400
        
        if not section:
            return jsonify({'error': 'section is required', 'success': False}), 400
        
        print(f"\n[API] Image generation request for: {title[:50]}...")
        
        # Import here to avoid circular imports
        from services.image_service import generate_images_for_article
        
        # Run async function
        result = asyncio.run(generate_images_for_article(
            title=title,
            excerpt=excerpt,
            section=section,
            sources=sources
        ))
        
        if not result['success']:
            return jsonify({
                'success': False,
                'error': 'Failed to generate any images',
                'images': [],
                'breakdown': result.get('breakdown', {})
            }), 500
        
        return jsonify({
            'success': True,
            'images': result['images'],
            'breakdown': result['breakdown'],
            'message': f"Generated {len(result['images'])} image(s)"
        }), 200
        
    except Exception as e:
        import traceback
        print(f"[API] Generate images error: {e}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': 'Failed to generate images',
            'message': str(e)
        }), 500


@images_bp.route('/<image_id>/select', methods=['POST'])
def select_image(image_id):
    """
    POST /api/images/:id/select
    Select an image for an article
    
    Body: { "article_id": str }
    Returns: { "message": str }
    """
    try:
        data = request.get_json()
        article_id = data.get('article_id')
        
        if not article_id:
            return jsonify({'error': 'article_id is required'}), 400
        
        from database.supabase_client import supabase
        
        # Update article with selected image
        response = supabase.table('articles')\
            .update({'image_id': image_id})\
            .eq('id', article_id)\
            .execute()
        
        if not response.data:
            return jsonify({'error': 'Failed to select image'}), 500
        
        return jsonify({'success': True, 'message': 'Image selected successfully'}), 200
        
    except Exception as e:
        print(f"Select image error: {e}")
        return jsonify({'error': 'Failed to select image'}), 500
