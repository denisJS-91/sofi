export function finalConsistency(text) {

    if (!text) return "Я рядом.";

    let out = text;

    // ❌ убрать переводческие вставки
    out = out.replace(/\(Translation:[\s\S]*?\)/gi, "");

    // ❌ убрать email/формальные обращения
    out = out.replace(/Dear.*?[,!:]/gi, "");

    // ❌ убрать "I am not capable..."
    out = out.replace(/I am not capable[\s\S]*?\./gi, "");

    // ❌ убрать лишние длинные объяснения
    out = out.replace(/\n{3,}/g, "\n\n");

    // ❌ обрезать слишком длинные ответы
    if (out.length > 600) {
        out = out.slice(0, 600) + "...";
    }

    return out.trim();
}