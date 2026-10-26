export function updateRelationship(user, message, emotion, reply) {

    if (!user.memory.relationship) {
        user.memory.relationship = {
            trust: 0,
            closeness: 0,
            familiarity: 0,
            moodSync: 0,
            lastInteraction: Date.now(),
            history: []
        };
    }

    const r = user.memory.relationship;

    r.familiarity += 0.01;

    // 💓 trust dynamics
    if (emotion === "positive") r.trust += 0.02;
    if (emotion === "negative") r.trust -= 0.01;

    // 🫂 closeness grows with interaction
    r.closeness += 0.015;

    // 🧠 mood sync (Sofi starts aligning with user)
    r.moodSync = (r.moodSync * 0.9) + (emotionScore(emotion) * 0.1);

    r.trust = clamp(r.trust, -1, 1);
    r.closeness = clamp(r.closeness, 0, 1);
    r.familiarity = clamp(r.familiarity, 0, 1);

    r.lastInteraction = Date.now();

    // 📦 store interaction trace
    r.history.push({
        user: message,
        ai: reply,
        emotion,
        time: Date.now()
    });

    if (r.history.length > 50) {
        r.history.shift();
    }

    return r;
}

function emotionScore(e) {
    if (e === "positive") return 1;
    if (e === "negative") return -1;
    return 0;
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}