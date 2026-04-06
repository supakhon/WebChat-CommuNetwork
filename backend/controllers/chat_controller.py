from flask import Blueprint, request, jsonify
from services.chat_service import send_message_service, get_pending_service, create_group_service
from services.data_service import get_user_from_cookies

chat_router = Blueprint("chat", __name__)


def get_current_user():
    """
    Utility function to fetch the current user from the session cookie.
    """
    token = request.cookies.get("remember_token")
    if not token:
        return None
    return get_user_from_cookies(token)


@chat_router.route("/message/send", methods=["POST"])
def send_message_handler():
    """
    Handle message sending. Identity is derived from cookies.
    """
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    target_id = data.get("target_id")
    msg_type = data.get("type")
    content = data.get("data")

    if not target_id or not msg_type or not content:
        return jsonify({"error": "Missing message details"}), 400

    result = send_message_service(user[0], target_id, msg_type, content)
    return jsonify(result)


@chat_router.route("/message/get_pending", methods=["GET"])
def get_pending_handler():
    """
    Fetch all persistent messages for the current user.
    """
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    messages = get_pending_service(user[0])
    return jsonify(messages)


@chat_router.route("/message/create_group", methods=["POST"])
def create_group_handler():
    """
    Handle group creation. Creator identity derived from cookies.
    """
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    users = data.get("users")

    if not users or not isinstance(users, list):
        return jsonify({"error": "Users list required"}), 400

    result = create_group_service(user[0], users)
    return jsonify(result)
