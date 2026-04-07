from flask import Blueprint, request, jsonify, make_response
from services.user_service import get_user_info, search_users_list
from utils.auth_utils import get_current_user

user_router = Blueprint("user", __name__)


@user_router.route("/user", methods=["GET"])
def user_info_handler():
    user = get_current_user()
    if user:
        return jsonify({"id": user["id"], "username": user["username"]})
    else:
        return jsonify({"error": "Unauthorized"}), 401


@user_router.route("/user/logout", methods=["GET"])
def logout_handler():
    """
    Handle user logout by clearing the 'remember_token' cookie.
    """
    response = make_response(jsonify({"message": "Logout Success"}))
    response.set_cookie("remember_token", "", expires=0)
    return response


@user_router.route("/user/search", methods=["GET"])
def user_search_handler():
    search_query = request.args.get("query", "")
    users = search_users_list(search_query)
    return jsonify(users)
