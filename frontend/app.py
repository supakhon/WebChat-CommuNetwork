from flask import Flask, send_from_directory

app = Flask(__name__)


@app.route("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory(".", filename)


if __name__ == "__main__":
    print("Frontend server starting on http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=True)
