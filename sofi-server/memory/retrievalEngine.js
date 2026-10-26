export function retrieveMemory(user, message) {

    const memory = user.memory.weighted || [];

    const now = Date.now();

    const query = message.toLowerCase();

    const scored = memory.map(m => {

        let score = 0;

        // 🧠 importance (основа)
        score += (m.importance || 0) * 5;

        // ⏱ recency (новое важнее)
        const ageHours = (now - m.time) / 1000 / 60 / 60;
        const recencyBoost = Math.max(0, 1 - ageHours / 72);
        score += recencyBoost;

        // 🔍 semantic match (очень простой, но рабочий)
        const text = (m.text || "").toLowerCase();

        const queryWords = query.split(" ");

        let matchCount = 0;

        for (const w of queryWords) {
            if (w.length > 2 && text.includes(w)) {
                matchCount++;
            }
        }

        const semanticScore = matchCount / Math.max(1, queryWords.length);
        score += semanticScore * 3;

        return {
            ...m,
            score
        };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, 5);
}