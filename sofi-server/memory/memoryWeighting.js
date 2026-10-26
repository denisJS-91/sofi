export function calculateImportance(message, emotion, intent) {

    let importance = 0.1; // базовый вес

    const text = message.toLowerCase();

    // 🔥 эмоциональная нагрузка
    if (emotion === "negative") importance += 0.4;
    if (emotion === "positive") importance += 0.2;

    // 🧠 важные намерения
    if (intent === "emotional_support") importance += 0.5;
    if (intent === "document_help") importance += 0.3;

    // ⚡ триггеры боли / кризиса
    if (
        text.includes("плохо") ||
        text.includes("устал") ||
        text.includes("не могу") ||
        text.includes("больно")
    ) {
        importance += 0.6;
    }

    // 📌 личные данные
    if (
        text.includes("меня зовут") ||
        text.includes("я из") ||
        text.includes("мой")
    ) {
        importance += 0.3;
    }

    // 🧹 ограничение
    return clamp(importance, 0.05, 1.0);
}

export function attachWeightedMemory(user, message, role, emotion, intent) {

    if (!user.memory.weighted) {
        user.memory.weighted = [];
    }

    const importance = calculateImportance(message, emotion, intent);

    user.memory.weighted.push({
        text: message,
        role,
        time: Date.now(),
        importance
    });

    // 🧹 ограничиваем размер
    if (user.memory.weighted.length > 50) {
        user.memory.weighted.sort((a, b) => a.importance - b.importance);
        user.memory.weighted.shift();
    }
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}