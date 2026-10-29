# 🐱 SOFI — Project State

> **AI-компаньон с характером**: личностью, эмоциями, памятью и голосом.
> Этот файл — «память» проекта. При возобновлении работы скинь его AI-ассистенту,
> чтобы он понял контекст и продолжил без лишних вопросов.

**Последнее обновление:** 2026-10-27 (день 2)

---

## 📖 Оглавление

1. [О проекте](#-о-проекте)
2. [Архитектура](#-архитектура)
3. [Технологии](#-технологии)
4. [Что работает](#-что-работает)
5. [Известные проблемы](#-известные-проблемы)
6. [Структура проекта](#-структура-проекта)
7. [Как запустить](#-как-запустить)
8. [Ключевые настройки](#-ключевые-настройки)
9. [История разработки](#-история-разработки)
10. [Что осталось](#-что-осталось-roadmap)
11. [Как проверить](#-как-проверить-что-всё-работает)
12. [Чек-лист перед сессией](#-чек-лист-перед-сессией)

---

## 🎯 О проекте

**Sofi** — не «обёртка над ChatGPT», а попытка создать **AI-компаньона**, у которого есть:

| Способность     | Что это значит                                                 |
| --------------- | -------------------------------------------------------------- |
| 🧠 **Память**   | Помнит прошлые разговоры (Firestore + `memory.json`)           |
| 💭 **Эмоции**   | Реагирует на тон и контекст диалога                            |
| 🎭 **Личность** | Стабильный характер, не «съезжает» от сообщения к сообщению    |
| 🗣️ **Голос**    | Распознавание речи (STT) + озвучка (TTS) + клонирование голоса |

**Формат:** учебный/курсовой проект. Цель — показать архитектуру AI-компаньона.

---

## 🏗️ Архитектура

Три слоя, каждый со своей зоной ответственности:
┌─────────────────────────────────────────────────────────────┐
│ Flutter App (sofi/) │
│ ├── Firebase Auth — вход/регистрация │
│ ├── Firestore messages — история чата │
│ ├── Firestore profile — факты о пользователе │
│ ├── STT (speech_to_text) — голосовой ввод │
│ └── TTS (just_audio) — воспроизведение озвучки │
└────────────────────────────┬────────────────────────────────┘
│ HTTP
▼
┌─────────────────────────────────────────────────────────────┐
│ Node.js Backend (sofi-server/) │
│ ├── /chat — основной эндпоинт диалога │
│ ├── /tts — прокси к KittenML TTS API │
│ ├── /health — healthcheck │
│ └── 25 модулей личности: │
│ intent → emotion → state → personality → prompt │
│ → identity lock → AI → drift monitor → memory │
└────────────────────────────┬────────────────────────────────┘
│
┌────────────┴────────────┐
▼ ▼
┌───────────────────────┐ ┌──────────────────────────┐
│ Ollama (локально) │ │ KittenML API (облако) │
│ llama3.2:3b │ │ TTS + клонирование │
│ 127.0.0.1:11434 │ │ api.kittenml.com │
└───────────────────────┘ └──────────────────────────┘

---

## 🧰 Технологии

### Flutter (клиент)

| Пакет                                               | Для чего                                                  |
| --------------------------------------------------- | --------------------------------------------------------- |
| `firebase_core`, `firebase_auth`, `cloud_firestore` | Auth + БД                                                 |
| `http`                                              | HTTP-запросы к бэкенду                                    |
| `provider`                                          | Управление состоянием _(подключён, пока не используется)_ |
| `google_fonts`                                      | Шрифт Inter                                               |
| `flutter_animate`                                   | Анимации пузырей                                          |
| `speech_to_text`                                    | STT (микрофон)                                            |
| `just_audio`                                        | Воспроизведение MP3 от KittenML                           |
| `flutter_tts`                                       | _(подключён, не используется — заменён на KittenML)_      |

### Node.js (бэкенд)

- **Express** — HTTP-сервер
- **Ollama** локально — модель `llama3.2:3b` на `127.0.0.1:11434`
- **KittenML API** — облачный TTS с клонированием голоса
- **~25 модулей личности** — intent, emotion, state, personality, memory, identity
- **`memory.json`** — персистентное состояние пользователей

---

## ✅ Что работает

### Клиент (Flutter)

| Фича                                          | Статус            |
| --------------------------------------------- | ----------------- |
| Регистрация/вход (email/password)             | ✅                |
| Роутинг login ↔ chat по `authStateChanges`    | ✅                |
| Чат с бэкендом (HTTP)                         | ✅ ~5 сек ответ   |
| История в Firestore (`users/{uid}/messages/`) | ✅ пишет + читает |
| Firestore Rules (только свой uid)             | ✅                |
| Platform-aware `baseUrl` (web/Android/iOS)    | ✅                |
| Автоскролл вниз                               | ✅                |
| Блокировка send при `isLoading`               | ✅                |
| Logout в AppBar                               | ✅                |
| Тёмная тема + шрифт Inter                     | ✅                |
| Анимированные пузыри (Telegram-style)         | ✅                |
| STT — микрофон 🎤                             | ✅                |
| TTS — озвучка 🔊                              | ✅                |
| Автоозвучка ответов (🔊 в AppBar)             | ✅                |

### Бэкенд (Node.js)

| Фича                                       | Статус                 |
| ------------------------------------------ | ---------------------- |
| `/health`                                  | ✅                     |
| `/chat` с 25 модулями личности             | ✅                     |
| `/tts` (прокси к KittenML)                 | ✅                     |
| Таймаут 50 сек на `/chat` (`Promise.race`) | ✅                     |
| Warmup модели при старте                   | ✅                     |
| `languageLock` — только русский, роль Sofi | ✅                     |
| CORS                                       | ✅                     |
| Модель `llama3.2:3b` (вместо mistral:7b)   | ✅                     |
| Клонирование голоса через KittenML         | ✅ технически работает |

---

## 🟡 Известные проблемы

| Проблема                             | Причина                           | Решение                                      |
| ------------------------------------ | --------------------------------- | -------------------------------------------- |
| Клонированный голос «ломает» русский | KittenML — англоцентричная модель | Перезаписать образец / Fish Audio / оставить |
| TTS «ломается» на длинных фразах     | Маленькая модель                  | Обрезать текст до ~200 символов              |
| Эмодзи не работают на web            | Noto fonts не подключён           | Убрали 👋 из приветствия                     |
| Xcode не установлен                  | —                                 | Для web/Android не нужен                     |
| Android-эмулятор `offline`           | Cold Boot / Wipe Data             | Пересоздать AVD с API 34                     |

---

## 📁 Структура проекта

sofi/ ← Flutter-приложение
├── lib/
│ ├── main.dart ← auth-роутинг
│ ├── firebase_options.dart ← сгенерирован flutterfire
│ ├── models/
│ │ └── chat_message.dart ← модель с Timestamp
│ ├── screens/
│ │ ├── login_screen.dart ← email/password
│ │ └── chat_screen.dart ← чат + автоскролл + logout
│ ├── services/
│ │ ├── ai_service.dart ← HTTP к бэкенду + Firestore
│ │ ├── firestore_memory.dart ← save/load сообщений
│ │ ├── memory_service.dart ← profile (не используется)
│ │ └── voice_service.dart ← STT + TTS + клонирование
│ ├── theme/
│ │ └── app_theme.dart ← тёмная тема + Inter
│ └── widgets/
│ ├── message_bubble.dart ← пузырь с анимацией
│ └── chat_input.dart ← поле ввода + 🎤
├── assets/
│ ├── images/
│ └── icons/
├── pubspec.yaml
└── PROJECT_STATE.md ← этот файл

sofi-server/ ← Node.js бэкенд
├── index.js ← /health + /chat + /tts
├── ai.js ← Ollama + languageLock + warmup
├── ai/ ← 10 модулей личности
├── core/sofiCore.js
├── emotion/
├── intent/
├── memory/
├── prompt/
├── utils/
├── memory.json ← состояние (НЕ коммитить!)
├── .env ← KITTENML_API_KEY (НЕ коммитить!)
└── package.json

---

### 🗓️ День 3 — 2026-10-29

**TTS без акцента (этап 1):**

- [x] Отказались от KittenML для повседневного голоса (акцент)
- [x] Переключили `voice_service.dart` на Edge TTS (`localhost:5001`)
- [x] Голос: `ru-RU-SvetlanaNeural` (pitch=+35Hz, rate=+15%)
- [x] Flask-сервер `tts_server.py` в venv (`sofi-server/venv/`)
- [x] CORS-фикс: явные заголовки + `@app.after_request` + обработка OPTIONS
- [x] Зависимости: `pip install flask flask-cors edge-tts` (в venv)

**KittenML (клонирование) — отложено:**

- [x] Технически работало, но русский с акцентом — модель англоцентрична
- [x] Оставлено «на будущее» в бэкенде (`/tts` на порту 3000)

**Известные проблемы:**
| Проблема | Причина | Решение |
|---|---|---|
| `No module named 'flask'` | Homebrew Python (PEP 668) | venv в `sofi-server/venv/` |
| CORS preflight без POST | не хватало `Access-Control-Allow-Methods` | явный CORS + `after_request` |

**Как запустить Flask (новый терминал):**

````bash
cd ~/Desktop/sofi/sofi-server
source venv/bin/activate
python tts_server.py
# → 🔊 Edge TTS on http://localhost:5001

## 🚀 Как запустить

Нужны **три терминала** (Ollama может работать в фоне).

### Терминал 1 — Ollama

```bash
ollama serve
# (если уже работает в фоне — не нужно)

Терминал 2 — бэкенд

cd ~/Desktop/sofi/sofi-server
node index.js

Ожидаемый вывод:

🧠 Sofi V8 running on http://localhost:3000
🔥 Warming up model...
✅ Model ready in 7.5s

Терминал 3 — Flutter

cd ~/Desktop/sofi
flutter run -d chrome          # для web
flutter run -d emulator-5554   # для Android-эмулятора
flutter run -d <device-id>     # для физического телефона

Firestore Rules (действующие)

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

````
