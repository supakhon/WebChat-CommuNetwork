import sqlite3
import uuid


# ===== Database Section ===== #
def get_db():
    return sqlite3.connect("database.db")


def init_db():
    """
    For Creating Database database.db if it is not exist

    ฟังก์ชั่นสำหรับสร้าง Database อย่างไฟล์ database.db ในกรณีที่ไฟล์นี้ไม่มีอยู่
    """

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
    order_db(
        """
        CREATE TABLE IF NOT EXISTS groups (
        id TEXT PRIMARY KEY,
        creator_id INTEGER NOT NULL,
        FOREIGN KEY (creator_id) REFERENCES users (id)
        )
        """
    )
    order_db(
        """
        CREATE TABLE IF NOT EXISTS group_members (
        group_id TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        PRIMARY KEY (group_id, user_id),
        FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
        """
    )
    print("Database initialized (Users, Groups, and Members).")


# === Database (for me kubb) === #
def order_db(execute_command, params=()):
    database = get_db()
    db_command = database.cursor()
    db_command.execute(execute_command, params)
    database.commit()
    database.close()


# ===== Register Section ===== #
def create_user(username, password):
    """
    For Creating User into the database or Add Username and Password into Database

    สร้างผู้ใช้และเอาลง Database หรือการเพิ่มชื่อและรหัสผ่านลงไปใน Database
    """

    order_db(
        """
        INSERT INTO users (username, password) 
        VALUES (?, ?)
        """,
        (username, password),
    )
    print(f"User '{username}' has been created.")


# ===== Login Section ===== #
def get_token(username, password):
    """
    Get/Set Token from Username and Password

    ฟังก์ชั่นที่เอาไว้ เอาค่า Token แล้วก็ตั้งค่า Token ให้กับ User ผ่าน Username Password
    """

    database = get_db()
    db_command = database.cursor()
    db_command.execute("SELECT * FROM users WHERE username=? AND password=?", (username, password))
    user = db_command.fetchone()

    if user:
        token = str(uuid.uuid4())
        db_command.execute("UPDATE users SET token=? WHERE id=?", (token, user[0]))
        database.commit()
        database.close()
        return token
    else:
        database.close()
        return None


# ===== Chat Section ===== #
def get_user_from_cookies(cookies):
    """
    get User from cookies

    เอา User มา โดยอึงจาก Cookies ที่ Set ไว้ที่ Browser

    `cookies = request.cookies.get("[remember_token]")`
    """

    token = cookies
    if not token:
        return None

    database = get_db()
    db_command = database.cursor()
    db_command.execute("SELECT * FROM users WHERE token=?", (token,))
    user = db_command.fetchone()
    database.close()

    return user


# ===== User Section ===== #
def get_user_by_id(user_id):
    """
    Fetch user information by ID.
    """

    database = get_db()
    db_command = database.cursor()
    db_command.execute("SELECT id, username FROM users WHERE id=?", (user_id,))
    user = db_command.fetchone()
    database.close()

    return user


def search_users(search_query):
    database = get_db()
    db_command = database.cursor()
    db_command.execute("SELECT id, username FROM users WHERE username LIKE ?", (f"%{search_query}%",))
    users_list = db_command.fetchall()
    database.close()
    return users_list


# ===== Group Section ===== #
def create_group(creator_id):
    """
    Create a new group and return its ID.
    """

    group_id = str(uuid.uuid4())
    database = get_db()
    db_command = database.cursor()
    db_command.execute("INSERT INTO groups (id, creator_id) VALUES (?, ?)", (group_id, creator_id))
    database.commit()
    database.close()
    return group_id


def add_group_member(group_id, user_id):
    """
    Add a user to a group.
    """

    order_db(
        "INSERT OR IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)",
        (group_id, user_id),
    )


def get_group_by_id(group_id):
    """
    Fetch group information by ID.
    """

    database = get_db()
    db_command = database.cursor()
    db_command.execute("SELECT id, creator_id FROM groups WHERE id=?", (group_id,))
    group = db_command.fetchone()
    database.close()

    if group:
        return {"id": str(group[0]), "creator_id": group[1]}
    return None


def get_group_members_by_group_id(group_id):
    """
    Fetch all member user IDs for a given group ID.
    """

    database = get_db()
    db_command = database.cursor()
    db_command.execute("SELECT user_id FROM group_members WHERE group_id=?", (group_id,))
    members = db_command.fetchall()
    database.close()

    return [str(member[0]) for member in members]
