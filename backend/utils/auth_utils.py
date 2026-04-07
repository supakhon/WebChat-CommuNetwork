from flask import request
from services.data_service import get_user_by_token

def get_current_user():
    """
    Utility function to fetch the current user from the Authorization header or session cookie.
    """
    token = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]

    if not token:
        token = request.cookies.get("remember_token")

    if not token:
        return None
        
    return get_user_by_token(token)
