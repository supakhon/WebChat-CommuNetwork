from flask import Flask
from flask_cors import CORS
from services import data_service as data

from controllers.auth_controller import auth_router
from controllers.chat_controller import chat_router
from controllers.user_controller import user_router


def create_app():
    """
    Initialize the Flask application and register blueprints.
    """
    app = Flask(__name__)

    CORS(app)

    data.init_db()

    app.register_blueprint(auth_router)
    app.register_blueprint(chat_router)
    app.register_blueprint(user_router)

    print("Backend server initialized and ready.")
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
