from flask import Blueprint, request, jsonify
from services.user_service import get_user_info, search_users_list

user_router = Blueprint("user", __name__)


@user_router.route("/user", methods=["GET"])
def user_info_handler():
    token = request.cookies.get("remember_token")
    if not token:
        return jsonify({"error": "Unauthorized"}), 401

    user = get_user_info(token)
    if user:
        return jsonify(user)
    else:
        return jsonify({"error": "User not found"}), 404


@user_router.route("/user/search", methods=["GET"])
def user_search_handler():
    search_query = request.args.get("query", "")
    users = search_users_list(search_query)
    return jsonify(users)
