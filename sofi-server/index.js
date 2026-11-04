import express from "express";
import cors from "cors";

import {
  loadMemory,
  saveMemory,
  getUser,
  extractFacts,
  updateMemory,
} from "./memory.js";
import { SOFI_CORE } from "./core/sofiCore.js";
import { applyIdentityLock } from "./ai/identityLock.js";
import { askAI, warmupAI } from "./ai.js";
import { updateIdentity } from "./identityCore.js";
import { updateState, buildStateBehavior } from "./stateEngine.js";
import { detectIntent } from "./intent/intentRouter.js";
import { computeEmotion } from "./emotionEngine.js";
import { buildPrompt } from "./prompt/promptRouter.js";
import { updatePersonality } from "./personalityCore.js";
import { updateTrajectory } from "./emotion/trajectoryEngine.js";
import { attachWeightedMemory } from "./memory/memoryWeighting.js";
import { updateEmotionalContinuity } from "./ai/emotionalContinuity.js";
import { stabilizeIdentity } from "./ai/identityStabilizer.js";
import { buildSelfModel } from "./ai/selfModel.js";
import { sleepCycle } from "./ai/sleepCycle.js";
import { updateEvolutionMap } from "./ai/evolutionMap.js";
import { updateRelationship } from "./ai/relationshipModel.js";
import { finalConsistency } from "./utils/finalConsistency.js";
import { monitorDrift } from "./ai/driftMonitor.js";
import "dotenv/config";
import { extractFactsFromDialog } from "./memory/extractor.js";
import { webSearch } from "./tools/webSearch.js";
import { shouldSearch } from "./tools/shouldSearch.js";

const activeRequests = new Set();

const app = express();
let db = loadMemory();

app.use(cors());
app.use(express.json());

/* ─────────────────────────────
   УТИЛИТЫ ОЧИСТКИ ОТВЕТА
───────────────────────────── */

// 🧹 Убирает КАПС-префиксы: «ПРИВЕТ!», «ПРИЯТЕЛЬНО:», «SOFI:» и т.п.
function stripCapsPrefixes(text) {
  if (!text) return text;
  let out = text;
  // До 2 раз — на случай двойного префикса
  for (let i = 0; i < 2; i++) {
    out = out.replace(/^[А-ЯЁA-Z]{2,}[!:\-–—\s]+/u, "").trim();
  }
  return out;
}

// 🧹 Убирает английские слова-паразиты
function stripEnglishFiller(text) {
  return text
    .replace(/\bthing\b/gi, "вещь")
    .replace(/\bcool\b/gi, "круто")
    .replace(/\bvery\b/gi, "очень")
    .replace(/\breally\b/gi, "правда")
    .replace(/\bso\b(?=\s)/gi, "так");
}

// 🧹 Чинит пробелы после тире и знаков препинания
function fixSpacing(text) {
  return text
    .replace(/([—–])([а-яёА-ЯЁ])/g, "$1 $2") // «—целая» → «— целая»
    .replace(/\s+([.,!?;:])/g, "$1") // «слово .» → «слово.»
    .replace(/([.,!?;:])([а-яёА-ЯЁ])/g, "$1 $2") // «Слово.Слово» → «Слово. Слово»
    .trim();
}

function fixTypos(text) {
  return text
    .replace(/встроеными/gi, "встроенными")
    .replace(/встроеным/gi, "встроенным")
    .replace(/кажды[йй]/gi, "каждый")
    .replace(/чуствует/gi, "чувствует")
    .replace(/чуствовать/gi, "чувствовать");
}

// 🧹 Если ответ обрывается на полуслове — обрезаем до последнего полного предложения
function fixTruncation(text) {
  const trimmed = text.trim();
  // Если уже заканчивается на . ! ? … " ) — всё ок
  if (/[.!?…"’)\]]$/.test(trimmed)) return trimmed;

  // Ищем последний знак конца предложения
  const lastPunct = Math.max(
    trimmed.lastIndexOf("."),
    trimmed.lastIndexOf("!"),
    trimmed.lastIndexOf("?"),
    trimmed.lastIndexOf("…"),
  );

  if (lastPunct > 30) {
    return trimmed.substring(0, lastPunct + 1).trim();
  }

  // Если предложений нет — обрезаем до последнего пробела + «…»
  const lastSpace = trimmed.lastIndexOf(" ");
  if (lastSpace > 30) {
    return trimmed.substring(0, lastSpace).trim() + "…";
  }

  return trimmed;
}

// 🛡️ Если спросили «как меня зовут» — заменяет «Меня зовут X» на «Тебя зовут X»
function fixMyNameAnswer(reply, message, userId) {
  const asksMyName =
    /как\s+меня\s+зовут|моё\s+имя|мое\s+имя|как\s+мо[её]\s+имя/i.test(message);
  if (!asksMyName || !/^Меня\s+зовут\s+/i.test(reply)) return reply;

  const profile = getUser(db, userId);
  const userName =
    profile?.name || profile?.facts?.find((f) => f.key === "имя")?.value;
  if (!userName) return reply;

  console.log(`🔧 Пост-фильтр: «Меня зовут» → «Тебя зовут ${userName}»`);
  return reply.replace(/^Меня\s+зовут\s+[^.!?,]+/i, `Тебя зовут ${userName}`);
}

// Полный пайплайн очистки ответа
function cleanReply(rawReply, message, userId) {
  let reply = finalConsistency(rawReply);
  reply = stripCapsPrefixes(reply);
  reply = fixMyNameAnswer(reply, message, userId);
  reply = stripEnglishFiller(reply);
  reply = fixSpacing(reply);
  reply = fixTypos(reply);
  reply = fixTruncation(reply);
  return reply;
}

/* ─────────────────────────────
   HEALTHCHECK
───────────────────────────── */
app.get("/health", (_, res) => res.json({ ok: true, name: "sofi", v: 8 }));

/* ─────────────────────────────
   TTS (KittenML — задел на клонирование)
───────────────────────────── */
// 🎯 TTS прокси → Python (локально 127.0.0.1:5001, на Railway — внутренний URL)
const TTS_URL = process.env.TTS_URL || "http://127.0.0.1:5001";

app.post("/tts", async (req, res) => {
  const { text, reference } = req.body || {};
  if (!text) return res.status(400).json({ error: "text required" });

  try {
    const response = await fetch(`${TTS_URL}/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, reference }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("TTS proxy error:", response.status, err);
      return res.status(response.status).json({ error: "TTS failed" });
    }

    const audioBuffer = await response.arrayBuffer();
    res.set("Content-Type", "audio/mpeg");
    res.send(Buffer.from(audioBuffer));
  } catch (e) {
    console.error("TTS proxy error:", e);
    res.status(500).json({ error: e.message });
  }
});

/* ─────────────────────────────
   USER INIT
───────────────────────────── */
function ensureUser(userId) {
  if (!SOFI_CORE.relationship[userId]) {
    SOFI_CORE.relationship[userId] = {
      trust: 0.5,
      closeness: 0.5,
      lastInteraction: Date.now(),
    };
  }
}

/* ─────────────────────────────
   CHAT ENDPOINT
───────────────────────────── */
app.post("/chat", async (req, res) => {
  const { message, userId, history = [] } = req.body || {};

  if (!message || !userId) {
    return res.status(400).json({ reply: "missing fields" });
  }

  const key = userId;

  if (activeRequests.has(key)) {
    return res.json({ reply: "Подожди секунду..." });
  }

  activeRequests.add(key);

  try {
    // 1. USER
    const user = getUser(db, userId);

    // 2. INTENT
    const intent = detectIntent(message);

    // 3. EMOTION
    const emotion = computeEmotion(user, message, intent);

    // 4. STATE UPDATE
    updateState(user.memory.state, user, message, emotion);
    updateTrajectory(user, message, emotion);
    updateEvolutionMap(user);

    // 4.6 IDENTITY STABILIZER
    const result = stabilizeIdentity(user, user.memory.state, emotion);
    user.memory.state = result.state;

    // 5. PERSONALITY
    updatePersonality(user, message);

    // 6. BEHAVIOR
    const stateBehavior = buildStateBehavior(
      user.memory.state,
      user.memory.personality,
    );

    // 6.5 SELF MODEL
    const selfModel = buildSelfModel(user, emotion);

    // 7. PROMPT
    let prompt = buildPrompt(
      user,
      message,
      emotion,
      stateBehavior,
      selfModel,
      userId,
      history,
    );

    prompt = applyIdentityLock(prompt);

    // 🌐 WEB SEARCH
    if (shouldSearch(message)) {
      console.log(`🌐 Triggered web search for: "${message}"`);
      const searchResults = await webSearch(message);
      console.log(`📥 Search results: ${searchResults.length} chars`);

      if (
        searchResults &&
        !searchResults.startsWith("Ошибка") &&
        searchResults !== "Ничего не найдено."
      ) {
        prompt +=
          `\n\n=== АКТУАЛЬНЫЕ ДАННЫЕ ИЗ ИНТЕРНЕТА ===\n` +
          `${searchResults}\n` +
          `=== КОНЕЦ ДАННЫХ ===\n\n` +
          `ВАЖНО: Ответь на вопрос пользователя, ИСПОЛЬЗУЯ эти данные. ` +
          `Обязательно назови конкретные цифры (температуру, влажность, давление). ` +
          `Не говори «не могу показать» — данные есть выше.\n`;
      } else {
        prompt += `\n\n(Поиск не дал результатов. Скажи «Не могу найти актуальные данные».)\n`;
      }
    }

    // 8. AI CALL (90 сек)
    const rawReply = await Promise.race([
      askAI(prompt),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI timeout 90s")), 90000),
      ),
    ]);

    // DRIFT MONITOR
    monitorDrift(SOFI_CORE, rawReply);
    updateEmotionalContinuity(user, message, emotion, rawReply);
    updateRelationship(user, message, emotion, rawReply);

    // 🧹 Очистка ответа
    const reply = cleanReply(rawReply, message, userId);

    // 9. MEMORY
    attachWeightedMemory(user, message, "user", emotion, intent);
    attachWeightedMemory(user, reply, "assistant", emotion, intent);
    updateMemory(user, message, reply);

    if (user.memory.weighted.length % 10 === 0) {
      sleepCycle(user);
    }

    saveMemory(db);

    // 🧠 ФОН: извлечение фактов (не блокирует ответ)
    extractFactsFromDialog(userId, message, reply).catch((e) =>
      console.log("extractor bg error:", e.message),
    );

    return res.json({ reply });
  } catch (e) {
    console.log("CHAT ERROR:", e);
    return res.json({
      reply: "Я немного зависла... попробуй ещё раз",
    });
  } finally {
    activeRequests.delete(key);
  }
});

/* ─────────────────────────────
   START
───────────────────────────── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🧠 Sofi V8 running on http://0.0.0.0:${PORT}`);
  warmupAI();
});
