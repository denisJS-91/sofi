# 🐱 Sofi — AI Companion

**Sofi** — AI-компаньон для общения, поддержки и помощи. С памятью, личностью, клонированным голосом и доступом в интернет.

Не чат-бот. Компаньон, который помнит тебя, развивается вместе с тобой и помогает — и в интернете (погода, новости, поиск), и без него (разговор, поддержка, обучение).

---

## 🎯 Видение

Sofi создаётся как **долгосрочный компаньон**, а не одноразовый ассистент:

- 🧠 **Помнит** — имя, факты, привычки, историю диалога
- 🎭 **Имеет личность** — стабильный характер, эмоции, реакции
- 🗣️ **Говорит** — распознаёт речь (STT) и отвечает **твоим клонированным голосом** (TTS)
- 🌐 **Помогает** — ищет в интернете, отвечает на вопросы, поддерживает разговор
- 🌱 **Развивается** — подстраивается под пользователя со временем

**Приватность by design:** всё личное (голос, память, история) хранится локально или в твоём Firebase. В облако уходит только запрос к LLM и web search.

---

## 👥 Для кого

### Трек 1 — одиночество и поддержка (основной)

- Пожилые люди, живущие одни
- Remote-работники без живого общения
- Люди после переезда, потери близких, в периоды изоляции

**Что важно:** терпение, память о личном (внуки, привычки), эмоциональная поддержка, простой интерфейс. Sofi **не заменяет** живое общение — она помогает его не терять.

### Трек 2 — развитие речи и обучение

- Дети с задержкой речи (упражнения, повторение)
- Изучающие иностранный язык (разговорная практика)
- Пожилые — когнитивные тренировки

**Что важно:** адаптивная сложность, повторяемость, мягкая обратная связь, безопасный контент.

> Оба трека используют одну архитектуру, но разные **профили** (компаньон / репетитор / логопед) — см. `ARCHITECTURE.md`.

---

## 🚀 Платформы и roadmap

| Платформа                            | Статус      | Что значит                                |
| ------------------------------------ | ----------- | ----------------------------------------- |
| 🌐 **Браузер**                       | ✅ работает | Flutter Web + Firebase                    |
| 📱 **Android**                       | ⏳ тест     | Flutter mobile                            |
| 🍏 **iOS**                           | 📋 план     | Flutter mobile                            |
| 🔊 **Умная колонка на Raspberry Pi** | 📋 план     | Wake word + локальные STT/TTS + умный дом |

**Долгосрочная цель:** Sofi как **физический компаньон** — колонка на Raspberry Pi 5 с микрофоном, динамиком и интеграцией с умным домом (Home Assistant). Подробности — в `ARCHITECTURE.md`.

---

## 🏗️ Архитектура (текущая)

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
│ Node.js Backend │────▶│ OpenRouter │
│ • /chat │ │ • Dots3 (LLM) │
│ • /tts │ │ • Fish Audio │
│ • /health │ └──────────────────┘
│ • 25 модулей │
└─────────┬──────────┘
│
├──▶ Firestore (история, профиль)
└──▶ Python TTS server (5001, Fish Audio + клонирование)

Полная схема + планы Raspberry Pi и умного дома — в [`ARCHITECTURE.md`](ARCHITECTURE.md).

---

## 🧰 Технологии

**Flutter:** Firebase (Auth, Firestore), `http`, `speech_to_text`, `just_audio`, `provider`, `google_fonts`, `flutter_animate`.

**Backend (Node.js):** Express, OpenRouter API (Dots3), 25 модулей личности, web search.

**TTS (Python, Flask):** Fish Audio через OpenRouter, клонирование голоса по образцу.

**LLM:** `dots-studio/dots-3-note-preview:free` (OpenRouter, 280B MoE, хороший русский, free-тариф 50 запросов/день).

---

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
sofi-server/.env
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
```

🎤 Клонирование голоса

1. Запиши образец голоса (10–20 сек чистой речи) → sofi-server/my_voice.wav.

2. Обнови REFERENCE_TEXT в tts_server.py — это точный транскрипт того, что ты сказал в my_voice.wav.

3. Перезапусти tts_server.py — образец загрузится автоматически.

⚠️ Важно: my_voice.wav не коммитится (в .gitignore) — это личные данные.

📁 Структура

sofi/
├── lib/
│ ├── main.dart # auth-роутинг
│ ├── models/
│ │ └── chat_message.dart
│ ├── screens/
│ │ ├── login_screen.dart
│ │ └── chat_screen.dart
│ ├── services/
│ │ ├── ai_service.dart # HTTP к бэкенду
│ │ ├── firestore_memory.dart # история
│ │ ├── voice_service.dart # STT + TTS
│ │ └── search_detector.dart
│ ├── theme/
│ │ └── app_theme.dart
│ └── widgets/
│ ├── message_bubble.dart
│ └── chat_input.dart
└── pubspec.yaml

sofi-server/
├── index.js # /chat, /tts, /health
├── ai.js # OpenRouter + Dots3
├── tts_server.py # Fish Audio + клонирование
├── ai/ # модули личности
├── memory/ # profile.json
├── tools/ # web search
├── prompt/
├── utils/
├── .env # НЕ коммитить
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
Лимит OpenRouter: 50 запросов/день на free-тарифе.

Иногда «Я рядом.» (~10%): включён retry 2×.

Fish Audio free нестабилен: голос может меняться между запросами. Клонирование через input_references фиксирует его, но не всегда на 100%.

Клонирование через OpenRouter — недокументированный сценарий, может сломаться при обновлении API.

📝 Что не трогать
index.js — пост-фильтры (stripCapsPrefixes, fixMyNameAnswer, fixSpacing, fixTruncation).

ai.js — модель dots-3-note-preview:free, max_tokens: 1500, retry 2×.

ai_service.dart — utf8.decode(response.bodyBytes) (иначе русский ломается).

promptRouter.js — formatHistory (последние 10 сообщений).

memory/extractor.js — regex для имени + isJunk.

.env, my_voice.wav — не коммитить.
