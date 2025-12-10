"""
Settings API Routes
Handles site settings
"""
from flask import Blueprint, jsonify
from database.supabase_client import supabase

settings_bp = Blueprint('settings', __name__)


@settings_bp.route('/lead-article', methods=['GET'])
def get_lead_article_id():
    """
    GET /api/settings/lead-article
    Get current lead article ID
    
    Returns: { "leadArticleId": str | null }
    """
    try:
        response = supabase.table('site_settings').select('value').eq('key', 'lead_article_id').execute()
        
        if response.data and len(response.data) > 0:
            return jsonify({'leadArticleId': response.data[0]['value']}), 200
        
        return jsonify({'leadArticleId': None}), 200
        
    except Exception as e:
        print(f"Get lead article ID error: {e}")
        return jsonify({'leadArticleId': None}), 200

