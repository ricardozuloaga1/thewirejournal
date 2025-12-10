"""
User Model and Database Operations
"""
from typing import Optional, Dict, List, Any
from datetime import datetime
import uuid
from database.supabase_client import supabase


class User:
    """User model for database operations"""
    
    def __init__(self, id: str, email: str, name: str, bio: Optional[str] = None,
                 avatar_url: Optional[str] = None, preferences: Optional[Dict] = None,
                 created_at: Optional[datetime] = None, updated_at: Optional[datetime] = None,
                 last_login: Optional[datetime] = None):
        self.id = id
        self.email = email
        self.name = name
        self.bio = bio
        self.avatar_url = avatar_url
        self.preferences = preferences or {"sections": ["politics", "economics", "world", "business", "tech", "opinion"]}
        self.created_at = created_at
        self.updated_at = updated_at
        self.last_login = last_login
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert user to dictionary (excludes password_hash)"""
        # Handle dates that might be strings or datetime objects
        def format_date(d):
            if d is None:
                return None
            if isinstance(d, str):
                return d
            return d.isoformat()
        
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'bio': self.bio,
            'avatar_url': self.avatar_url,
            'preferences': self.preferences,
            'created_at': format_date(self.created_at),
            'updated_at': format_date(self.updated_at),
            'last_login': format_date(self.last_login)
        }
    
    @staticmethod
    def create(email: str, password_hash: str, name: str) -> Optional['User']:
        """Create a new user"""
        try:
            response = supabase.table('users').insert({
                'email': email,
                'password_hash': password_hash,
                'name': name
            }).execute()
            
            print(f"User create response: {response}")
            
            if response.data:
                user_data = response.data[0]
                return User(
                    id=user_data['id'],
                    email=user_data['email'],
                    name=user_data['name'],
                    bio=user_data.get('bio'),
                    avatar_url=user_data.get('avatar_url'),
                    preferences=user_data.get('preferences'),
                    created_at=user_data.get('created_at'),
                    updated_at=user_data.get('updated_at')
                )
            print(f"No data in response: {response}")
            return None
        except Exception as e:
            import traceback
            print(f"Error creating user: {e}")
            print(traceback.format_exc())
            raise e  # Re-raise to get full error in route
    
    @staticmethod
    def find_by_email(email: str) -> Optional[Dict[str, Any]]:
        """Find user by email (includes password_hash for authentication)"""
        try:
            response = supabase.table('users').select('*').eq('email', email).execute()
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error finding user by email: {e}")
            return None
    
    @staticmethod
    def find_by_id(user_id: str) -> Optional['User']:
        """Find user by ID"""
        try:
            response = supabase.table('users').select('*').eq('id', user_id).execute()
            if response.data and len(response.data) > 0:
                user_data = response.data[0]
                return User(
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
            return None
        except Exception as e:
            print(f"Error finding user by ID: {e}")
            return None
    
    @staticmethod
    def update(user_id: str, updates: Dict[str, Any]) -> Optional['User']:
        """Update user information"""
        try:
            # Remove fields that shouldn't be updated directly
            updates.pop('id', None)
            updates.pop('email', None)
            updates.pop('password_hash', None)
            updates.pop('created_at', None)
            
            response = supabase.table('users').update(updates).eq('id', user_id).execute()
            
            if response.data and len(response.data) > 0:
                user_data = response.data[0]
                return User(
                    id=user_data['id'],
                    email=user_data['email'],
                    name=user_data['name'],
                    bio=user_data.get('bio'),
                    avatar_url=user_data.get('avatar_url'),
                    preferences=user_data.get('preferences'),
                    created_at=user_data.get('created_at'),
                    updated_at=user_data.get('updated_at')
                )
            return None
        except Exception as e:
            print(f"Error updating user: {e}")
            return None
    
    @staticmethod
    def update_last_login(user_id: str) -> bool:
        """Update user's last login timestamp"""
        try:
            supabase.table('users').update({
                'last_login': datetime.utcnow().isoformat()
            }).eq('id', user_id).execute()
            return True
        except Exception as e:
            print(f"Error updating last login: {e}")
            return False
    
    @staticmethod
    def delete(user_id: str) -> bool:
        """Delete a user"""
        try:
            supabase.table('users').delete().eq('id', user_id).execute()
            return True
        except Exception as e:
            print(f"Error deleting user: {e}")
            return False

