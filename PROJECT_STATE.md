# 🐱 SOFI — Project State

> AI-компаньон с характером: личностью, эмоциями, памятью и голосом.
> Скинь этот файл AI-ассистенту — и он продолжит без лишних вопросов.

**Обновлено:** 2026-10-30 (день 5 — OpenRouter + Dots3)

---

## ⚡ Быстрый старт

1. Скинь этот файл AI-ассистенту.
2. Скажи: «продолжаем Sofi, день 6 — [что делаем]».
3. Запусти 3 терминала:

Терминал 1 — Бэкенд:
cd ~/Desktop/sofi/sofi-server && node index.js
→ 🧠 Sofi V8 running + ✅ AI клиент настроен

Терминал 2 — Edge TTS:
cd ~/Desktop/sofi/sofi-server
source ~/Desktop/sofi/.venv/bin/activate
python tts_server.py
→ 🔊 Edge TTS on http://localhost:5001

Терминал 3 — Flutter:
cd ~/Desktop/sofi && flutter run -d chrome

## 🎯 О проекте

**Sofi** — AI-компаньон с памятью, эмоциями, личностью и голосом. Учебный проект.

| Способность | Что значит                                     |
| ----------- | ---------------------------------------------- |
| 🧠 Память   | Имя, факты, история (Firestore + profile.json) |
| 💭 Эмоции   | Реакция на тон (emotionEngine)                 |
| 🎭 Личность | 25 модулей на бэкенде                          |
| 🗣️ Голос    | STT (микрофон) + TTS (Edge TTS)                |
| 🌐 Интернет | Web search (погода, новости)                   |

---

## 🏗️ Архитектура

Flutter App (sofi/)
├── Firebase Auth + Firestore (история)
├── STT (speech_to_text)
└── TTS (just_audio)
│ HTTP
▼
Node.js Backend (sofi-server/)
├── /chat (25 модулей личности)
├── /tts (KittenML — отложено)
├── /health
└── tools/webSearch
│
┌────┴────┐
▼ ▼
OpenRouter Edge TTS (Flask, 5001)
Dots3 280B ru-RU-Svetlana

**Ollama больше не используется** (8 ГБ RAM не тянет локальную LLM).

---

## 🧰 Технологии

**Flutter:** firebase (auth, firestore), http, google_fonts (Inter), flutter_animate, speech_to_text, just_audio.

**Node.js:** Express, CORS, OpenRouter API, Edge TTS (Flask), @agent-sh/harness-websearch, 25 модулей личности.

**LLM:** `dots-studio/dots-3-note-preview:free` (OpenRouter, 280B MoE, отличный русский). Лимит free: 50/день.

---

## ✅ Что работает

| Фича                       | Статус                          |
| -------------------------- | ------------------------------- |
| Авторизация email/password | ✅                              |
| Чат + история в Firestore  | ✅                              |
| Память: имя, факты         | ✅ «Тебя зовут Денис»           |
| Контекст (10 сообщений)    | ✅                              |
| Web search                 | ✅ «+10°, 88%, 749 мм»          |
| STT (микрофон)             | ✅ (проверен ранее)             |
| TTS (Edge TTS)             | ⏳ не проверено после смены LLM |
| Тёмная тема, анимации      | ✅                              |
| Пост-фильтры ответа        | ✅                              |
| Скорость                   | ✅ 3–5 сек                      |

**5/5 тестов прошли:** привет / имя / спасибо / погода / контекст.

---

## 🟡 Проблемы

| Проблема                       | Решение                                   |
| ------------------------------ | ----------------------------------------- |
| Иногда «Я рядом.» (~10%)       | Retry 2× включён; альтернатива — Cerebras |
| Лимит 50/день OpenRouter       | Хватит на демо; ждать сутки               |
| Dots3 рвёт кириллицу           | Редко; пост-фильтры ловят                 |
| Клонирование голоса с акцентом | Отложено (KittenML)                       |
| Эмодзи на web                  | Убрали 👋 из приветствия                  |

---

## 📁 Структура

sofi/
├── lib/
│ ├── main.dart
│ ├── models/chat_message.dart
│ ├── screens/{login,chat}\_screen.dart
│ ├── services/{ai_service,firestore_memory,voice_service,search_detector}.dart
│ ├── theme/app_theme.dart
│ └── widgets/{message_bubble,chat_input}.dart
└── pubspec.yaml

sofi-server/
├── index.js # /chat, /tts, /health + пост-фильтры
├── ai.js # OpenRouter + Dots3 + retry
├── tts_server.py # Edge TTS (Flask, 5001)
├── ai/ # 10 модулей личности
├── memory/ # profileManager, extractor, profile.json
├── tools/ # webSearch, shouldSearch
├── prompt/promptRouter.js
├── utils/finalConsistency.js
├── .env # НЕ коммитить!
└── package.json

---

## 🔑 Ключевые настройки

**`.env` в sofi-server/** (НЕ коммитить):
OPENROUTER_API_KEY=sk-or-v1-...
KITTENML_API_KEY=...

**ai.js:**

model: "dots-studio/dots-3-note-preview:free"
max_tokens: 1500
temperature: 0.7

**Таймауты:** index.js — 90s, ai_service.dart — 90s.

**Firestore Rules:**

rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
match /users/{userId}/{document=\*\*} {
allow read, write: if request.auth != null && request.auth.uid == userId;
}
}
}

---

## 🧪 Проверка

````bash
curl http://localhost:3000/health
# {"ok":true,...}

curl -X POST http://localhost:3000/chat -H "Content-Type: application/json" \
  -d '{"message":"Привет","userId":"test"}'
# {"reply":"Привет! Как ты сегодня?"} за 3-5 сек

curl -X POST http://localhost:3000/chat -H "Content-Type: application/json" \
  -d '{"message":"Погода в Минске?","userId":"test"}'
# {"reply":"... +10°, 88% ..."}


User asks if that's all - they only see the "Быстрый старт" block. The full text didn't come through. Need to give it in chunks.

Let me break it into 3-4 parts so nothing gets lost.

Нет, это только первая часть. Видимо, длинный текст обрезается. Даю по частям — скопируй и вставь по очереди.

📄 Часть 1 из 4 — заголовок и быстрый старт
markdown
# 🐱 SOFI — Project State

> AI-компаньон с характером: личностью, эмоциями, памятью и голосом.
> Скинь этот файл AI-ассистенту — и он продолжит без лишних вопросов.

**Обновлено:** 2026-10-30 (день 5 — OpenRouter + Dots3)

---

## ⚡ Быстрый старт

1. Скинь этот файл AI-ассистенту.
2. Скажи: «продолжаем Sofi, день 6 — [что делаем]».
3. Запусти 3 терминала:
Терминал 1 — Бэкенд:
cd ~/Desktop/sofi/sofi-server && node index.js
→ 🧠 Sofi V8 running + ✅ AI клиент настроен

Терминал 2 — Edge TTS:
cd ~/Desktop/sofi/sofi-server
source ~/Desktop/sofi/.venv/bin/activate
python tts_server.py
→ 🔊 Edge TTS on http://localhost:5001

Терминал 3 — Flutter:
cd ~/Desktop/sofi && flutter run -d chrome

text
📄 Часть 2 из 4 — о проекте и архитектура
markdown
---

## 🎯 О проекте

**Sofi** — AI-компаньон с памятью, эмоциями, личностью и голосом. Учебный проект.

| Способность | Что значит |
|---|---|
| 🧠 Память | Имя, факты, история (Firestore + profile.json) |
| 💭 Эмоции | Реакция на тон (emotionEngine) |
| 🎭 Личность | 25 модулей на бэкенде |
| 🗣️ Голос | STT (микрофон) + TTS (Edge TTS) |
| 🌐 Интернет | Web search (погода, новости) |

---

## 🏗️ Архитектура
Flutter App (sofi/)
├── Firebase Auth + Firestore (история)
├── STT (speech_to_text)
└── TTS (just_audio)
│ HTTP
▼
Node.js Backend (sofi-server/)
├── /chat (25 модулей личности)
├── /tts (KittenML — отложено)
├── /health
└── tools/webSearch
│
┌────┴────┐
▼ ▼
OpenRouter Edge TTS (Flask, 5001)
Dots3 280B ru-RU-Svetlana

text

**Ollama больше не используется** (8 ГБ RAM не тянет локальную LLM).
📄 Часть 3 из 4 — технологии, что работает, проблемы
markdown
---

## 🧰 Технологии

**Flutter:** firebase (auth, firestore), http, google_fonts (Inter), flutter_animate, speech_to_text, just_audio.

**Node.js:** Express, CORS, OpenRouter API, Edge TTS (Flask), @agent-sh/harness-websearch, 25 модулей личности.

**LLM:** `dots-studio/dots-3-note-preview:free` (OpenRouter, 280B MoE, отличный русский). Лимит free: 50/день.

---

## ✅ Что работает

| Фича | Статус |
|---|---|
| Авторизация email/password | ✅ |
| Чат + история в Firestore | ✅ |
| Память: имя, факты | ✅ «Тебя зовут Денис» |
| Контекст (10 сообщений) | ✅ |
| Web search | ✅ «+10°, 88%, 749 мм» |
| STT (микрофон) | ✅ (проверен ранее) |
| TTS (Edge TTS) | ⏳ не проверено после смены LLM |
| Тёмная тема, анимации | ✅ |
| Пост-фильтры ответа | ✅ |
| Скорость | ✅ 3–5 сек |

**5/5 тестов прошли:** привет / имя / спасибо / погода / контекст.

---

## 🟡 Проблемы

| Проблема | Решение |
|---|---|
| Иногда «Я рядом.» (~10%) | Retry 2× включён; альтернатива — Cerebras |
| Лимит 50/день OpenRouter | Хватит на демо; ждать сутки |
| Dots3 рвёт кириллицу | Редко; пост-фильтры ловят |
| Клонирование голоса с акцентом | Отложено (KittenML) |
| Эмодзи на web | Убрали 👋 из приветствия |
📄 Часть 4 из 4 — структура, настройки, roadmap
markdown
---

## 📁 Структура
sofi/
├── lib/
│ ├── main.dart
│ ├── models/chat_message.dart
│ ├── screens/{login,chat}_screen.dart
│ ├── services/{ai_service,firestore_memory,voice_service,search_detector}.dart
│ ├── theme/app_theme.dart
│ └── widgets/{message_bubble,chat_input}.dart
└── pubspec.yaml

sofi-server/
├── index.js # /chat, /tts, /health + пост-фильтры
├── ai.js # OpenRouter + Dots3 + retry
├── tts_server.py # Edge TTS (Flask, 5001)
├── ai/ # 10 модулей личности
├── memory/ # profileManager, extractor, profile.json
├── tools/ # webSearch, shouldSearch
├── prompt/promptRouter.js
├── utils/finalConsistency.js
├── .env # НЕ коммитить!
└── package.json

text

---

## 🔑 Ключевые настройки

**`.env` в sofi-server/** (НЕ коммитить):
OPENROUTER_API_KEY=sk-or-v1-...
KITTENML_API_KEY=...

text

**ai.js:**
model: "dots-studio/dots-3-note-preview:free"
max_tokens: 1500
temperature: 0.6

text

**Таймауты:** index.js — 90s, ai_service.dart — 90s.

**Firestore Rules:**
rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
match /users/{userId}/{document=**} {
allow read, write: if request.auth != null && request.auth.uid == userId;
}
}
}

text

---

## 🧪 Проверка

```bash
curl http://localhost:3000/health
# {"ok":true,...}

curl -X POST http://localhost:3000/chat -H "Content-Type: application/json" \
  -d '{"message":"Привет","userId":"test"}'
# {"reply":"Привет! Как ты сегодня?"} за 3-5 сек

curl -X POST http://localhost:3000/chat -H "Content-Type: application/json" \
  -d '{"message":"Погода в Минске?","userId":"test"}'
# {"reply":"... +10°, 88% ..."}
🎯 Осталось
День 6 (приоритет):

□ Проверить TTS (Edge TTS на 5001 + 🔊 в Chrome)
□ Проверить STT (микрофон)
□ Проверить автоозвучку (🔊 в AppBar)
К защите:

□ README.md (финал)
□ ARCHITECTURE.md (Mermaid + 25 модулей)
□ Презентация 10–15 слайдов
□ Ответ про этику клонирования голоса
Опционально:

□ Provider вместо setState
□ Тест на Android
□ Деплой (Railway)

🗓️ История
День	Главное
1–2	Flutter UI + Firebase + Ollama (qwen2.5:3b)
3	Edge TTS вместо KittenML, STT
4	Память профиля, qwen2.5:3b
5	OpenRouter + Dots3 — умно, 3–5 сек

⚠️ Что НЕ трогать
index.js — пост-фильтры (stripCapsPrefixes, fixMyNameAnswer, fixSpacing, fixTruncation)

ai.js — модель dots-3-note-preview:free, max_tokens 1500, retry 2×

ai_service.dart — utf8.decode(response.bodyBytes) (иначе русский ломается)

promptRouter.js — formatHistory (последние 10 сообщений)

memory/extractor.js — regex для имени + isJunk

.env — НЕ коммитить

💭 Для защиты (потолок)
8 ГБ RAM → локальная LLM невозможна. OpenRouter free — компромисс: умно, но 50/день и ~10% «Я рядом.»

Клонирование голоса — работает, но акцент. В продакшене → ElevenLabs.

Продакшен → платный API (OpenAI/Groq) или GPU.


## 📋 Как собрать файл

1. Открой `sofi/PROJECT_STATE.md`.
2. `Cmd+A` → `Backspace` (удалить старое).
3. Вставь **Часть 1** → Enter → **Часть 2** → Enter → **Часть 3** → Enter → **Часть 4**.
4. `Cmd+S` (сохранить).
5. Проверь:
   ```bash
   cd ~/Desktop/sofi
   wc -l PROJECT_STATE.md
````
