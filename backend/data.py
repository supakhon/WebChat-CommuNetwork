import sqlite3
import uuid

# ===== Database Section ===== #
def get_db():
    return sqlite3.connect('users.db')

def init_db():
    '''
    For Creating Database users.db if it is not exist

    ฟังก์ชั่นสำหรับสร้าง Database อย่างไฟล์ users.db ในกรณีที่ไฟล์นี้ไม่มีอยู่
    '''
    
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
    '''
    For Creating User into the database or Add Username and Password into Database
    
    สร้างผู้ใช้และเอาลง Database หรือการเพิ่มชื่อและรหัสผ่านลงไปใน Database
    '''
    
    order_db(
        """
        INSERT INTO users (username, password) 
        VALUES (?, ?)
        """, (username, password)
    )
    print("User has been created.")
    
# ===== Login Section ===== #
def get_token(username, password):
    '''
    Get/Set Token from Username and Password

    ฟังก์ชั่นที่เอาไว้ เอาค่า Token แล้วก็ตั้งค่า Token ให้กับ User ผ่าน Username Password
    '''
    
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
    '''
    get User from cookies
    
    เอา User มา โดยอึงจาก Cookies ที่ Set ไว้ที่ Browser

    `cookies = request.cookies.get("[remember_token]")`
    '''

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
