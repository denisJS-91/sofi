from flask import Flask, request, send_file, make_response
from flask_cors import CORS
import asyncio
import edge_tts
import io

app = Flask(__name__)

# Явная настройка CORS — с заголовками для preflight
CORS(
    app,
    resources={
        r"/*": {
            "origins": "*",
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
        }
    },
)

VOICE = "ru-RU-SvetlanaNeural"


@app.after_request
def after_request(response):
    # Дублируем заголовки на всякий случай — работает даже если flask_cors пропустил
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


@app.route("/tts", methods=["POST", "OPTIONS"])
def tts():
    if request.method == "OPTIONS":
        # Preflight — отвечаем пустым 200 с заголовками
        return make_response("", 200)

    data = request.json or {}
    text = data.get("text", "")
    if not text:
        return {"error": "text required"}, 400
    try:

        async def generate():
            communicate = edge_tts.Communicate(text, VOICE, pitch="+35Hz", rate="+15%")
            buf = io.BytesIO()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    buf.write(chunk["data"])
            buf.seek(0)
            return buf

        buf = asyncio.run(generate())
        return send_file(buf, mimetype="audio/mpeg")
    except Exception as e:
        return {"error": str(e)}, 500


if __name__ == "__main__":
    print(f"🔊 Edge TTS on http://localhost:5001 (voice: {VOICE})")
    app.run(host="0.0.0.0", port=5001)
