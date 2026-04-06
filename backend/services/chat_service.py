import time
from . import data_service

MESSAGES = []


def get_group_by_id(group_id):
    """
    Find a group in the database by its ID.
    """

    return data_service.get_group_by_id(group_id)


def get_group_members(group):
    """
    Get all user IDs in a group.
    """

    return data_service.get_group_members_by_group_id(group["id"])


def get_expected_recipient_count(target_id, include_sender=False):
    """
    Count users who should receive a message, excluding the sender unless include_sender is True.
    """

    group = get_group_by_id(target_id)
    if group:
        count = len(get_group_members(group))
        return count if include_sender else count - 1

    return 2 if include_sender else 1


def is_user_in_group(user_id, group_id):
    """
    Check if a user is part of a group.
    """

    group = get_group_by_id(group_id)
    if not group:
        return False

    return str(user_id) in get_group_members(group)


def is_message_for_user(user_id, message):
    """
    Check if a message is for a user.
    """

    if str(message["sender_id"]) == str(user_id):
        return message.get("include_sender", False)

    target_id = message["target_id"]
    if str(target_id) == str(user_id):
        return True

    return is_user_in_group(user_id, target_id)


def is_message_already_received_by_user(user_id, message):
    """
    Check if a message has already been received by a user.
    """

    return str(user_id) in message["received_by"]


def format_message_response(message):
    """
    Format message for response.
    """

    return {
        "sender_id": message["sender_id"],
        "target_id": message["target_id"],
        "type": message["type"],
        "data": message["data"],
        "timestamp": message["timestamp"],
    }


def send_message_service(sender_id, target_id, message_type, content, include_sender=False):
    """
    Store a message and determine the expected recipient count.
    """

    message_object = {
        "sender_id": sender_id,
        "target_id": target_id,
        "type": message_type,
        "data": content,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "received_by": [],
        "expected_count": get_expected_recipient_count(target_id, include_sender),
        "include_sender": include_sender,
    }

    MESSAGES.append(message_object)
    return {"message": format_message_response(message_object)}


def get_pending_service(user_id):
    """
    Fetch messages for the user.
    """

    global MESSAGES
    user_messages = []

    for message in MESSAGES:
        if is_message_for_user(user_id, message) and not is_message_already_received_by_user(user_id, message):
            user_messages.append(format_message_response(message))
            message["received_by"].append(str(user_id))

    # Clean up messages that are fully received
    MESSAGES = [message for message in MESSAGES if len(message["received_by"]) < message["expected_count"]]

    return user_messages


def create_group_service(creator_id, users):
    """
    Create a new group and notify members.
    """

    group_id = data_service.create_group(creator_id)

    # Add creator to group
    data_service.add_group_member(group_id, creator_id)

    # Add other users to group
    for user_id in users:
        data_service.add_group_member(group_id, user_id)

    # Fetch creator username for notifications
    creator_user = data_service.get_user_by_id(creator_id)
    creator_username = creator_user[1] if creator_user else "Unknown"

    # Send notification messages to the group
    for user_id in users:
        added_user = data_service.get_user_by_id(user_id)
        added_username = added_user[1] if added_user else "Unknown"

        notification_content = f"{creator_username} : Added {added_username}"

        # Send as a system message from creator to group
        send_message_service(creator_id, str(group_id), "text", notification_content, include_sender=True)

    return {"group_id": str(group_id)}
