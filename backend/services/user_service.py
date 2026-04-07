from services.data_service import get_user_by_token, search_users


def get_user_info(token):
    user = get_user_by_token(token)
    if user:
        return {"id": user["id"], "username": user["username"]}
    return None


def search_users_list(search_query):
    users = search_users(search_query)
    return [{"id": user["id"], "username": user["username"]} for user in users]
