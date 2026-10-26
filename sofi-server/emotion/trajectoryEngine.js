export function updateTrajectory(user, message, emotion) {

    if (!user.memory.trajectory) {
        user.memory.trajectory = {
            trust: 0,
            closeness: 0,
            emotionalMemory: []
        };
    }

    const t = user.memory.trajectory;

    // 📈 trust
    if (emotion === "positive") t.trust += 0.1;
    if (emotion === "negative") t.trust -= 0.1;

    // ❤️ closeness
    t.closeness += 0.02;

    // 🧠 memory of emotional events
    t.emotionalMemory.push({
        message,
        emotion,
        time: Date.now()
    });

    // ограничение памяти
    if (t.emotionalMemory.length > 20) {
        t.emotionalMemory.shift();
    }

    // clamp
    t.trust = clamp(t.trust, -1, 1);
    t.closeness = clamp(t.closeness, 0, 1);
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}