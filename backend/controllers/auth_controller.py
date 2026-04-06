from flask import Blueprint, request, jsonify, make_response
from services.auth_service import login, signup

auth_router = Blueprint("auth", __name__)


@auth_router.route("/login", methods=["GET"])
def login_handler():
    """
    Handle user login via search parameters.
    Sets a 'remember_token' cookie on success.
    """
    username = request.args.get("username")
    password = request.args.get("password")
    token = login(username, password)
    if token:
        response = make_response(jsonify({"message": "Login Success"}))
        response.set_cookie("remember_token", token)
        return response
    else:
        return jsonify({"error": "Invalid Username or Password"}), 401


@auth_router.route("/signup", methods=["GET"])
def signup_handler():
    """
    Handle user registration via search parameters.
    """
    username = request.args.get("username")
    password = request.args.get("password")
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    try:
        signup(username, password)
        return jsonify({"message": "Signup Success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
