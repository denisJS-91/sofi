# sofi

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Learn Flutter](https://docs.flutter.dev/get-started/learn-flutter)
- [Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Flutter learning resources](https://docs.flutter.dev/reference/learning-resources)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.

📅 История разработки
🗓️ День 1 — 2026-10-26
Инфраструктура:

✅ Firebase Auth + Firestore + Rules

✅ Роутинг login ↔ chat

✅ Чат с бэкендом, история, автоскролл, logout, блокировка send

✅ Платформенный baseUrl, таймауты (Flutter 40s, backend 50s)

✅ Переход с mistral:7b на llama3.2:3b + warmup

✅ languageLock — 7 правил (только русский, роль Sofi)

✅ Убран мёртвый код после return в index.js

🗓️ День 2 — 2026-10-27
UI-полировка (этап C):

✅ theme/app_theme.dart — тёмная тема + Inter

✅ widgets/message_bubble.dart — пузырь с анимацией (flutter_animate)

✅ widgets/chat_input.dart — поле ввода с микрофоном

✅ AppBar с аватаром «S» (градиент) и кнопкой автоозвучки

✅ Пузыри Telegram-style

✅ Убран 👋 из приветствия (эмодзи на web не работают)

Голос (этап B):

✅ services/voice_service.dart — STT + TTS

✅ STT (speech_to_text) — Chrome + Android

✅ TTS через KittenML API (не flutter_tts)

✅ Воспроизведение через just_audio (StreamAudioSource для web)

✅ 🎤 микрофон — говорит → текст в поле

✅ 🔊 на пузыре Sofi — озвучка

✅ 🔊 в AppBar — автоозвучка ответов

Клонирование голоса:

✅ Записан образец (my_voice.wav)

✅ Загружен на catbox.moe → прямая ссылка

✅ KittenML принимает reference как URL

✅ Клонирование работает (качество русского ограничено)

Бэкенд:

✅ /tts эндпоинт (KittenML API)

✅ .env: KITTENML_API_KEY

🎯 Что осталось (roadmap)
Вариант A — Улучшить клонирование (15–30 мин) 🟡
□ Перезаписать образец: 15–25 сек, чистая речь, простой текст
□ Проверить через curl — стало ли лучше
□ Если плохо — перейти на Fish Audio (бесплатный тариф, хороший русский)
Вариант B — Документация к защите (1–2 часа) 🔥 ОБЯЗАТЕЛЬНО
□ README.md — финальная версия со скриншотами
□ Диаграмма архитектуры (draw.io / Mermaid)
□ Презентация 10–15 слайдов
□ Описание 25 модулей личности бэкенда
□ Ответ про этику клонирования голоса
□ Список литературы / источников
Вариант C — Финальная полировка (1–2 часа) 🟢
□ ChatProvider — вынести состояние из setState
□ Тест на Android-эмуляторе
□ Финальная сборка
Вариант D — Provider (опционально)
□ List<ChatMessage> + isLoading → ChatProvider
□ Заменить setState на notifyListeners()
