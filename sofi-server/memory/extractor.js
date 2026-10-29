import { askAI } from "../ai.js";
import { mergeFacts, setUserName } from "./profileManager.js";

// Мусорные значения — их не сохраняем
const JUNK_VALUES = [
  "ничего конкретного",
  "нет данных",
  "неизвестно",
  "не указано",
  "null",
  "undefined",
];

function isJunk(value) {
  if (!value) return true;
  const v = String(value).toLowerCase().trim();
  if (v === "") return true;
  return JUNK_VALUES.some((j) => j !== "" && v.includes(j));
}

// 🎯 Regex-fallback для имени — надёжнее, чем LLM
function extractNameByRegex(text) {
  const patterns = [
    /(?:меня\s+зовут|моё\s+имя|мое\s+имя|я\s*[-—]\s*)\s*([А-ЯЁA-Z][а-яёa-z]+)/i,
    /(?:зови\s+меня|можно\s+просто)\s+([А-ЯЁA-Z][а-яёa-z]+)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1]) {
      return m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
    }
  }
  return null;
}

export async function extractFactsFromDialog(userId, userMessage, aiReply) {
  try {
    // 🎯 1. Сначала regex — быстро и надёжно для имени
    const nameFromRegex = extractNameByRegex(userMessage);
    if (nameFromRegex) {
      setUserName(userId, nameFromRegex);
      console.log(`👤 Имя (regex): ${nameFromRegex}`);
    }

    // 🧠 2. LLM — только для фактов (не для имени)
    const prompt = `Извлеки факты о ПОЛЬЗОВАТЕЛЕ из диалога.

ВАЖНО: 
- ПОЛЬЗОВАТЕЛЬ — это человек, который пишет сообщения.
- SOFI — это AI-ассистент (ты), который отвечает.
- Факты извлекай ТОЛЬКО о ПОЛЬЗОВАТЕЛЕ, не о Sofi.

Отвечай ТОЛЬКО валидным JSON:
{"facts": [{"key": "...", "value": "...", "confidence": 0.0-1.0}]}

ПРАВИЛА:
- Если фактов нет — верни {"facts": []}.
- Не выдумывай. Если пользователь не сказал — не пиши «нет данных».
- key коротко: «любит», «работает», «живёт в», «возраст», «хобби».
- value — конкретное значение из текста.

Примеры:
Пользователь: «Я люблю кофе» → {"facts":[{"key":"любит","value":"кофе","confidence":0.9}]}
Пользователь: «Работаю программистом» → {"facts":[{"key":"работает","value":"программистом","confidence":0.9}]}
Пользователь: «Привет, как дела?» → {"facts":[]}

Сообщение пользователя: ${userMessage}
Ответ Sofi: ${aiReply}

JSON:`;

    const raw = await askAI(prompt);

    let cleaned = raw.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
    }

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (!m) {
        console.log("extractor: no JSON found");
        return;
      }
      parsed = JSON.parse(m[0]);
    }

    console.log("🔍 extractor raw:", JSON.stringify(parsed));

    if (Array.isArray(parsed.facts) && parsed.facts.length > 0) {
      // 🧹 Фильтр мусора
      const cleanFacts = parsed.facts.filter(
        (f) => f.key && f.value && !isJunk(f.value),
      );

      if (cleanFacts.length > 0) {
        mergeFacts(userId, cleanFacts);
        console.log(`🧠 Фактов (чистых): ${cleanFacts.length}`);
      } else {
        console.log("🧹 Все факты отфильтрованы как мусор");
      }
    }
  } catch (e) {
    console.log("extractor error:", e.message);
  }
}
