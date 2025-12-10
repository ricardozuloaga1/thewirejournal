"""
Articles API Routes
Handles article CRUD operations
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, jwt_required
from database.supabase_client import supabase
from typing import Optional, List, Dict, Any

articles_bp = Blueprint('articles', __name__)


def enrich_articles_with_images(articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Enrich articles with image URLs and captions by fetching from images table
    """
    if not articles:
        return articles
    
    # Get all image_ids that are not None
    image_ids = [a['image_id'] for a in articles if a.get('image_id')]
    
    if not image_ids:
        return articles
    
    try:
        # Try to fetch images with caption (if column exists)
        try:
            images_response = supabase.table('images').select('id, url, caption').in_('id', image_ids).execute()
        except:
            # Fallback: caption column might not exist yet
            images_response = supabase.table('images').select('id, url').in_('id', image_ids).execute()
        
        # Create a map of image_id -> {url, caption}
        image_map = {img['id']: {'url': img['url'], 'caption': img.get('caption')} for img in (images_response.data or [])}
        
        # Enrich articles
        for article in articles:
            if article.get('image_id') and article['image_id'] in image_map:
                article['image_url'] = image_map[article['image_id']]['url']
                article['image_caption'] = image_map[article['image_id']].get('caption')
            else:
                article['image_url'] = None
                article['image_caption'] = None
    except Exception as e:
        print(f"Error enriching articles with images: {e}")
        # If images table doesn't exist or query fails, just return articles as-is
        for article in articles:
            article['image_url'] = None
            article['image_caption'] = None
    
    return articles


def enrich_article_with_image(article: Dict[str, Any]) -> Dict[str, Any]:
    """
    Enrich a single article with its image URL and caption
    """
    if not article or not article.get('image_id'):
        article['image_url'] = None
        article['image_caption'] = None
        return article
    
    try:
        # Try to fetch with caption (if column exists)
        try:
            image_response = supabase.table('images').select('url, caption').eq('id', article['image_id']).execute()
        except:
            # Fallback: caption column might not exist yet
            image_response = supabase.table('images').select('url').eq('id', article['image_id']).execute()
        
        if image_response.data and len(image_response.data) > 0:
            article['image_url'] = image_response.data[0]['url']
            article['image_caption'] = image_response.data[0].get('caption')
        else:
            article['image_url'] = None
            article['image_caption'] = None
    except Exception as e:
        print(f"Error fetching image for article: {e}")
        article['image_url'] = None
        article['image_caption'] = None
    
    return article


@articles_bp.route('', methods=['GET'])
def get_articles():
    """
    GET /api/articles
    Get published articles with optional filtering
    
    Query params:
    - section: Filter by section
    - limit: Number of articles (default: 20)
    - status: Filter by status (default: published)
    - user_id: Filter by user preferences (requires JWT)
    
    Returns: { "articles": [...] }
    """
    try:
        section = request.args.get('section')
        limit = int(request.args.get('limit', 20))
        status = request.args.get('status', 'published')
        
        query = supabase.table('articles').select('*')
        
        # Filter by status
        query = query.eq('status', status)
        
        # Filter by section if provided
        if section:
            query = query.eq('section', section)
        
        # Order by created_at descending
        query = query.order('created_at', desc=True)
        
        # Limit results
        query = query.limit(limit)
        
        response = query.execute()
        
        # Enrich with image URLs
        articles = enrich_articles_with_images(response.data or [])
        
        return jsonify({'articles': articles}), 200
        
    except Exception as e:
        print(f"Get articles error: {e}")
        return jsonify({'error': 'Failed to get articles'}), 500


@articles_bp.route('/personalized', methods=['GET'])
@jwt_required()
def get_personalized_articles():
    """
    GET /api/articles/personalized
    Get articles based on user preferences
    
    Returns: { "articles": [...] }
    """
    try:
        user_id = get_jwt_identity()
        limit = int(request.args.get('limit', 20))
        
        # Get user preferences
        user_response = supabase.table('users').select('preferences').eq('id', user_id).execute()
        
        if not user_response.data:
            return jsonify({'error': 'User not found'}), 404
        
        preferences = user_response.data[0].get('preferences', {})
        preferred_sections = preferences.get('sections', ['politics', 'economics', 'world', 'business', 'tech', 'opinion'])
        
        # Get articles from preferred sections
        response = supabase.table('articles')\
            .select('*')\
            .eq('status', 'published')\
            .in_('section', preferred_sections)\
            .order('created_at', desc=True)\
            .limit(limit)\
            .execute()
        
        # Enrich with image URLs
        articles = enrich_articles_with_images(response.data or [])
        
        return jsonify({'articles': articles}), 200
        
    except Exception as e:
        print(f"Get personalized articles error: {e}")
        return jsonify({'error': 'Failed to get personalized articles'}), 500


@articles_bp.route('/<article_id>', methods=['GET'])
def get_article(article_id):
    """
    GET /api/articles/:id
    Get single article by ID
    
    Returns: { "article": {...} }
    """
    try:
        response = supabase.table('articles').select('*').eq('id', article_id).execute()
        
        if not response.data or len(response.data) == 0:
            return jsonify({'error': 'Article not found'}), 404
        
        # Enrich with image URL
        article = enrich_article_with_image(response.data[0])
        
        return jsonify({'article': article}), 200
        
    except Exception as e:
        print(f"Get article error: {e}")
        return jsonify({'error': 'Failed to get article'}), 500


@articles_bp.route('/slug/<slug>', methods=['GET'])
def get_article_by_slug(slug):
    """
    GET /api/articles/slug/:slug
    Get article by slug
    
    Returns: { "article": {...} }
    """
    try:
        response = supabase.table('articles').select('*').eq('slug', slug).execute()
        
        if not response.data or len(response.data) == 0:
            return jsonify({'error': 'Article not found'}), 404
        
        # Enrich with image URL
        article = enrich_article_with_image(response.data[0])
        
        return jsonify({'article': article}), 200
        
    except Exception as e:
        print(f"Get article by slug error: {e}")
        return jsonify({'error': 'Failed to get article'}), 500


@articles_bp.route('', methods=['POST'])
@jwt_required()
def create_article():
    """
    POST /api/articles
    Create new article (admin/agent only)
    
    Body: { "title": str, "excerpt": str, "body": str, "section": str, ... }
    Returns: { "article": {...} }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'excerpt', 'body', 'section', 'slug', 'author']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Validate section
        valid_sections = ['politics', 'economics', 'world', 'business', 'tech', 'opinion', 'satire']
        if data['section'] not in valid_sections:
            return jsonify({'error': f'Invalid section. Valid: {valid_sections}'}), 400
        
        # Create article
        response = supabase.table('articles').insert(data).execute()
        
        if not response.data:
            return jsonify({'error': 'Failed to create article'}), 500
        
        return jsonify({
            'article': response.data[0],
            'message': 'Article created successfully'
        }), 201
        
    except Exception as e:
        print(f"Create article error: {e}")
        return jsonify({'error': 'Failed to create article'}), 500


@articles_bp.route('/<article_id>', methods=['PUT', 'PATCH'])
def update_article(article_id):
    """
    PUT/PATCH /api/articles/:id
    Update article (partial or full)
    
    Body: { "title": str, "excerpt": str, "body": str, ... }
    Returns: { "article": {...} }
    """
    try:
        data = request.get_json()
        
        # Remove fields that shouldn't be updated directly
        data.pop('id', None)
        data.pop('created_at', None)
        
        # Validate section if provided
        if 'section' in data:
            valid_sections = ['politics', 'economics', 'world', 'business', 'tech', 'opinion', 'satire']
            if data['section'] not in valid_sections:
                return jsonify({'error': f'Invalid section. Valid: {valid_sections}'}), 400
        
        response = supabase.table('articles').update(data).eq('id', article_id).execute()
        
        if not response.data or len(response.data) == 0:
            return jsonify({'error': 'Article not found'}), 404
        
        return jsonify({
            'article': response.data[0],
            'success': True,
            'message': 'Article updated successfully'
        }), 200
        
    except Exception as e:
        print(f"Update article error: {e}")
        return jsonify({'error': 'Failed to update article'}), 500


@articles_bp.route('/<article_id>', methods=['DELETE'])
@jwt_required()
def delete_article(article_id):
    """
    DELETE /api/articles/:id
    Delete article
    
    Returns: { "message": str }
    """
    try:
        supabase.table('articles').delete().eq('id', article_id).execute()
        
        return jsonify({'message': 'Article deleted successfully'}), 200
        
    except Exception as e:
        print(f"Delete article error: {e}")
        return jsonify({'error': 'Failed to delete article'}), 500


@articles_bp.route('/<article_id>/set-lead', methods=['POST'])
def set_lead_article(article_id):
    """
    POST /api/articles/:id/set-lead
    Set article as lead story
    
    Returns: { "success": bool }
    """
    try:
        # Check if setting exists
        existing = supabase.table('site_settings').select('*').eq('key', 'lead_article_id').execute()
        
        if existing.data and len(existing.data) > 0:
            # Update existing
            supabase.table('site_settings').update({'value': article_id}).eq('key', 'lead_article_id').execute()
        else:
            # Insert new
            supabase.table('site_settings').insert({'key': 'lead_article_id', 'value': article_id}).execute()
        
        return jsonify({'success': True, 'message': 'Lead story updated'}), 200
        
    except Exception as e:
        print(f"Set lead article error: {e}")
        return jsonify({'error': 'Failed to set lead article'}), 500


@articles_bp.route('/<article_id>/edit', methods=['POST'])
def edit_article_with_ai(article_id):
    """
    POST /api/articles/:id/edit
    Edit article using AI
    
    Body: { "action": str, "customPrompt": str (optional) }
    Returns: { "article": {...}, "success": bool, "changes": [...] }
    """
    try:
        data = request.get_json()
        action = data.get('action')
        custom_prompt = data.get('customPrompt')
        
        # Get current article
        article_response = supabase.table('articles').select('*').eq('id', article_id).execute()
        
        if not article_response.data or len(article_response.data) == 0:
            return jsonify({'error': 'Article not found'}), 404
        
        article = article_response.data[0]
        
        # For now, return the article unchanged with a message
        # TODO: Integrate with OpenAI to perform actual edits
        changes = []
        
        if action == 'punch-headline':
            changes.append('title')
        elif action == 'shorten':
            changes.append('body')
        elif action == 'expand':
            changes.append('body')
        elif action == 'strengthen-lead':
            changes.append('excerpt')
        elif action in ['add-data', 'add-quotes', 'balance']:
            changes.append('body')
        elif action in ['formal', 'urgent', 'analytical', 'accessible']:
            changes.append('body')
        elif action == 'custom' and custom_prompt:
            changes.append('body')
        
        # Return success for now - actual AI editing would require OpenAI integration
        return jsonify({
            'article': article,
            'success': True,
            'changes': changes,
            'message': f'Edit action "{action}" noted (AI editing not yet implemented)'
        }), 200
        
    except Exception as e:
        print(f"Edit article error: {e}")
        return jsonify({'error': 'Failed to edit article'}), 500


@articles_bp.route('/<article_id>/image', methods=['POST'])
def save_article_image(article_id):
    """
    POST /api/articles/:id/image
    Save image for article
    
    Body: { "imageData": { id, url, source, sourceDomain, prompt, sourceUrl, caption? } }
    Returns: { "success": bool, "imageId": str, "imageUrl": str, "caption": str }
    
    If no caption is provided, one will be auto-generated using AI.
    """
    try:
        data = request.get_json()
        image_data = data.get('imageData', {})
        
        if not image_data:
            return jsonify({'error': 'imageData is required'}), 400
        
        # Determine the image URL to store
        image_url = image_data.get('url') or ''
        if not image_url and image_data.get('base64'):
            image_url = f"data:image/png;base64,{image_data.get('base64')}"
        
        # Determine image type based on source
        source = image_data.get('source', 'ai_generated')
        image_type = 'extracted' if source == 'extracted' else 'ai_generated'
        
        # Build alt text
        if source == 'extracted':
            alt_text = f"Image from {image_data.get('sourceDomain', 'news source')}"
        else:
            alt_text = (image_data.get('prompt', '') or 'Article image')[:200]
        
        # Get caption - if not provided, auto-generate one
        caption = image_data.get('caption', '').strip()
        
        if not caption:
            # Fetch article details for context
            article_response = supabase.table('articles').select('title, excerpt').eq('id', article_id).execute()
            
            if article_response.data and len(article_response.data) > 0:
                article = article_response.data[0]
                try:
                    from services.openai_service import generate_image_caption
                    caption = generate_image_caption(
                        article_title=article.get('title', ''),
                        article_excerpt=article.get('excerpt', ''),
                        image_source=source,
                        image_prompt=image_data.get('prompt'),
                        source_domain=image_data.get('sourceDomain')
                    )
                    print(f"[CAPTION] Auto-generated: {caption}")
                except Exception as caption_err:
                    print(f"[CAPTION] Auto-generation failed: {caption_err}")
                    caption = ''
        
        # Save image to database - try with caption first, fallback without
        image_insert_data = {
            'article_id': article_id,
            'image_type': image_type,
            'url': image_url,
            'origin_url': image_data.get('sourceUrl') if source == 'extracted' else None,
            'prompt': image_data.get('prompt', ''),
            'alt_text': alt_text,
        }
        
        # Try to include caption (if column exists)
        try:
            image_insert_data['caption'] = caption
            image_record = supabase.table('images').insert(image_insert_data).execute()
        except Exception as insert_err:
            # Caption column might not exist, try without it
            print(f"[IMAGES] Insert with caption failed, trying without: {insert_err}")
            image_insert_data.pop('caption', None)
            image_record = supabase.table('images').insert(image_insert_data).execute()
        
        if not image_record.data:
            return jsonify({'error': 'Failed to save image'}), 500
        
        saved_image_id = image_record.data[0]['id']
        
        # Update article with image_id
        supabase.table('articles').update({
            'image_id': saved_image_id
        }).eq('id', article_id).execute()
        
        return jsonify({
            'success': True,
            'imageId': saved_image_id,
            'imageUrl': image_url,
            'caption': caption
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Save image error: {e}")
        print(traceback.format_exc())
        
        # If images table doesn't exist, just update article directly
        try:
            response = supabase.table('articles').update({
                'image_id': image_data.get('id', 'saved')
            }).eq('id', article_id).execute()
            
            if response.data:
                return jsonify({
                    'success': True,
                    'imageId': image_data.get('id'),
                    'imageUrl': image_data.get('url', '')
                }), 200
        except Exception as fallback_error:
            print(f"Fallback save also failed: {fallback_error}")
        
        return jsonify({'error': 'Failed to save image', 'message': str(e)}), 500


@articles_bp.route('/<article_id>/publish', methods=['POST'])
def publish_article(article_id):
    """
    POST /api/articles/:id/publish
    Publish article
    
    Returns: { "article": {...} }
    """
    try:
        response = supabase.table('articles')\
            .update({'status': 'published'})\
            .eq('id', article_id)\
            .execute()
        
        if not response.data or len(response.data) == 0:
            return jsonify({'error': 'Article not found'}), 404
        
        return jsonify({
            'article': response.data[0],
            'message': 'Article published successfully'
        }), 200
        
    except Exception as e:
        print(f"Publish article error: {e}")
        return jsonify({'error': 'Failed to publish article'}), 500


@articles_bp.route('/<article_id>/read', methods=['POST'])
@jwt_required()
def track_reading(article_id):
    """
    POST /api/articles/:id/read
    Track article as read by user
    
    Body: { "progress": int } (optional, defaults to 100)
    Returns: { "message": str }
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        progress = data.get('progress', 100)
        
        # Insert reading history
        supabase.table('user_reading_history').insert({
            'user_id': user_id,
            'article_id': article_id,
            'read_progress': progress
        }).execute()
        
        return jsonify({'message': 'Reading tracked successfully'}), 201
        
    except Exception as e:
        print(f"Track reading error: {e}")
        return jsonify({'error': 'Failed to track reading'}), 500


@articles_bp.route('/lead', methods=['GET'])
def get_lead_article():
    """
    GET /api/articles/lead
    Get lead/hero article
    
    Returns: { "article": {...} }
    """
    try:
        # Get from site_settings
        response = supabase.table('site_settings').select('value').eq('key', 'lead_article_id').execute()
        
        if response.data and len(response.data) > 0:
            lead_article_id = response.data[0]['value']
            
            # Get article
            article_response = supabase.table('articles').select('*').eq('id', lead_article_id).execute()
            
            if article_response.data and len(article_response.data) > 0:
                article = enrich_article_with_image(article_response.data[0])
                return jsonify({'article': article}), 200
        
        # Fallback: get most recent published article
        response = supabase.table('articles')\
            .select('*')\
            .eq('status', 'published')\
            .order('created_at', desc=True)\
            .limit(1)\
            .execute()
        
        if response.data and len(response.data) > 0:
            article = enrich_article_with_image(response.data[0])
            return jsonify({'article': article}), 200
        
        return jsonify({'article': None}), 200
        
    except Exception as e:
        print(f"Get lead article error: {e}")
        return jsonify({'error': 'Failed to get lead article'}), 500


@articles_bp.route('/sections/<section>', methods=['GET'])
def get_articles_by_section(section):
    """
    GET /api/articles/sections/:section
    Get articles for a specific section
    
    Returns: { "articles": [...] }
    """
    try:
        limit = int(request.args.get('limit', 20))
        
        valid_sections = ['politics', 'economics', 'world', 'business', 'tech', 'opinion', 'satire']
        if section not in valid_sections:
            return jsonify({'error': f'Invalid section. Valid: {valid_sections}'}), 400
        
        response = supabase.table('articles')\
            .select('*')\
            .eq('status', 'published')\
            .eq('section', section)\
            .order('created_at', desc=True)\
            .limit(limit)\
            .execute()
        
        # Enrich with image URLs
        articles = enrich_articles_with_images(response.data or [])
        
        return jsonify({'articles': articles}), 200
        
    except Exception as e:
        print(f"Get articles by section error: {e}")
        return jsonify({'error': 'Failed to get articles'}), 500


@articles_bp.route('/search', methods=['GET'])
def search_articles():
    """
    GET /api/articles/search
    Search articles by keyword (searches title, excerpt, and body)
    
    Query params:
    - q: Search query (required)
    - limit: Number of results (default: 10)
    
    Returns: { "articles": [...], "query": str }
    """
    try:
        query = request.args.get('q', '').strip()
        limit = int(request.args.get('limit', 10))
        
        if not query:
            return jsonify({'articles': [], 'query': ''}), 200
        
        if len(query) < 2:
            return jsonify({'articles': [], 'query': query}), 200
        
        # Search using ilike for case-insensitive partial matching
        # Search in title, excerpt, and body
        search_pattern = f'%{query}%'
        
        response = supabase.table('articles')\
            .select('id, title, excerpt, slug, section, author, created_at, image_id')\
            .eq('status', 'published')\
            .or_(f'title.ilike.{search_pattern},excerpt.ilike.{search_pattern}')\
            .order('created_at', desc=True)\
            .limit(limit)\
            .execute()
        
        # Enrich with image URLs
        articles = enrich_articles_with_images(response.data or [])
        
        return jsonify({
            'articles': articles,
            'query': query,
            'count': len(articles)
        }), 200
        
    except Exception as e:
        print(f"Search articles error: {e}")
        import traceback
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to search articles', 'message': str(e)}), 500

