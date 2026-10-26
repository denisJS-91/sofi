export function isBadResponse(text) {

    if (!text) return true;

    const t = text.toLowerCase().trim();

    // слишком коротко
    if (t.length < 3) return true;

    // англо-каша
    const englishRatio =
        (t.match(/[a-z]/gi) || []).length / t.length;

    if (englishRatio > 0.35) return true;

    // битые ответы
    if (
        t.includes("i'm to") ||
        t.includes("'re") ||
        t.includes("undefined") ||
        t.includes("null")
    ) {
        return true;
    }

    // слишком много повторов
    const words = t.split(" ");
    const unique = new Set(words);

    if (unique.size < words.length * 0.45) {
        return true;
    }

    return false;
}