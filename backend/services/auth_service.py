from services import data_service as data


def login(username, password):
    """
    Authenticate user and return a session token.
    """
    return data.get_token(username, password)


def signup(username, password):
    """
    Register a new user in the database.
    """

    data.create_user(username, password)
