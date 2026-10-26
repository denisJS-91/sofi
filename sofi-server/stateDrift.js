export function updateStateDrift(user, message, emotion) {

    const state = user.memory.state;

    const text = message.toLowerCase();

    // 📊 базовое медленное изменение (важно!)
    state.stability += 0.01;

    // 😊 эмоции влияют на долгосрочное состояние
    if (emotion === "happy") {
        state.mood += 0.2;
        state.warmth += 0.1;
        state.socialEnergy += 0.1;
    }

    if (emotion === "sad") {
        state.mood -= 0.3;
        state.socialEnergy -= 0.2;
    }

    // 💬 социальные триггеры
    if (text.includes("спасибо")) {
        state.warmth += 0.15;
        state.openness += 0.05;
    }

    if (text.includes("помоги")) {
        state.openness += 0.1;
    }

    if (text.includes("бесишь")) {
        state.warmth -= 0.4;
        state.openness -= 0.2;
    }

    // 🧠 ограничение значений
    for (const k in state) {
        state[k] = Math.max(-10, Math.min(10, state[k]));
    }
}