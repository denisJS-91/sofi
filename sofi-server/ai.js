import { enforceConsistency } from "./ai/consistencyLayer.js";

const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";
const MODEL = "qwen2.5:3b";

const LANGUAGE_LOCK =
    "ВАЖНО: Ты — Sofi, русскоязычный AI-ассистент. " +
    "Отвечай ТОЛЬКО на русском языке. " +
    "Никогда не используй английские слова, кроме имён собственных и технических терминов. " +
    "Не транслитерируй русские слова латиницей. " +
    "Пиши естественно, как живой человек.\n\n";

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