# 🐱 Sofi — AI Companion

AI-компаньон с памятью, личностью и клонированным голосом. Flutter + Node.js + OpenRouter.

## 🎯 Что это

Sofi — не просто чат-бот. У неё есть:

- 🧠 **Память** — помнит имя, факты, историю диалога (Firestore + `profile.json`)
- 🎭 **Личность** — 25 модулей на бэкенде (эмоции, состояние, характер)
- 🗣️ **Голос** — распознавание речи (STT) + озвучка **твоим клонированным голосом** (TTS)
- 🌐 **Интернет** — поиск погоды и новостей через web search

## 🏗️ Архитектура

┌────────────────────┐
│ Flutter App │
│ • Auth │
│ • Chat UI │
│ • STT / TTS │
│ • Firestore │
└─────────┬──────────┘
│ HTTP
▼
┌────────────────────┐ ┌──────────────────┐
│ Node.js Backend │─────▶│ OpenRouter │
│ • /chat │ │ • Dots3 (LLM) │
│ • /tts │ │ • Fish Audio │
│ • /health │ └──────────────────┘
│ • 25 модулей │
└─────────┬──────────┘
│
├──▶ Firestore (история, профиль)
└──▶ Python TTS server (5001, Fish Audio + клонирование)

## 🧰 Технологии

**Flutter:** Firebase (Auth, Firestore), `http`, `speech_to_text`, `just_audio`, `provider`, `google_fonts`, `flutter_animate`.

**Backend (Node.js):** Express, OpenRouter API (Dots3), 25 модулей личности, web search.

**TTS (Python, Flask):** Fish Audio через OpenRouter, клонирование голоса по образцу.

**LLM:** `dots-studio/dots-3-note-preview:free` (OpenRouter, 280B MoE, хороший русский, free-тариф 50 запросов/день).

## 🚀 Быстрый старт

### Требования

- Flutter SDK 3.3+
- Node.js 18+
- Python 3.10+ (для TTS-сервера)

### 1. Клонировать репозиторий

```bash
git clone <repo-url>
cd sofi

2. Настроить ключи

OPENROUTER_API_KEY=sk-or-v1-...
Ключ взять на openrouter.ai/keys.

3. Установить зависимости

# Flutter
flutter pub get

# Node.js
cd sofi-server
npm install

# Python (TTS)
python3 -m venv ~/Desktop/sofi/.venv
source ~/Desktop/sofi/.venv/bin/activate
pip install flask flask-cors requests python-dotenv

4. Запустить три терминала

Терминал 1 — бэкенд:

cd sofi-server
node index.js
# → 🧠 Sofi V8 running on http://localhost:3000

Терминал 2 — TTS:

cd sofi-server
source ~/Desktop/sofi/.venv/bin/activate
python tts_server.py
# → ✅ Образец голоса загружен: my_voice.wav
# → 🔊 Fish Audio TTS on http://localhost:5001

Терминал 3 — Flutter:

cd sofi
flutter run -d chrome

🎤 Голосовое клонирование

Запиши образец голоса (10–20 сек чистой речи) → sofi-server/my_voice.wav.

Обнови REFERENCE_TEXT в tts_server.py — это точный транскрипт того, что ты сказал в my_voice.wav.

Перезапусти tts_server.py. Образец загрузится автоматически.

Важно: my_voice.wav не коммитится (в .gitignore) — это личные данные.

📁 Структура

sofi/
├── lib/
│   ├── main.dart                 # auth-роутинг
│   ├── models/
│   │   └── chat_message.dart
│   ├── screens/
│   │   ├── login_screen.dart
│   │   └── chat_screen.dart
│   ├── services/
│   │   ├── ai_service.dart       # HTTP к бэкенду
│   │   ├── firestore_memory.dart # история
│   │   ├── voice_service.dart    # STT + TTS
│   │   └── search_detector.dart
│   ├── theme/
│   │   └── app_theme.dart
│   └── widgets/
│       ├── message_bubble.dart
│       └── chat_input.dart
└── pubspec.yaml

sofi-server/
├── index.js                      # /chat, /tts, /health
├── ai.js                         # OpenRouter + Dots3
├── tts_server.py                 # Fish Audio + клонирование
├── ai/                           # модули личности
├── memory/                       # profile.json
├── tools/                        # web search
├── prompt/
├── utils/
├── .env                          # НЕ коммитить
└── package.json

🔧 Проверка

# Healthcheck
curl http://localhost:3000/health
# {"ok":true,"name":"sofi","v":8}

# Чат
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Привет","userId":"test"}'
# {"reply":"Привет! Как ты сегодня?"} за 3–5 сек

# TTS
curl -X POST http://localhost:5001/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Привет! Я Софи."}' \
  --output test.mp3

 🟡 Известные ограничения

- **Лимит OpenRouter:** 50 запросов/день на free-тарифе.
- **Иногда «Я рядом.»** (~10%): включён retry 2×.
- **Fish Audio free** нестабилен: голос может меняться между запросами. Клонирование через `input_references` фиксирует его, но **не всегда** на 100%.
- **Клонирование** через OpenRouter — недокументированный сценарий, может сломаться при обновлении API.

📝 Что не трогать

index.js — пост-фильтры (stripCapsPrefixes, fixMyNameAnswer, fixSpacing, fixTruncation).

ai.js — модель dots-3-note-preview:free, max_tokens: 1500, retry 2×.

ai_service.dart — utf8.decode(response.bodyBytes) (иначе русский ломается).

promptRouter.js — formatHistory (последние 10 сообщений).

memory/extractor.js — regex для имени + isJunk.

.env, my_voice.wav — не коммитить.


```
