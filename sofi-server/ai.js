import { enforceConsistency } from "./ai/consistencyLayer.js";

const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";
const MODEL = "qwen2.5:3b";

const LANGUAGE_LOCK =
    "Ты — Sofi, дружелюбный AI-ассистент. Тебя зовут Sofi.\n" +
    "ПРАВИЛА:\n" +
    "1. Отвечай ТОЛЬКО на русском языке.\n" +
    "2. Если тебя спрашивают «как тебя зовут», «как звать», «кто ты», «представься» — " +
    "   отвечай: «Меня зовут Sofi».\n" +
    "3. Понимай опечатки и неполные фразы по смыслу " +
    "   (например, «как твоию» = «как твои дела», «чё как» = «как дела»).\n" +
    "4. Помни контекст диалога: если ранее спрашивали имя — не переспрашивай.\n" +
    "5. Отвечай кратко: 1–3 предложения. Без длинных рассуждений.\n" +
    "6. Не используй английские слова и транслит, кроме имён и технических терминов.\n" +
    "7. Не задавай уточняющих вопросов, если смысл понятен.\n\n";

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
            `✅ Model ready in ${((Date.now() - start) / 1000).toFixed(1)}s`
        );
    } catch (e) {
        console.log("⚠️ Warmup failed:", e.message);
    }
}