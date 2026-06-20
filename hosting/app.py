import importlib.util
import subprocess
import sys
from pathlib import Path


def _ensure_dependencies():
    required_packages = [
        "flask",
        "flask_socketio",
        "flask_wtf",
        "gevent",
        "geventwebsocket",
    ]

    missing = [
        pkg for pkg in required_packages
        if importlib.util.find_spec(pkg) is None
    ]

    if missing:
        req = Path(__file__).resolve().parent / "requirements.txt"
        subprocess.check_call([
            sys.executable,
            "-m",
            "pip",
            "install",
            "-r",
            str(req)
        ])


_ensure_dependencies()

from gevent import monkey
monkey.patch_all()

from flask import Flask, render_template, abort
from flask_socketio import SocketIO
from flask_wtf import CSRFProtect
from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler


app = Flask(
    __name__,
    template_folder="templates"
)

app.config["SECRET_KEY"] = "change-me"

socketio = SocketIO(app, async_mode="gevent")
CSRFProtect(app)


# =========================
# HTML 자동 서비스
# =========================

@app.route("/", defaults={"page": "index"})
@app.route("/<path:page>")
def serve_html(page):

    if not page.endswith(".html"):
        page += ".html"

    templates_dir = Path(app.template_folder).resolve()
    target = (templates_dir / page).resolve()

    # templates 밖 접근 차단
    if not str(target).startswith(str(templates_dir)):
        abort(403)

    # 파일 존재 확인
    if not target.exists():
        abort(404)

    return render_template(page)


# =========================
# data 파일 제공
# =========================

@app.route("/get/data/<path:filename>")
def get_data(filename):

    try:
        data_dir = (
            Path(__file__).resolve().parent.parent / "data"
        ).resolve()

        file_path = (data_dir / filename).resolve()

        if not str(file_path).startswith(str(data_dir)):
            return {"error": "Access denied"}, 403

        if not file_path.exists():
            return {"error": f"File not found: {filename}"}, 404

        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        return content, 200, {
            "Content-Type": "text/plain; charset=utf-8"
        }

    except Exception as e:
        return {"error": str(e)}, 500


# =========================
# 실행
# =========================

if __name__ == "__main__":

    print("=" * 50)
    print("Server started")
    print("Templates :", Path(app.template_folder).resolve())
    print("URL       : http://0.0.0.0:6767")
    print("=" * 50)

    server = WSGIServer(
        ("0.0.0.0", 6767),
        app,
        handler_class=WebSocketHandler
    )

    server.serve_forever()