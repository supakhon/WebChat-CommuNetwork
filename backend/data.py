import sqlite3
import uuid

# ===== Database Section ===== #
def get_db():
    return sqlite3.connect('users.db')

def init_db():
    order_db(
        """
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        password TEXT,
        token TEXT
        )
        """
    )
    print("You created new database lew na kub.")

# --- Database (for me kubb) ---#
def order_db(executeCommand):
    database = get_db()
    dbCommand = database.cursor()
    dbCommand.execute(executeCommand)
    database.commit()
    database.close()

# ===== Register Section ===== #
def create_user(username, password):
    order_db(
        """
        INSERT INTO users (username, password) 
        VALUES (?, ?)
        """, (username, password)
    )
    print("User has been created.")
    
# ===== Login Section ===== #
def get_token(username, password):
    database = get_db()
    dbCommand = database.cursor()
    dbCommand.execute(
        "SELECT * FORM users WHERE username=? AND password=?", 
        (username, password))
    user = dbCommand.fetchone()

    if user:
        token = str(uuid.uuid4())

        dbCommand.execute("UPDATE users SET token=? WHERE id=?",
                          (token, user[0]))
        database.commit()
        database.close()

        return token
    else:
        database.commit()
        database.close()
        return None

# ===== Chat Section ===== #
def get_user_from_cookies(cookies):
    token = cookies
    if not token:
        return None
    
    database = get_db()
    dbCommand = database.cursor()
    dbCommand.execute("SELECT * FROM users WHERE token=?",
                      (token))
    user = dbCommand.fetchone()
    database.close()

    return user
