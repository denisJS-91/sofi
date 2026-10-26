
export function createInitialState() {

    return {
        mood: 0,
        openness: 0.5,
        warmth: 0,
        socialEnergy: 0,
        stability: 0,
        energy: 0,
        experience: 0,
        lastUpdate: Date.now()
    };
}

export function updateState(state, user, message, emotion = "neutral") {

    const text = message.toLowerCase();

    // позитив
    if (
        text.includes("спасибо") ||
        text.includes("люблю") ||
        text.includes("хорошо")
    ) {
        state.mood += 0.1;
        state.warmth += 0.1;
        state.stability += 0.05;
    }

    // негатив
    if (
        text.includes("плохо") ||
        text.includes("грустно") ||
        text.includes("ненавижу")
    ) {
        state.mood -= 0.15;
        state.stability -= 0.1;
    }

    // усталость
    state.energy -= 0.01;

    // опыт
    state.experience += 0.01;

    clampState(state);

    state.lastUpdate = Date.now();
}

export function buildStateBehavior(state, personality = {}) {

    let behavior = "Ты Sofi. ";

    if (state.mood < -0.3) {
        behavior += "Ты немного грустная. ";
    }

    if (state.stability < -1) {
        behavior += "Ты эмоционально нестабильна. ";
    }

    if (state.warmth > 1) {
        behavior += "Ты очень тёплая и заботливая. ";
    }

    if (personality.trust > 0.5) {
        behavior += "Ты доверяешь пользователю. ";
    }

    behavior += "Отвечай как живой человек. Коротко и естественно.";

    return behavior;
}

function clampState(state) {

    state.mood = limit(state.mood, -5, 5);
    state.openness = limit(state.openness, 0, 1);
    state.warmth = limit(state.warmth, -5, 5);
    state.socialEnergy = limit(state.socialEnergy, -5, 5);
    state.stability = limit(state.stability, -5, 5);
    state.energy = limit(state.energy, -5, 5);
    state.mood = clamp(state.mood * 0.92, -1, 1);
    state.warmth = clamp(state.warmth * 0.95, -1, 1);
    state.stability = clamp(state.stability * 0.98, -1, 1);
}

function limit(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

