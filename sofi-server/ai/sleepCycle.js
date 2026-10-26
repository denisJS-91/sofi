export function sleepCycle(user) {

    if (!user.memory.sleep) {
        user.memory.sleep = {
            cycles: 0,
            summary: "",
            learnedPatterns: []
        };
    }

    const sleep = user.memory.sleep;

    const memory = user.memory.weighted || [];

    // 🧠 берём только важные воспоминания
    const important = memory
        .filter(m => m.importance > 0.4)
        .slice(-20);

    // 🧩 строим “сжатое воспоминание”
    const summary = important
        .map(m => `${m.role}: ${m.text}`)
        .join(" | ");

    // 🧠 извлекаем паттерны поведения пользователя
    const patterns = extractPatterns(important);

    sleep.summary = summary;
    sleep.learnedPatterns = patterns;
    sleep.cycles++;

    return sleep;
}

function extractPatterns(memories) {

    const patterns = [];

    const negatives = memories.filter(m =>
        m.text.includes("плохо") ||
        m.text.includes("устал") ||
        m.text.includes("больно")
    ).length;

    const positives = memories.filter(m =>
        m.text.includes("спасибо") ||
        m.text.includes("хорошо") ||
        m.text.includes("норм")
    ).length;

    if (negatives > positives) {
        patterns.push("user_is_emotionally_vulnerable");
    }

    if (positives > negatives) {
        patterns.push("user_is_stable");
    }

    if (memories.length > 10) {
        patterns.push("user_is_high_interaction");
    }

    return patterns;
}