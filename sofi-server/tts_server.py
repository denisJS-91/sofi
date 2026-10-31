from flask import Flask, request, send_file, make_response
from flask_cors import CORS
import requests
import io
import os
import base64
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

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

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/audio/speech"
MODEL = "fish-audio/s2.1-pro-free:free"

# Транскрипт того, что записано в my_voice.wav (ДОЛЖЕН точно совпадать)
REFERENCE_TEXT = (
    "Привет, меня зовут Денис. Сегодня хорошая погода, и я хочу проверить, "
    "как работает клонирование голоса. Раз, два, три, четыре, пять."
)

# Загружаем my_voice.wav один раз при старте
VOICE_FILE = "my_voice.wav"
audio_b64 = None
if os.path.exists(VOICE_FILE):
    with open(VOICE_FILE, "rb") as f:
        audio_b64 = base64.b64encode(f.read()).decode("utf-8")
    print(f"✅ Образец голоса загружен: {VOICE_FILE} ({len(audio_b64)} b64 chars)")
else:
    print(f"⚠️  Файл {VOICE_FILE} не найден — клонирование недоступно")


@app.after_request
def after_request(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


def fix_stress(text: str) -> str:
    """Ставит ударение в 'Софи' → 'Софи́' (на 'и')."""
    return text.replace("Софи", "Софи́")


@app.route("/tts", methods=["POST", "OPTIONS"])
def tts():
    if request.method == "OPTIONS":
        return make_response("", 200)

    data = request.json or {}
    text = data.get("text", "")
    if not text:
        return {"error": "text required"}, 400

    # Правильное ударение
    text = fix_stress(text)

    try:
        payload = {
            "model": MODEL,
            "input": text,
            "response_format": "mp3",
        }

        # Если образец голоса загружен — добавляем клонирование
        if audio_b64:
            payload["input_references"] = [
                {
                    "type": "input_audio",
                    "input_audio": {"data": f"data:audio/wav;base64,{audio_b64}"},
                },
                {"type": "text", "text": REFERENCE_TEXT},
            ]

        response = requests.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=90,
        )
        response.raise_for_status()
        return send_file(
            io.BytesIO(response.content),
            mimetype="audio/mpeg",
            as_attachment=False,
        )
    except requests.HTTPError as e:
        print(f"Fish Audio HTTP error: {e.response.status_code} {e.response.text}")
        return {"error": str(e)}, 500
    except Exception as e:
        print(f"Fish Audio TTS error: {e}")
        return {"error": str(e)}, 500


if __name__ == "__main__":
    if not OPENROUTER_API_KEY:
        print("⚠️  OPENROUTER_API_KEY не задан")
    print(f"🔊 Fish Audio TTS on http://localhost:5001 (model: {MODEL})")
    app.run(host="0.0.0.0", port=5001)
