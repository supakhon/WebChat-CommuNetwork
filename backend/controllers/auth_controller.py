from flask import Blueprint, request, jsonify, make_response
from services.auth_service import login, signup

auth_router = Blueprint("auth", __name__)


@auth_router.route("/login", methods=["POST"])
def login_handler():
    """
    Handle user login via JSON body.
    Returns a session token on success.
    """
    data = request.json
    username = data.get("username")
    password = data.get("password")
    token = login(username, password)
    if token:
        return jsonify({
            "token": token,
            "message": "Login Success"
        })
    else:
        return jsonify({"error": "Invalid Username or Password"}), 401


@auth_router.route("/signup", methods=["POST"])
def signup_handler():
    """
    Handle user registration via JSON body.
    """
    data = request.json
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    try:
        signup(username, password)
        return jsonify({"message": "Signup Success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
