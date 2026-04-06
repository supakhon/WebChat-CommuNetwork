from services.data_service import get_user_from_cookies, search_users


def get_user_info(token):
    user = get_user_from_cookies(token)
    if user:
        return {"id": user[0], "username": user[1]}
    return None


def search_users_list(search_query):
    users = search_users(search_query)
    return [{"id": user[0], "username": user[1]} for user in users]
