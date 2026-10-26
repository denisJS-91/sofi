export function computeEmotion(user, message, intent) {

    const state = user.memory.state;

    let emotion = {
        mood: state.mood,
        warmth: state.warmth,
        stability: state.stability,
        energy: state.energy
    };

    // --- intent influence ---
    if (intent === "emotional_support") {
        emotion.warmth += 2;
        emotion.energy -= 1;
    }

    if (message.includes("спасибо")) {
        emotion.warmth += 1;
    }

    if (message.includes("плохо")) {
        emotion.stability -= 1;
        emotion.warmth += 1;
    }

    // --- clamp ---
    emotion.mood = clamp(emotion.mood);
    emotion.warmth = clamp(emotion.warmth);
    emotion.stability = clamp(emotion.stability);
    emotion.energy = clamp(emotion.energy);

    return emotion;
}

function clamp(v) {
    return Math.max(-10, Math.min(10, v));
}