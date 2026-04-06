# WebChat-CommuNetwork

A simple web-based chat system that supports direct messaging, file sharing, and group chats.

---

## Tech Stack

| Layer    | Technology            |
| -------- | --------------------- |
| Backend  | Python, Flask         |
| Database | SQLite                |
| Frontend | HTML, Vanilla JS, CSS |

---

## API Endpoints (Backend Routes)

### Auth

| Method | Path    | Description                              |
| ------ | ------- | ---------------------------------------- |
| GET    | /login  | Login with `?username=...&password=...`  |
| GET    | /signup | Signup with `?username=...&password=...` |

### Chat

| Method | Path                  | Description                            |
| ------ | --------------------- | -------------------------------------- |
| POST   | /message/send         | Send a message to a user or group      |
| GET    | /message/get_pending  | Get pending messages for current user  |
| POST   | /message/create_group | Create a group with a list of user IDs |

### User

| Method | Path         | Description                                 |
| ------ | ------------ | ------------------------------------------- |
| GET    | /user        | Get the currently logged-in user from token |
| GET    | /user/search | Search users by `?query=`                   |

---

## Message Format

**Text message** body (JSON):

```json
{
	"target_id": "2",
	"type": "text",
	"data": "Hello!"
}
```

**File message** body (JSON):

```json
{
	"target_id": "2",
	"type": "file",
	"data": {
		"filename": "photo.png",
		"type": "image/png",
		"data": "data:image/png;base64,..."
	}
}
```

---

## Running Locally

**Requirements:** Python 3, Flask, Flask-CORS

**Install dependencies:**

```bash
pip install flask flask-cors
```

**Start the backend:**

```bash
cd backend
python app.py
```

The server runs on `http://localhost:5000`.

**Start the frontend:**

```bash
cd frontend
python app.py
```

The frontend runs on `http://localhost:5001`.
