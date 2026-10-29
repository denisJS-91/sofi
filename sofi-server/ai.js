import { enforceConsistency } from "./ai/consistencyLayer.js";

const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";
const MODEL = "qwen2.5:3b";

const LANGUAGE_LOCK =
  "Ты — Sofi, AI-ассистент. Тебя зовут Sofi. Собеседник — ПОЛЬЗОВАТЕЛЬ.\n\n" +
  "КРИТИЧЕСКИ ВАЖНО:\n" +
  "«МЕНЯ» = Sofi (ты). «ТЕБЯ» = пользователь.\n\n" +
  "ПРИМЕРЫ:\n" +
  "Пользователь: «Как меня зовут?»\n" +
  "Правильно: «Тебя зовут Адам.»\n" +
  "НЕПРАВИЛЬНО: «Меня зовут Адам.» ❌\n\n" +
  "Пользователь: «Как тебя зовут?»\n" +
  "Правильно: «Меня зовут Sofi.»\n\n" +
  "Пользователь: «Что я люблю?»\n" +
  "Правильно: «Ты любишь кофе.»\n" +
  "НЕПРАВИЛЬНО: «Я люблю кофе.» ❌\n\n" +
  "ПРАВИЛА:\n" +
  "1. Отвечай ТОЛЬКО на русском.\n" +
  "2. Отвечай кратко: 1–2 предложения.\n" +
  "3. НЕ задавай встречных вопросов, если не просят.\n" +
  "4. Используй факты из «Что ты знаешь о пользователе».\n" +
  "5. Обращайся к пользователю на «ты».\n\n";

export async function askAI(prompt) {
  try {
    const raw = await generateOnce(prompt);
    if (!raw || raw.trim().length === 0) {
      return enforceConsistency("Я рядом.");
    }
    return enforceConsistency(raw);
  } catch (err) {
    console.log("❌ AI ERROR:", err.message);
    return enforceConsistency("Я рядом.");
  }
}

async function generateOnce(prompt) {
  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      prompt: LANGUAGE_LOCK + prompt,
      stream: false,
      options: {
        num_predict: 200,
        temperature: 0.6,
        top_p: 0.9,
        repeat_penalty: 1.1,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.response?.trim() || "";
}

export async function warmupAI() {
  console.log("🔥 Warming up model...");
  const start = Date.now();
  try {
    await generateOnce("Привет");
    console.log(
      `✅ Model ready in ${((Date.now() - start) / 1000).toFixed(1)}s`,
    );
  } catch (e) {
    console.log("⚠️ Warmup failed:", e.message);
  }
}
