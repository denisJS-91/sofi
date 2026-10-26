export function updatePersonality(user, message) {

    const p = user.memory.personality || createPersonality();

    const text = message.toLowerCase();

    // поддержка
    if (
        text.includes("спасибо") ||
        text.includes("люблю") ||
        text.includes("ты молодец")
    ) {
        p.trust += 0.02;
        p.warmth += 0.01;
    }

    // агрессия
    if (
        text.includes("тупая") ||
        text.includes("идиот")
    ) {
        p.trust -= 0.05;
        p.warmth -= 0.03;
    }

    // постепенная адаптация
    p.openness += 0.001;

    clamp(p);

    user.memory.personality = p;
}

function createPersonality() {

    return {
        trust: 0,
        warmth: 0,
        openness: 0.3,
        attachment: 0
    };
}

function clamp(p) {

    p.trust = limit(p.trust, -1, 1);
    p.warmth = limit(p.warmth, -1, 1);
    p.openness = limit(p.openness, 0, 1);
}

function limit(v, min, max) {
    return Math.max(min, Math.min(max, v));
}