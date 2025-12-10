"""
Authentication Routes
Handles user registration, login, and logout
"""
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models.user import User
import re

auth_bp = Blueprint('auth', __name__)


def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password(password: str) -> tuple[bool, str]:
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    return True, ""


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    POST /api/auth/register
    Register a new user
    
    Body: { "email": str, "password": str, "name": str }
    Returns: { "user": {...}, "access_token": str, "refresh_token": str }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        name = data.get('name', '').strip()
        
        if not email or not password or not name:
            return jsonify({'error': 'Email, password, and name are required'}), 400
        
        # Validate email format
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password strength
        is_valid, error_msg = validate_password(password)
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        # Check if user already exists
        existing_user = User.find_by_email(email)
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 409
        
        # Hash password
        password_hash = current_app.bcrypt.generate_password_hash(password).decode('utf-8')
        
        # Create user
        user = User.create(email=email, password_hash=password_hash, name=name)
        
        if not user:
            return jsonify({'error': 'Failed to create user'}), 500
        
        # Generate tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token,
            'message': 'Registration successful'
        }), 201
        
    except Exception as e:
        import traceback
        print(f"Registration error: {e}")
        print(traceback.format_exc())
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    POST /api/auth/login
    Login existing user
    
    Body: { "email": str, "password": str }
    Returns: { "user": {...}, "access_token": str, "refresh_token": str }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user
        user_data = User.find_by_email(email)
        if not user_data:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Check if password_hash exists
        if 'password_hash' not in user_data or not user_data['password_hash']:
            print(f"User {email} has no password_hash!")
            return jsonify({'error': 'Account error - please contact support'}), 500
        
        # Verify password
        try:
            password_valid = current_app.bcrypt.check_password_hash(user_data['password_hash'], password)
        except Exception as pw_error:
            print(f"Password check error: {pw_error}")
            return jsonify({'error': 'Invalid email or password'}), 401
            
        if not password_valid:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Update last login (don't fail if this errors)
        try:
            User.update_last_login(user_data['id'])
        except:
            pass
        
        # Create user object (without password_hash)
        user = User(
            id=user_data['id'],
            email=user_data['email'],
            name=user_data['name'],
            bio=user_data.get('bio'),
            avatar_url=user_data.get('avatar_url'),
            preferences=user_data.get('preferences'),
            created_at=user_data.get('created_at'),
            updated_at=user_data.get('updated_at'),
            last_login=user_data.get('last_login')
        )
        
        # Generate tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token,
            'message': 'Login successful'
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Login error: {e}")
        print(traceback.format_exc())
        return jsonify({'error': f'Login failed: {str(e)}'}), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    GET /api/auth/me
    Get current authenticated user
    
    Headers: Authorization: Bearer <token>
    Returns: { "user": {...} }
    """
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        print(f"Get current user error: {e}")
        return jsonify({'error': 'Failed to get user'}), 500


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    POST /api/auth/refresh
    Refresh access token using refresh token
    
    Headers: Authorization: Bearer <refresh_token>
    Returns: { "access_token": str }
    """
    try:
        user_id = get_jwt_identity()
        access_token = create_access_token(identity=user_id)
        
        return jsonify({'access_token': access_token}), 200
        
    except Exception as e:
        print(f"Token refresh error: {e}")
        return jsonify({'error': 'Failed to refresh token'}), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    POST /api/auth/logout
    Logout user (client should delete tokens)
    
    Headers: Authorization: Bearer <token>
    Returns: { "message": str }
    """
    # Note: JWT tokens are stateless, so logout is handled client-side
    # by deleting the tokens. You could implement a token blacklist for extra security.
    return jsonify({'message': 'Logout successful'}), 200

