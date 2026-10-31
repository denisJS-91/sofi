import base64
import os
import requests

# 1. Ключ и настройки
API_KEY = os.getenv("OPENROUTER_API_KEY")
URL = "https://openrouter.ai/api/v1/audio/speech"
MODEL = "fish-audio/s2.1-pro-free:free"

# 2. Читаем образец голоса и кодируем в base64
with open("my_voice.wav", "rb") as f:
    audio_b64 = base64.b64encode(f.read()).decode("utf-8")

# 3. Транскрипт — ТОЧНО то, что ты говорил в my_voice.wav
#    Замени на свою фразу, если она другая!
reference_text = "Привет, меня зовут Адам. Сегодня хорошая погода, и я хочу проверить, как работает клонирование голоса. Раз, два, три, четыре, пять."

# 4. Текст, который должна произнести Sofi клонированным голосом
input_text = "Привет! Я Софи. Это мой клонированный голос."

# 5. Запрос
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

# 6. Сохраняем результат
if response.status_code == 200:
    with open("cloned_test.mp3", "wb") as f:
        f.write(response.content)
    print("✅ Успех! Файл cloned_test.mp3 создан.")
    print("   Размер:", len(response.content), "байт")
else:
    print("❌ Ошибка:", response.status_code)
    print(response.text)
