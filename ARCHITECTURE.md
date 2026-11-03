## 📄 `ARCHITECTURE.md` — создать с нуля

````markdown
# 🏗️ Sofi — Architecture

Документ описывает текущую архитектуру и **план развития** (Raspberry Pi, умный дом, профили личности).

> Версия: 2026-11-03. Актуальная реализация — Flutter + Node.js + OpenRouter.

---

## 1. Философия

Sofi строится по трём принципам:

1. **Privacy-first** — всё личное (голос, память, история) — локально или в Firebase пользователя. В облако уходит только запрос к LLM и web search.
2. **Local-first (в будущем)** — на Raspberry Pi STT, TTS и wake word работают локально. Без интернета Sofi продолжает слушать и отвечать (в ограниченном режиме).
3. **Companion, not replacement** — Sofi не заменяет живое общение. Она поддерживает, помогает, напоминает — но поощряет реальные контакты.

---

## 2. Текущая архитектура

```mermaid
flowchart TB
    subgraph Client["Flutter App"]
        A1[Auth<br/>Firebase]
        A2[Chat UI]
        A3[STT<br/>speech_to_text]
        A4[TTS<br/>just_audio]
    end

    subgraph Backend["Node.js Backend"]
        B1["/chat"]
        B2["/tts"]
        B3["/health"]
        B4[25 модулей личности]
        B5[Web Search]
    end

    subgraph Cloud["OpenRouter"]
        C1[Dots3 280B<br/>LLM]
        C2[Fish Audio<br/>TTS + клонирование]
    end

    subgraph Storage["Хранилище"]
        S1[(Firestore<br/>история, профиль)]
        S2[(profile.json<br/>локально)]
    end

    A2 -->|HTTP| B1
    A4 -->|HTTP| B2
    B1 --> B4
    B4 --> C1
    B2 --> C2
    B4 --> B5
    B1 --> S1
    B4 --> S2
    A1 --> S1

Поток запроса (чат)
1. Пользователь пишет или говорит → Flutter STT → текст.

2. ai_service.dart → POST /chat (с userId, message).

3. Бэкенд:

 intentRouter → определяет намерение

 emotionEngine → оценивает эмоцию

 stateEngine + trajectoryEngine → обновляют состояние

 personalityCore + identityLock → стабилизируют личность

 buildPrompt + formatHistory (10 сообщений) → промпт

 askAI → OpenRouter (Dots3) → ответ

 finalConsistency + пост-фильтры → чистка

 updateMemory + saveMemory → сохранение

4. Ответ → Flutter → отображение + TTS (если включено).

Поток TTS
 1.Flutter → POST /tts (текст).

 2.tts_server.py (Flask, 5001) → Fish Audio через OpenRouter.

 3.Клонирование: input_references (base64 my_voice.wav) + транскрипт.

 4.fix_stress() — расставляет ударения (например, «Софи́»).

 5.MP3 → Flutter → just_audio → динамик.

```
````

## 3. 25 модулей личности

```mermaid
Бэкенд — это не «обёртка над LLM». Это когнитивная архитектура, которая формирует промпт и обрабатывает ответ.

Intent & Emotion

1. intent/intentRouter.js — классификация намерения

2. emotionEngine.js — оценка эмоции пользователя

3. emotion/trajectoryEngine.js — динамика эмоций во времени

State & Behavior

1. stateEngine.js — текущее состояние Sofi

2. stateDrift.js — отслеживание дрейфа состояния

3. behaviorEngine.js — поведение на основе состояния

Personality & Identity

1. ai/personalityCore.js / personalityCore.js — характер

2. ai/identityLock.js — «замок» идентичности

3. ai/identityStabilizer.js — стабилизация

4. identityCore.js — ядро идентичности

5. prompt/sofiLock.js — финальные инструкции в промпте

Memory

1. memory.js — базовое управление памятью

2. memory/memoryWeighting.js — взвешивание воспоминаний

3. memory/retrievalEngine.js — извлечение релевантного

4. memory/profileManager.js — профиль пользователя

5. memory/extractor.js — извлечение фактов

6. ai/sleepCycle.js — «сон» (консолидация памяти)

Relationship & Self

1. ai/relationshipModel.js — модель отношений

2. ai/selfModel.js — самосознание Sofi

3. ai/evolutionMap.js — карта эволюции личности

4. ai/emotionalContinuity.js — эмоциональная непрерывность

Consistency & Output

1. ai/consistencyLayer.js — согласованность ответа

2. ai/driftMonitor.js — мониторинг дрейфа

3. utils/finalConsistency.js — финальная чистка

4. utils/postProcessSofi.js / outputStabilizer.js / responseRanker.js — пост-обработка

5. core/sofiCore.js — ядро (общее состояние)

Tools

1. tools/webSearch.js — поиск в интернете

2. tools/shouldSearch.js — решает, нужен ли поиск

```

## 4. Память и развитие личности

```mermaid

Что хранится

Где                                   Что                   Зачем
1. Firestore users/{uid}/messages/.   История чата          Контекст диалога
2. Firestore users/{uid}/profile/     Имя, факты            Персонализация
3. sofi-server/memory/profile.json    Локальный профиль     Быстрый доступ
4. sofi-server/memory.json            Состояние SOFI_CORE   Личность между запросами

Как Sofi «развивается»

1. Извлечение фактов — extractor.js вытаскивает из диалога имя, привычки, важные события.

2. Взвешивание — memoryWeighting.js решает, что важнее (недавнее vs. значимое).

3. Консолидация — sleepCycle.js периодически «пересматривает» память, убирает шум.

4. Эволюция — evolutionMap.js отслеживает изменения личности.

Профили (план)

Одна архитектура — разные режимы:

Профиль            Для кого                 Особенности

1. Companion          Одинокие люди            Терпение, эмоции, память о личном
2. Tutor              Изучающие язык           Адаптивная сложность, исправления
3. Speech             Дети с задержкой речи    Повторение, упражнения, мягкая обратная связь

Профиль выбирается при регистрации и влияет на промпт + поведение.

```

## 5. Будущее: умная колонка на Raspberry Pi

```mermaid

Железо

Компонент                Модель                             Зачем

1. Raspberry Pi             Pi 5, 8 GB                         4 GB мало для STT + TTS + бэкенд
2. Микрофон                 ReSpeaker 2-Mic Pi HAT / USB       Wake word на расстоянии
3. Динамик                  3W+ USB или GPIO-усилитель         Слышно в комнате
4. Охлаждение               Active Cooler                      Pi 5 греется
5. Экран (опц.)             7" тачскрин(голографический)       Визуальная обратная связь

Гибридная архитектура

┌─────────────────────────────────────────────┐
│  Raspberry Pi 5 (8 GB)                      │
│                                             │
│  ┌──────────────┐   ┌────────────────────┐  │
│  │ Wake word    │──▶│  Orchestrator      │  │
│  │ openWakeWord │   │  (Python)          │  │
│  │ "Hey Sofi"   │   │  слушает → STT →   │  │
│  └──────────────┘   │  backend → TTS     │  │
│                     └────────┬───────────┘  │
│                              │              │
│  ┌──────────────┐   ┌────────▼───────────┐  │
│  │ Whisper.cpp  │   │  Sofi Backend      │  │
│  │ (STT, local) │   │  (Node.js)         │  │
│  └──────────────┘   │  память, личность  │  │
│                     └────────┬───────────┘  │
│  ┌──────────────┐            │              │
│  │ Piper TTS    │◀───────────┘              │
│  │ (local)      │                           │
│  └──────────────┘                           │
│                                             │
│  ┌────────────────────────────────────────┐ │
│  │ Home Assistant (Docker)                │ │
│  │ Zigbee/Matter → свет, розетки, климат  │ │
│  └────────────────────────────────────────┘ │
└─────────────────┬───────────────────────────┘
                  │ интернет (для LLM и web search)
                  ▼
            OpenRouter (Dots3)

```

## 6. Этика

```mermaid

Проект затрагивает уязвимые группы (одинокие, пожилые, дети). Это накладывает обязательства:

Приватность

1. Голос, память, история — локально или в Firebase пользователя.

2. В облако уходит только запрос к LLM и web search.

3. my_voice.wav — не коммитится, не покидает устройство без согласия.

Не-зависимость

1. Sofi не заменяет живое общение.

2. Она напоминает о реальных контактах, поощряет активность.

3. Дизайн избегает «эмоционального крючка».

Прозрачность

1. Пользователь знает, что говорит с AI.

2. Sofi не притворяется человеком.

3. Ограничения озвучиваются честно.

Безопасность

1. Для детей — фильтрация контента, безопасные темы.

2. Для пожилых — защита от манипуляций, простой UI.

3. Для всех — нет сбора данных «на продажу».

Клонирование голоса

1. Работает только с голосом самого пользователя (или с явного согласия).

2. Не используется для имитации других людей.

3. В продакшене — ElevenLabs или локальные модели вместо нестабильного Fish Audio free.

```

## 7. Roadmap

```mermaid

Этап                    Что                                                                     Статус

1. Web MVP              Flutter Web + Firebase + Node.js + OpenRouter + Fish Audio              ✅ готово
2. Android              Тест STT/TTS на реальном устройстве                                     ⏳
3. iOS                  Сборка под iOS                                                          📋
4. Профили              Companion / Tutor / Speech                                              📋
5. Raspberry Pi         Wake word + локальные STT/TTS                                           📋
6. Умный дом            Home Assistant + Zigbee/Matter                                          📋
7. Продакшен            Платный LLM API или GPU, ElevenLabs                                     📋

Что нужно для перехода на Pi

□ Записать my_voice.wav → конвертировать в Piper-формат (или оставить Fish Audio для онлайна)
□ Настроить openWakeWord с кастомной моделью «Hey Sofi»
□ Whisper.cpp (tiny/base) для STT
□ Piper для TTS
□ Home Assistant в Docker
□ Orchestrator на Python (слушает → STT → backend → TTS)

```

## 8. Ссылки

```mermaid

Текущее состояние проекта — PROJECT_STATE.md

Быстрый старт — README.md

OpenRouter — https://openrouter.ai

Home Assistant — https://home-assistant.io

Piper TTS — https://github.com/rhasspy/piper

openWakeWord — https://github.com/dscripka/openWakeWord

```
