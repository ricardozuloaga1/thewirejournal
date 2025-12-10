"""
User Management Routes
Handles user profile operations and preferences
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from database.supabase_client import supabase

users_bp = Blueprint('users', __name__)


@users_bp.route('/<user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """
    GET /api/users/:id
    Get user by ID
    
    Returns: { "user": {...} }
    """
    try:
        user = User.find_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        print(f"Get user error: {e}")
        return jsonify({'error': 'Failed to get user'}), 500


@users_bp.route('/<user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """
    PUT /api/users/:id
    Update user profile
    
    Body: { "name": str, "bio": str, "avatar_url": str }
    Returns: { "user": {...} }
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Users can only update their own profile
        if current_user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        # Allowed fields to update
        allowed_fields = ['name', 'bio', 'avatar_url']
        updates = {k: v for k, v in data.items() if k in allowed_fields}
        
        if not updates:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        user = User.update(user_id, updates)
        
        if not user:
            return jsonify({'error': 'Failed to update user'}), 500
        
        return jsonify({
            'user': user.to_dict(),
            'message': 'Profile updated successfully'
        }), 200
        
    except Exception as e:
        print(f"Update user error: {e}")
        return jsonify({'error': 'Failed to update user'}), 500


@users_bp.route('/<user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """
    DELETE /api/users/:id
    Delete user account
    
    Returns: { "message": str }
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Users can only delete their own account
        if current_user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        success = User.delete(user_id)
        
        if not success:
            return jsonify({'error': 'Failed to delete user'}), 500
        
        return jsonify({'message': 'Account deleted successfully'}), 200
        
    except Exception as e:
        print(f"Delete user error: {e}")
        return jsonify({'error': 'Failed to delete user'}), 500


@users_bp.route('/<user_id>/preferences', methods=['GET'])
@jwt_required()
def get_preferences(user_id):
    """
    GET /api/users/:id/preferences
    Get user preferences
    
    Returns: { "preferences": {...} }
    """
    try:
        current_user_id = get_jwt_identity()
        
        if current_user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        user = User.find_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'preferences': user.preferences}), 200
        
    except Exception as e:
        print(f"Get preferences error: {e}")
        return jsonify({'error': 'Failed to get preferences'}), 500


@users_bp.route('/<user_id>/preferences', methods=['PUT'])
@jwt_required()
def update_preferences(user_id):
    """
    PUT /api/users/:id/preferences
    Update user preferences
    
    Body: { "sections": ["politics", "tech", ...] }
    Returns: { "preferences": {...} }
    """
    try:
        current_user_id = get_jwt_identity()
        
        if current_user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        preferences = data.get('preferences', {})
        
        # Validate sections if provided
        if 'sections' in preferences:
            valid_sections = ['politics', 'economics', 'world', 'business', 'tech', 'opinion']
            sections = preferences['sections']
            
            if not isinstance(sections, list):
                return jsonify({'error': 'Sections must be an array'}), 400
            
            if not all(s in valid_sections for s in sections):
                return jsonify({'error': f'Invalid sections. Valid: {valid_sections}'}), 400
        
        user = User.update(user_id, {'preferences': preferences})
        
        if not user:
            return jsonify({'error': 'Failed to update preferences'}), 500
        
        return jsonify({
            'preferences': user.preferences,
            'message': 'Preferences updated successfully'
        }), 200
        
    except Exception as e:
        print(f"Update preferences error: {e}")
        return jsonify({'error': 'Failed to update preferences'}), 500


@users_bp.route('/<user_id>/bookmarks', methods=['GET'])
@jwt_required()
def get_bookmarks(user_id):
    """
    GET /api/users/:id/bookmarks
    Get user's bookmarked articles
    
    Returns: { "bookmarks": [...] }
    """
    try:
        current_user_id = get_jwt_identity()
        
        if current_user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get bookmarks with article details
        response = supabase.table('user_bookmarks')\
            .select('*, articles(*)')\
            .eq('user_id', user_id)\
            .order('created_at', desc=True)\
            .execute()
        
        bookmarks = []
        if response.data:
            for bookmark in response.data:
                article = bookmark.get('articles')
                if article:
                    bookmarks.append({
                        'bookmark_id': bookmark['id'],
                        'bookmarked_at': bookmark['created_at'],
                        'article': article
                    })
        
        return jsonify({'bookmarks': bookmarks}), 200
        
    except Exception as e:
        print(f"Get bookmarks error: {e}")
        return jsonify({'error': 'Failed to get bookmarks'}), 500


@users_bp.route('/<user_id>/bookmarks/<article_id>', methods=['POST'])
@jwt_required()
def add_bookmark(user_id, article_id):
    """
    POST /api/users/:id/bookmarks/:article_id
    Bookmark an article
    
    Returns: { "message": str }
    """
    try:
        current_user_id = get_jwt_identity()
        
        if current_user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Check if already bookmarked
        existing = supabase.table('user_bookmarks')\
            .select('id')\
            .eq('user_id', user_id)\
            .eq('article_id', article_id)\
            .execute()
        
        if existing.data and len(existing.data) > 0:
            return jsonify({'message': 'Article already bookmarked'}), 200
        
        # Add bookmark
        supabase.table('user_bookmarks').insert({
            'user_id': user_id,
            'article_id': article_id
        }).execute()
        
        return jsonify({'message': 'Article bookmarked successfully'}), 201
        
    except Exception as e:
        print(f"Add bookmark error: {e}")
        return jsonify({'error': 'Failed to bookmark article'}), 500


@users_bp.route('/<user_id>/bookmarks/<article_id>', methods=['DELETE'])
@jwt_required()
def remove_bookmark(user_id, article_id):
    """
    DELETE /api/users/:id/bookmarks/:article_id
    Remove bookmark
    
    Returns: { "message": str }
    """
    try:
        current_user_id = get_jwt_identity()
        
        if current_user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        supabase.table('user_bookmarks')\
            .delete()\
            .eq('user_id', user_id)\
            .eq('article_id', article_id)\
            .execute()
        
        return jsonify({'message': 'Bookmark removed successfully'}), 200
        
    except Exception as e:
        print(f"Remove bookmark error: {e}")
        return jsonify({'error': 'Failed to remove bookmark'}), 500

