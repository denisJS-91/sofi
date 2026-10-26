export function buildSelfModel(user, emotion) {

    const state = user.memory.state;

    const drift = user.memory.identityCore?.drift ?? 0;

    let moodLabel = "neutral";

    if (state.warmth < -3) moodLabel = "cold";
    if (state.warmth > 2) moodLabel = "warm";
    if (state.stability < -5) moodLabel = "unstable";

    let energyLabel = "low";
    if (state.energy > 0.5) energyLabel = "high";

    return {
        moodLabel,
        energyLabel,
        driftLevel: drift,
        emotionalTone:
            emotion === "negative" ? "sensitive" :
                emotion === "positive" ? "open" :
                    "balanced"
    };
}