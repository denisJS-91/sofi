# SOFI — Project State (снимок на 2026-10-26)

> Этот файл — «память» проекта. При возобновлении работы скинь его AI-ассистенту,
> чтобы он понял, где мы остановились.

## 🎯 Что за проект

**Sofi** — AI-ассистент с характером (личностью, эмоциями, памятью).
«AI-компаньон с долговременной памятью».

## 🏗️ Архитектура (3 слоя)

Flutter App (sofi/) ──► Node.js Backend (sofi-server/) ──► Ollama (llama3.2:3b)
│ │
├─► Firebase Auth ├─► SOFI_CORE (личность, эмоции, состояние)
├─► Firestore messages └─► memory.json (персистентная память)
└─► Firestore profile


## 🧰 Технологии

**Flutter:**
- Firebase (Auth, Firestore)
- http, provider, google_fonts, flutter_animate
- speech_to_text, flutter_tts (подключены, но НЕ используются)
- record, just_audio (подключены, не используются)

**Backend (Node.js / Express):**
- Ollama локально (модель `llama3.2:3b` на `127.0.0.1:11434`)
- ~25 модулей личности (intent, emotion, state, personality, memory, identity)
- memory.json — персистентное состояние

## ✅ ЧТО РАБОТАЕТ (проверено)

| Фича | Статус |
|---|---|
| Firebase Auth (email/password) | ✅ |
| Роутинг login ↔ chat | ✅ |
| Чат с бэкендом | ✅ (curl 5.68 сек) |
| Firestore: запись сообщений | ✅ (`users/{uid}/messages/`) |
| Firestore: чтение истории | ✅ |
| Firestore Rules | ✅ настроены (`request.auth.uid == userId`) |
| CORS | ✅ работает |
| Ошибки в SnackBar | ✅ |
| Platform-aware `baseUrl` (web/macOS/Android) | ✅ |
| Таймаут на Flutter (40 сек) | ✅ |
| Таймаут на бэкенде (50 сек, `Promise.race`) | ✅ |
| Warmup модели при старте | ✅ |
| `languageLock` в промпте (только русский) | ✅ |
| Блокировка `sendMessage` при `isLoading` | ✅ |
| Автоскролл вниз | ✅ |
| Logout в AppBar | ✅ |
| Модель `ChatMessage` с `Timestamp` | ✅ |

## 🟡 ИЗВЕСТНЫЕ ПРОБЛЕМЫ (не критичные)

| Проблема | Причина | Решение |
|---|---|---|
| Sofi не называет себя на «Как звать?» | llama3.2:3b слабо держит роль | усилить промпт ИЛИ сменить модель на `qwen2.5:3b` |
| Плохо понимает опечатки («как твоию») | маленькая модель | то же |
| Не хватает эмодзи на web | Noto fonts | убрать 👋 из приветствия (проще) |
| Xcode не установлен | — | не нужно, для Android/Web достаточно |
| Android эмулятор `offline` | не догрузился | Cold Boot / Wipe Data / новый AVD |

## 📁 Структура проекта

sofi/ ← Flutter-приложение
├── lib/
│ ├── main.dart ← auth-роутинг
│ ├── firebase_options.dart ← сгенерирован flutterfire
│ ├── models/
│ │ └── chat_message.dart ← модель с Timestamp
│ ├── screens/
│ │ ├── login_screen.dart ← email/password
│ │ └── chat_screen.dart ← чат с историей, автоскроллом, logout
│ ├── services/
│ │ ├── ai_service.dart ← HTTP + Firestore + platform URL
│ │ ├── firestore_memory.dart ← messages save/load
│ │ └── memory_service.dart ← profile (пока не используется)
│ ├── theme/ ← ПУСТО (на будущее)
│ └── widgets/ ← ПУСТО (на будущее)
├── assets/
│ ├── images/
│ └── icons/
├── pubspec.yaml
└── PROJECT_STATE.md ← этот файл

sofi-server/ ← Node.js бэкенд
├── index.js ← /health + /chat
├── ai.js ← Ollama + languageLock + warmup
├── ai/ ← 10 модулей личности
├── core/sofiCore.js
├── emotion/
├── intent/
├── memory/
├── prompt/
├── utils/
├── memory.json ← состояние
└── package.json


## 🚀 КАК ЗАПУСТИТЬ (три терминала)

### Терминал 1 — Ollama

```bash
ollama serve
# (если уже работает в фоне — не нужно)

Терминал 2 — бэкенд

cd ~/путь/до/sofi-server
node index.js
# Ожидаемо:
# 🧠 Sofi V8 running on http://localhost:3000
# 🔥 Warming up model...
# ✅ Model ready in 7.5s

Терминал 3 — Flutter

cd ~/путь/до/sofi
flutter run -d chrome          # для web
flutter run -d emulator-5554   # для Android-эмулятора
flutter run -d <device-id>     # для телефона

🔧 Ключевые URL / настройки
Ollama: http://127.0.0.1:11434/api/generate

Модель: llama3.2:3b (в ai.js)

Бэкенд: http://localhost:3000

Healthcheck: http://localhost:3000/health

Firebase проект: sofi-ce584

baseUrl в ai_service.dart:

Web: http://localhost:3000

Android эмулятор: http://10.0.2.2:3000

Физический телефон: http://<IP-Mac>:3000

📋 Firestore Rules (действующие)

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

🎯 ЧТО ОСТАЛОСЬ (roadmap)

Этап A — Качество ответов (15 мин) 🔥
□ Усилить промпт в prompt/promptRouter.js или prompt/sofiLock.js
«Тебя зовут Sofi. Если спрашивают имя — отвечай Sofi»

«Помни контекст диалога»

«Отвечай кратко (1-3 предложения)»

□ ИЛИ сменить модель: ollama pull qwen2.5:3b, MODEL = "qwen2.5:3b" в ai.js

Этап B — Голос (1–2 часа) 🔥
□ STT: кнопка микрофона → speech_to_text → текст в поле ввода
□ TTS: кнопка «озвучить» на сообщении Sofi → flutter_tts
□ Разрешения: microphone в Info.plist (iOS), RECORD_AUDIO (Android)

Этап C — UI-полировка (1–2 часа)
□ google_fonts — подключить кастомный шрифт
□ flutter_animate — анимация появления пузырей
□ flutter_svg — иконки
□ Вынести цвета/тему в theme/
□ Разбить ChatScreen на widgets/MessageBubble, ChatInput
□ Убрать 👋 из приветствия (если эмодзи не работают)

Этап D — Документация к защите (1–2 часа) 🔥
□ README.md — описание, архитектура, скриншоты
□ Диаграмма архитектуры (draw.io / Mermaid)
□ Презентация (10–15 слайдов)
□ Описание модулей личности бэкенда
□ Список литературы / источников

Этап E — Provider (опционально)
□ Вынести List<ChatMessage> + isLoading в ChatProvider
□ Заменить setState на notifyListeners()

🧪 Как проверить, что всё работает

# 1. Бэкенд
curl http://localhost:3000/health
# {"ok":true,"name":"sofi","v":8}

# 2. Чат
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"привет","userId":"test123"}'
# {"reply":"..."} за 1-5 сек

# 3. В Chrome — отправить «привет», смотреть в терминал flutter:
# ▶️ sendMessage
# ✅ User message saved
# 🌐 POST ...
# 📡 status: 200
# 📡 body: {"reply":"..."}
# ✅ AI reply saved