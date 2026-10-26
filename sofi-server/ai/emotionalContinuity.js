export function updateEmotionalContinuity(user, message, emotion, reply) {

    if (!user.memory.emotionalContinuity) {
        user.memory.emotionalContinuity = {
            history: [],
            emotionalDrift: 0,
            lastEmotion: "neutral"
        };
    }

    const ec = user.memory.emotionalContinuity;

    ec.history.push({
        emotion,
        reply,
        time: Date.now()
    });

    if (ec.history.length > 20) {
        ec.history.shift();
    }

    ec.lastEmotion = emotion;

    return ec;

    // 💓 bond growth
    if (emotion === "positive") c.bond += 0.02;
    if (emotion === "negative") c.bond += 0.01; // negative = still attachment

    // 🧠 saturation
    c.bond = clamp(c.bond, 0, 1);

    // 📦 store emotional memory snapshot
    c.emotionalHistory.push({
        user: message,
        ai: reply,
        emotion,
        time: Date.now()
    });

    if (c.emotionalHistory.length > 30) {
        c.emotionalHistory.shift();
    }

    c.lastEmotion = emotion;

    return c;
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}