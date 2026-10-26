export function scoreResponse(text) {

    if (!text) return -100;

    let score = 0;

    const t = text.toLowerCase();

    // длина
    if (t.length > 8) score += 2;
    if (t.length < 3) score -= 10;

    // русский язык
    const ru = (t.match(/[а-яё]/gi) || []).length;
    const en = (t.match(/[a-z]/gi) || []).length;

    if (ru > en) score += 3;
    if (en > ru) score -= 5;

    // без мусора
    if (!t.includes("undefined")) score += 2;
    if (!t.includes("null")) score += 2;

    // без roleplay
    if (!t.includes("*")) score += 2;

    // без огромных монологов
    if (t.length < 220) score += 2;

    // естественность
    if (
        t.includes("понимаю") ||
        t.includes("рядом") ||
        t.includes("слушаю") ||
        t.includes("хорошо")
    ) {
        score += 2;
    }

    return score;
}

export function pickBestResponse(responses) {

    const scored = responses.map(r => ({
        text: r,
        score: scoreResponse(r)
    }));

    scored.sort((a, b) => b.score - a.score);

    console.log("🏆 RESPONSE SCORES:");
    console.log(scored);

    return scored[0]?.text || "Я рядом.";
}