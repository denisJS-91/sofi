# 🐱 SOFI — Project State

> AI-компаньон для общения, поддержки и помощи. Память, личность, клонированный голос.
> Скинь этот файл AI-ассистенту — и он продолжит без лишних вопросов.

**Обновлено:** 2026-11-03 (день 8 — repositioning + ARCHITECTURE.md)

---

## ⚡ Быстрый старт

1. Скинь этот файл AI-ассистенту.
2. Скажи: «продолжаем Sofi, день 9 — [что делаем]».
3. Запусти 3 терминала:

**Терминал 1 — Бэкенд:**

```bash
cd ~/Desktop/sofi/sofi-server && node index.js
# → 🧠 Sofi V8 running on http://localhost:3000

**Терминал 2 — TTS:**

cd ~/Desktop/sofi/sofi-server
source ~/Desktop/sofi/.venv/bin/activate
python tts_server.py
# → 🔊 Fish Audio TTS on http://localhost:5001

**Терминал 3 — Flutter:**

cd ~/Desktop/sofi && flutter run -d chrome

```

🎯 О проекте

```mermaid
Sofi — AI-компаньон с памятью, эмоциями, личностью и голосом. Не чат-бот.

Способность                           Что значит

1. 🧠 Память                              Имя, факты, история (Firestore + profile.json)
2. 💭 Эмоции                              Реакция на тон (emotionEngine)
3. 🎭 Личность                            25 модулей на бэкенде
4. 🗣️ Голос                               STT + TTS (Fish Audio, клонирование)
5. 🌐 Интернет                            Web search (погода, новости)
6. 🌱 Развитие                            Подстраивается под пользователя со временем
```

👥 Для кого

Трек 1 — одиночество и поддержка (основной):

1. Пожилые люди, живущие одни

2. Remote-работники без живого общения

3. Люди после переезда, потери близких, в изоляции

Трек 2 — развитие речи и обучение:

1. Дети с задержкой речи (упражнения, повторение)

2. Изучающие иностранный (разговорная практика)

3. Пожилые — когнитивные тренировки

4. Ключевой принцип: Sofi не заменяет живое общение — она помогает его не терять. Подробнее — в ARCHITECTURE.md, раздел «Этика».

🌐 Платформы и roadmap

```mermaid

Платформа                     Статус                            Что значит

1. 🌐 Браузер                 ✅ работает                        Flutter Web + Firebase
2. 📱 Android                 ⏳ тест                            Flutter mobile
3. 🍏 iOS                     📋 план                            Flutter mobile
4. 🔊 Raspberry Pi            📋 план                            Wake word + локальные STT/TTS + умный дом

Долгосрочная цель: Sofi как физический компаньон — колонка на Pi 5 с микрофоном, динамиком и умным домом (Home Assistant). Детали — в ARCHITECTURE.md, раздел 5.
```

🏗️ Архитектура

Flutter App (sofi/)
├── Firebase Auth + Firestore (история)
├── STT (speech_to_text)
└── TTS (just_audio)
│ HTTP
▼
Node.js Backend (sofi-server/)
├── /chat (25 модулей личности)
├── /tts (Fish Audio через Flask, 5001)
├── /health
└── tools/webSearch
│
┌────┴────┐
▼ ▼
OpenRouter Fish Audio (Flask, 5001)
Dots3 280B клонирование голоса

Ollama больше не используется (8 ГБ RAM не тянет локальную LLM). Полная схема + планы Pi/умного дома — в ARCHITECTURE.md.

🧰 Технологии

Flutter: firebase (auth, firestore), http, google_fonts (Inter), flutter_animate, speech_to_text, just_audio, provider.

Node.js: Express, CORS, OpenRouter API, 25 модулей личности, @agent-sh/harness-websearch.

Python (TTS): Flask, Fish Audio через OpenRouter, клонирование по образцу.

LLM: dots-studio/dots-3-note-preview:free (OpenRouter, 280B MoE, хороший русский). Free-лимит: 50/день.

✅ Что работает

```mermaid

Фича                                           Статус

1.Авторизация email/password                   ✅
2.Чат + история в Firestore                    ✅
3.Память: имя, факты                           ✅«Тебя зовут Денис»
4.Контекст (10 сообщений)                      ✅
5.Web search                                   ✅«+10°, 88%, 749 мм»
6.STT (микрофон)                               ✅
7.TTS (Fish Audio, клонирование)               ✅
8.Автоозвучка (🔊 в AppBar)                    ✅
9.Голосовой цикл замкнут                       ✅ 🎤→текст→чат→🔊
10.Длинные ответы (300→2000)                   ✅
11.Новый чат ➕ + приветствие                  ✅
12.Обработка ошибок в UI (5 типов)             ✅
13.Тёмная тема, анимации                       ✅
14.Пост-фильтры ответа                         ✅
15.Скорость                                    ✅ 3–5 сек

5/5 тестов прошли: привет / имя / спасибо / погода / контекст.
```

🟡 Проблемы

```mermaid

Проблема                                   Решение

1. Иногда «Я рядом.» (~10%)                Retry 2× включён; альтернатива — Cerebras
2. Лимит 50/день OpenRouter                Хватит на демо; ждать сутки
3. Dots3 рвёт кириллицу                    Редко; пост-фильтры ловят
4. Клонирование голоса с акцентом          Отложено (KittenML)
5. Эмодзи на web                           Убрали 👋 из приветствия
```

📁 Структура

sofi/
├── lib/
│ ├── main.dart
│ ├── models/chat_message.dart
│ ├── screens/{login,chat}\_screen.dart
│ ├── services/{ai_service,firestore_memory,voice_service,search_detector}.dart
│ ├── theme/app_theme.dart
│ └── widgets/{message_bubble,chat_input}.dart
├── assets/images/{logo,logo_chat}.png
├── README.md ← переписан под AI-компаньона
├── ARCHITECTURE.md ← создан (Pi, умный дом, этика, 25 модулей)
└── pubspec.yaml

sofi-server/
├── index.js # /chat, /tts, /health + пост-фильтры
├── ai.js # OpenRouter + Dots3 + retry
├── tts_server.py # Fish Audio (Flask, 5001)
├── ai/ # 10 модулей личности
├── memory/ # profileManager, extractor, profile.json
├── tools/ # webSearch, shouldSearch
├── prompt/promptRouter.js
├── utils/finalConsistency.js
├── my_voice.wav # НЕ коммитить!
├── .env # НЕ коммитить!
└── package.json

🔑 Ключевые настройки

.env в sofi-server/ (НЕ коммитить):

OPENROUTER_API_KEY=sk-or-v1-...
KITTENML_API_KEY=...

ai.js:

model: "dots-studio/dots-3-note-preview:free"
max_tokens: 3000
temperature: 0.6

Таймауты: index.js — 90s, ai_service.dart — 90s.

rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
match /users/{userId}/{document=\*\*} {
allow read, write: if request.auth != null && request.auth.uid == userId;
}
}
}

🧪 Проверка

curl http://localhost:3000/health

# {"ok":true,...}

curl -X POST http://localhost:3000/chat -H "Content-Type: application/json" \
 -d '{"message":"Привет","userId":"test"}'

# {"reply":"Привет! Как ты сегодня?"} за 3-5 сек

curl -X POST http://localhost:3000/chat -H "Content-Type: application/json" \
 -d '{"message":"Погода в Минске?","userId":"test"}'

# {"reply":"... +10°, 88% ..."}

curl -X POST http://localhost:5001/tts -H "Content-Type: application/json" \
 -d '{"text":"Привет! Я Софи."}' --output test.mp3

🎯 Осталось

□ Обновить PROJECT_STATE.md → готово (2026-11-03)
□ Настройки (голос, тема, профиль)
□ Деплой (Railway для бэкенда, Firebase Hosting для фронта)
К будущему (не срочно):

□ Профили: Companion / Tutor / Speech
□ Raspberry Pi: wake word + локальные STT/TTS
□ Умный дом: Home Assistant + Zigbee/Matter
□ Продакшен LLM: платный API (Groq/Cerebras) или GPU
□ Клонирование: ElevenLabs вместо Fish Audio free

Опционально:

□ Provider вместо setState
□ Стриминг ответов (token-by-token)

🗓️ История

```mermaid

День                              Главное

1–2                               Flutter UI + Firebase + Ollama (qwen2.5:3b)
3                                 Edge TTS, STT
4                                 Память профиля, qwen2.5:3b
5                                 OpenRouter + Dots3 — умно, 3–5 сек
6                                 TTS клонирование (Fish Audio), STT, автоозвучка
7                                 Длинные ответы, эмоции, рефлексия, UI-редизайн
8                                 README + ARCHITECTURE, repositioning как AI-компаньон
9                                 🎨 Брендинг - [x] Своя иконка через `flutter_launcher_icons`
```

⚠️ Что НЕ трогать

index.js — пост-фильтры (stripCapsPrefixes, fixMyNameAnswer, fixSpacing, fixTruncation)

ai.js — модель dots-3-note-preview:free, max_tokens: 3000, retry 2×

ai_service.dart — utf8.decode(response.bodyBytes) (иначе русский ломается)

promptRouter.js — formatHistory (последние 10 сообщений)

memory/extractor.js — regex для имени + isJunk

.env, my_voice.wav — НЕ коммитить

💭 Видение (куда идём)

Sofi — не «учебный проект». Это этичный AI-компаньон для реальных людей:

1.Web → Android → iOS — на всех устройствах пользователя

2.Raspberry Pi — физический компаньон с голосом и умным домом

3.Профили — Companion / Tutor / Speech под разные аудитории

4.Приватность by design — личное локально, в облако только LLM + search

5.Не-зависимость — поощряет живое общение, не заменяет его

Подробно — в README.md (видение) и ARCHITECTURE.md (технические планы, этика).

🧪 Что проверить при следующем запуске

□ node index.js запущен?
□ tts_server.py запущен?
□ flutter run -d chrome?
□ curl /health → {"ok":true}?
□ Чат отвечает за 3-5 сек?
□ Голос озвучивает ответ?

Если что-то не работает — см. ARCHITECTURE.md (диагностика) или спроси AI-ассистента.

