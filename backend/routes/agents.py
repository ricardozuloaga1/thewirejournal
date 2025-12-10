"""
AI Agents Routes
Handles agent execution and article generation
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import asyncio
import os

agents_bp = Blueprint('agents', __name__)


@agents_bp.route('/run', methods=['POST'])
def run_agent():
    """
    POST /api/agents/run
    Run a specific agent
    
    Body: { "section": str, "word_count": int, "writing_style": str, "topic": str (optional) }
    Returns: { "success": bool, "articles_created": int }
    """
    try:
        # Check if API keys are configured
        if not os.getenv('PERPLEXITY_API_KEY'):
            return jsonify({
                'success': False,
                'error': 'PERPLEXITY_API_KEY not configured',
                'message': 'Please add PERPLEXITY_API_KEY to backend/.env'
            }), 500
        
        if not os.getenv('OPENAI_API_KEY'):
            return jsonify({
                'success': False,
                'error': 'OPENAI_API_KEY not configured',
                'message': 'Please add OPENAI_API_KEY to backend/.env'
            }), 500
        
        data = request.get_json()
        
        # Accept both 'section' and 'agent' for compatibility
        agent_name = data.get('section') or data.get('agent', 'politics')
        word_count = data.get('word_count', 800)
        writing_style = data.get('writing_style', 'standard')
        topic = data.get('topic')
        
        print(f"[AGENT] Starting {agent_name} agent with topic: {topic or 'auto-select'}")
        print(f"[AGENT] Word count: {word_count}, Style: {writing_style}")
        
        # Import here to avoid circular imports
        from agents.orchestrator import run_single_agent
        
        # Run agent
        result = asyncio.run(run_single_agent(
            agent_name=agent_name,
            word_count=word_count,
            writing_style=writing_style,
            custom_topic=topic
        ))
        
        print(f"[AGENT] Result: {result}")
        
        return jsonify({
            'success': result['success'],
            'articles_created': result['articles_created'],
            'errors': result.get('errors', []),
            'message': f'Agent {agent_name} completed'
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Run agent error: {e}")
        print(traceback.format_exc())
        return jsonify({'success': False, 'error': 'Failed to run agent', 'message': str(e)}), 500


@agents_bp.route('/run-all', methods=['POST'])
def run_all_agents_route():
    """
    POST /api/agents/run-all
    Run all agents
    
    Body: { "word_count": int, "writing_style": str }
    Returns: { "success": bool, "articles_created": int }
    """
    try:
        # Check if API keys are configured
        if not os.getenv('PERPLEXITY_API_KEY'):
            return jsonify({
                'success': False,
                'error': 'PERPLEXITY_API_KEY not configured',
                'message': 'Please add PERPLEXITY_API_KEY to backend/.env'
            }), 500
        
        if not os.getenv('OPENAI_API_KEY'):
            return jsonify({
                'success': False,
                'error': 'OPENAI_API_KEY not configured',
                'message': 'Please add OPENAI_API_KEY to backend/.env'
            }), 500
        
        data = request.get_json() or {}
        
        word_count = data.get('word_count', 800)
        writing_style = data.get('writing_style', 'standard')
        
        print(f"[AGENTS] Starting ALL agents. Word count: {word_count}, Style: {writing_style}")
        
        # Import here to avoid circular imports
        from agents.orchestrator import run_all_agents
        
        # Run all agents
        result = asyncio.run(run_all_agents(
            word_count=word_count,
            writing_style=writing_style
        ))
        
        print(f"[AGENTS] All agents result: {result}")
        
        return jsonify({
            'success': result['success'],
            'articles_created': result['articles_created'],
            'errors': result.get('errors', []),
            'message': 'All agents completed'
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Run all agents error: {e}")
        print(traceback.format_exc())
        return jsonify({'success': False, 'error': 'Failed to run agents', 'message': str(e)}), 500


@agents_bp.route('/status', methods=['GET'])
@jwt_required()
def get_agent_status():
    """
    GET /api/agents/status
    Get agent run history
    
    Returns: { "runs": [...] }
    """
    try:
        from database.supabase_client import supabase
        
        response = supabase.table('agent_runs')\
            .select('*')\
            .order('created_at', desc=True)\
            .limit(10)\
            .execute()
        
        return jsonify({'runs': response.data or []}), 200
        
    except Exception as e:
        print(f"Get agent status error: {e}")
        return jsonify({'error': 'Failed to get agent status'}), 500

