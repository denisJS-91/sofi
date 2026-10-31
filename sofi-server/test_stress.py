import base64
import os
import requests

API_KEY = os.getenv("OPENROUTER_API_KEY")
URL = "https://openrouter.ai/api/v1/audio/speech"
MODEL = "fish-audio/s2.1-pro-free:free"

with open("my_voice.wav", "rb") as f:
    audio_b64 = base64.b64encode(f.read()).decode("utf-8")

reference_text = "Привет, меня зовут Денис. Сегодня хорошая погода, и я хочу проверить, как работает клонирование голоса. Раз, два, три, четыре, пять."

# Текст с явным ударением на "и" в слове Софи́
input_text = "Привет! Я Софи́. Это мой клонированный голос."

response = requests.post(
    URL,
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    },
    json={
        "model": MODEL,
        "input": input_text,
        "response_format": "mp3",
        "input_references": [
            {
                "type": "input_audio",
                "input_audio": {"data": f"data:audio/wav;base64,{audio_b64}"},
            },
            {"type": "text", "text": reference_text},
        ],
    },
    timeout=90,
)

if response.status_code == 200:
    with open("cloned_stress.mp3", "wb") as f:
        f.write(response.content)
    print("✅ Файл cloned_stress.mp3 создан")
else:
    print("❌ Ошибка:", response.status_code, response.text)
