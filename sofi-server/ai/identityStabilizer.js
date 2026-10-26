export function stabilizeIdentity(user, state, emotion) {

    if (!user.memory.identityCore) {
        user.memory.identityCore = {
            personaLock: 1.0,
            drift: 0,
            lastReset: Date.now()
        };
    }

    const id = user.memory.identityCore;

    // 📉 drift растёт при нестабильных эмоциях
    if (emotion === "negative") id.drift += 0.05;
    if (emotion === "positive") id.drift -= 0.02;

    // 🧠 естественное возвращение к центру
    id.drift *= 0.95;

    // 🧲 persona lock (фиксирует личность)
    if (id.drift > 1) id.drift = 1;
    if (id.drift < 0) id.drift = 0;

    // 🔒 стабилизация state
    if (id.drift > 0.7) {
        state.warmth *= 0.9;
        state.stability += 0.1;
    }

    if (id.drift < 0.3) {
        state.warmth += 0.05;
    }

    return {
        state,
        identity: id
    };
}